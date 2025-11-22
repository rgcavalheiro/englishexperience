// View de Contratos
export default async function contratos(container) {
    container.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Contratos e Documentações</h2>
                <button class="btn btn-primary" data-action="novo-contrato">
                    <i class="bi bi-plus-circle"></i> Novo Documento
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="mb-3">
                        <select class="form-select" id="filtro-aluno-contrato">
                            <option value="">Todos os alunos</option>
                        </select>
                    </div>
                    <div id="contratos-list">Carregando...</div>
                </div>
            </div>
        </div>
        
        <!-- Modal para upload de contrato -->
        <div class="modal fade" id="contratoModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Upload de Documento</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="contratoForm" enctype="multipart/form-data">
                            <div class="mb-3">
                                <label class="form-label">Aluno *</label>
                                <select class="form-select" id="contrato-aluno-id" required>
                                    <option value="">Selecione um aluno</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Tipo de Documento</label>
                                <select class="form-select" id="contrato-tipo">
                                    <option value="contrato">Contrato</option>
                                    <option value="documento">Documento</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Arquivo *</label>
                                <input type="file" class="form-control" id="contrato-arquivo" accept=".pdf,.doc,.docx,.txt" required>
                                <small class="form-text text-muted">Formatos permitidos: PDF, DOC, DOCX, TXT (máx. 16MB)</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Observações</label>
                                <textarea class="form-control" id="contrato-observacoes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-action="salvar-contrato">Upload</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let contratosData = [];
    let alunosData = [];
    let modal = null;

    if (typeof bootstrap !== 'undefined') {
        modal = new bootstrap.Modal(document.getElementById('contratoModal'));
    }

    async function carregarDados() {
        try {
            [contratosData, alunosData] = await Promise.all([
                api.getContratos(),
                api.getAlunos()
            ]);
            
            // Popular selects
            const selectModal = document.getElementById('contrato-aluno-id');
            const selectFiltro = document.getElementById('filtro-aluno-contrato');
            alunosData.forEach(aluno => {
                const option1 = document.createElement('option');
                option1.value = aluno.id;
                option1.textContent = aluno.nome;
                selectModal.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = aluno.id;
                option2.textContent = aluno.nome;
                selectFiltro.appendChild(option2);
            });
            
            renderizarContratos(contratosData);
        } catch (error) {
            document.getElementById('contratos-list').innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
        }
    }

    function renderizarContratos(contratos) {
        if (contratos.length === 0) {
            document.getElementById('contratos-list').innerHTML = '<p class="text-muted">Nenhum documento cadastrado</p>';
            return;
        }

        const html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th>Nome do Arquivo</th>
                            <th>Tipo</th>
                            <th>Data Upload</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contratos.map(contrato => `
                            <tr>
                                <td><strong>${contrato.aluno_nome}</strong></td>
                                <td>${contrato.nome_arquivo}</td>
                                <td><span class="badge bg-info">${contrato.tipo_documento}</span></td>
                                <td>${new Date(contrato.data_upload).toLocaleDateString('pt-BR')}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" data-action="download-contrato" data-id="${contrato.id}">Download</button>
                                    <button class="btn btn-sm btn-outline-danger" data-action="deletar-contrato" data-id="${contrato.id}">Deletar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('contratos-list').innerHTML = html;
    }

    // Filtro
    document.getElementById('filtro-aluno-contrato').addEventListener('change', (e) => {
        const alunoId = e.target.value;
        if (alunoId) {
            const filtrados = contratosData.filter(c => c.aluno_id === parseInt(alunoId));
            renderizarContratos(filtrados);
        } else {
            renderizarContratos(contratosData);
        }
    });

    // Event listeners
    container.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const id = e.target.getAttribute('data-id');

        if (action === 'novo-contrato') {
            document.getElementById('contratoForm').reset();
            modal.show();
        } else if (action === 'salvar-contrato') {
            const alunoId = document.getElementById('contrato-aluno-id').value;
            const arquivo = document.getElementById('contrato-arquivo').files[0];
            
            if (!alunoId || !arquivo) {
                alert('Preencha todos os campos obrigatórios');
                return;
            }

            const formData = new FormData();
            formData.append('arquivo', arquivo);
            formData.append('aluno_id', alunoId);
            formData.append('tipo_documento', document.getElementById('contrato-tipo').value);
            formData.append('observacoes', document.getElementById('contrato-observacoes').value);

            try {
                await api.uploadContrato(formData);
                modal.hide();
                carregarDados();
            } catch (error) {
                alert('Erro ao fazer upload: ' + error.message);
            }
        } else if (action === 'download-contrato') {
            api.downloadContrato(id);
        } else if (action === 'deletar-contrato') {
            if (confirm('Tem certeza que deseja deletar este documento?')) {
                try {
                    await api.deleteContrato(id);
                    carregarDados();
                } catch (error) {
                    alert('Erro ao deletar documento: ' + error.message);
                }
            }
        }
    });

    carregarDados();
}



