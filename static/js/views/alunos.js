// View de Alunos
export default async function alunos(container) {
    container.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestão de Alunos</h2>
                <button class="btn btn-primary" data-action="novo-aluno">
                    <i class="bi bi-plus-circle"></i> Novo Aluno
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="busca-aluno" placeholder="Buscar aluno...">
                    </div>
                    <div id="alunos-list">Carregando...</div>
                </div>
            </div>
        </div>
        
        <!-- Modal para criar/editar aluno -->
        <div class="modal fade" id="alunoModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="alunoModalTitle">Novo Aluno</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="alunoForm">
                            <input type="hidden" id="aluno-id">
                            <div class="mb-3">
                                <label class="form-label">Nome *</label>
                                <input type="text" class="form-control" id="aluno-nome" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="aluno-email">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Telefone</label>
                                    <input type="text" class="form-control" id="aluno-telefone">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Data de Nascimento</label>
                                <input type="date" class="form-control" id="aluno-data-nascimento">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Endereço</label>
                                <textarea class="form-control" id="aluno-endereco" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-select" id="aluno-status">
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                    <option value="LISTA_ESPERA">Lista de Espera</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Observações</label>
                                <textarea class="form-control" id="aluno-observacoes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-action="salvar-aluno">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let alunosData = [];
    let modal = null;

    // Inicializar modal Bootstrap
    if (typeof bootstrap !== 'undefined') {
        modal = new bootstrap.Modal(document.getElementById('alunoModal'));
    }

    // Carregar alunos
    async function carregarAlunos() {
        try {
            alunosData = await api.getAlunos();
            renderizarAlunos(alunosData);
        } catch (error) {
            document.getElementById('alunos-list').innerHTML = `<div class="alert alert-danger">Erro ao carregar alunos: ${error.message}</div>`;
        }
    }

    function renderizarAlunos(alunos) {
        if (alunos.length === 0) {
            document.getElementById('alunos-list').innerHTML = '<p class="text-muted">Nenhum aluno cadastrado</p>';
            return;
        }

        const html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alunos.map(aluno => `
                            <tr>
                                <td><strong>${aluno.nome}</strong></td>
                                <td>${aluno.email || '-'}</td>
                                <td>${aluno.telefone || '-'}</td>
                                <td><span class="badge bg-${aluno.status === 'ativo' ? 'success' : 'secondary'}">${aluno.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" data-action="editar-aluno" data-id="${aluno.id}">Editar</button>
                                    <button class="btn btn-sm btn-outline-danger" data-action="deletar-aluno" data-id="${aluno.id}">Deletar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('alunos-list').innerHTML = html;
    }

    // Event listeners
    document.getElementById('busca-aluno').addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = alunosData.filter(aluno => 
            aluno.nome.toLowerCase().includes(termo) ||
            (aluno.email && aluno.email.toLowerCase().includes(termo))
        );
        renderizarAlunos(filtrados);
    });

    container.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const id = e.target.getAttribute('data-id');

        if (action === 'novo-aluno') {
            document.getElementById('alunoModalTitle').textContent = 'Novo Aluno';
            document.getElementById('alunoForm').reset();
            document.getElementById('aluno-id').value = '';
            modal.show();
        } else if (action === 'editar-aluno') {
            const aluno = alunosData.find(a => a.id === parseInt(id));
            if (aluno) {
                document.getElementById('alunoModalTitle').textContent = 'Editar Aluno';
                document.getElementById('aluno-id').value = aluno.id;
                document.getElementById('aluno-nome').value = aluno.nome || '';
                document.getElementById('aluno-email').value = aluno.email || '';
                document.getElementById('aluno-telefone').value = aluno.telefone || '';
                document.getElementById('aluno-data-nascimento').value = aluno.data_nascimento || '';
                document.getElementById('aluno-endereco').value = aluno.endereco || '';
                document.getElementById('aluno-status').value = aluno.status?.toUpperCase() || 'ATIVO';
                document.getElementById('aluno-observacoes').value = aluno.observacoes || '';
                modal.show();
            }
        } else if (action === 'salvar-aluno') {
            const formData = {
                nome: document.getElementById('aluno-nome').value,
                email: document.getElementById('aluno-email').value,
                telefone: document.getElementById('aluno-telefone').value,
                data_nascimento: document.getElementById('aluno-data-nascimento').value || null,
                endereco: document.getElementById('aluno-endereco').value,
                status: document.getElementById('aluno-status').value,
                observacoes: document.getElementById('aluno-observacoes').value
            };

            try {
                const id = document.getElementById('aluno-id').value;
                if (id) {
                    await api.updateAluno(id, formData);
                } else {
                    await api.createAluno(formData);
                }
                modal.hide();
                carregarAlunos();
            } catch (error) {
                alert('Erro ao salvar aluno: ' + error.message);
            }
        } else if (action === 'deletar-aluno') {
            if (confirm('Tem certeza que deseja deletar este aluno?')) {
                try {
                    await api.deleteAluno(id);
                    carregarAlunos();
                } catch (error) {
                    alert('Erro ao deletar aluno: ' + error.message);
                }
            }
        }
    });

    carregarAlunos();
}



