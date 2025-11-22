// View de Aulas
export default async function aulas(container) {
    container.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Planejamento de Aulas</h2>
                <button class="btn btn-primary" data-action="nova-aula">
                    <i class="bi bi-plus-circle"></i> Nova Aula
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <select class="form-select" id="filtro-aluno">
                                <option value="">Todos os alunos</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <select class="form-select" id="filtro-status">
                                <option value="">Todos os status</option>
                                <option value="agendada">Agendada</option>
                                <option value="realizada">Realizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>
                    <div id="aulas-list">Carregando...</div>
                </div>
            </div>
        </div>
        
        <!-- Modal para criar/editar aula -->
        <div class="modal fade" id="aulaModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="aulaModalTitle">Nova Aula</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="aulaForm">
                            <input type="hidden" id="aula-id">
                            <div class="mb-3">
                                <label class="form-label">Aluno *</label>
                                <select class="form-select" id="aula-aluno-id" required>
                                    <option value="">Selecione um aluno</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Data e Hora *</label>
                                <input type="datetime-local" class="form-control" id="aula-data" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Duração (minutos)</label>
                                <input type="number" class="form-control" id="aula-duracao" value="60" min="15" step="15">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Conteúdo</label>
                                <textarea class="form-control" id="aula-conteudo" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-select" id="aula-status">
                                    <option value="AGENDADA">Agendada</option>
                                    <option value="REALIZADA">Realizada</option>
                                    <option value="CANCELADA">Cancelada</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Observações</label>
                                <textarea class="form-control" id="aula-observacoes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-action="salvar-aula">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let aulasData = [];
    let alunosData = [];
    let modal = null;

    if (typeof bootstrap !== 'undefined') {
        modal = new bootstrap.Modal(document.getElementById('aulaModal'));
    }

    async function carregarDados() {
        try {
            [aulasData, alunosData] = await Promise.all([
                api.getAulas(),
                api.getAlunos()
            ]);
            
            // Popular select de alunos
            const selectAluno = document.getElementById('aula-aluno-id');
            const selectFiltro = document.getElementById('filtro-aluno');
            alunosData.forEach(aluno => {
                const option1 = document.createElement('option');
                option1.value = aluno.id;
                option1.textContent = aluno.nome;
                selectAluno.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = aluno.id;
                option2.textContent = aluno.nome;
                selectFiltro.appendChild(option2);
            });
            
            renderizarAulas(aulasData);
        } catch (error) {
            document.getElementById('aulas-list').innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
        }
    }

    function renderizarAulas(aulas) {
        if (aulas.length === 0) {
            document.getElementById('aulas-list').innerHTML = '<p class="text-muted">Nenhuma aula cadastrada</p>';
            return;
        }

        const html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th>Data/Hora</th>
                            <th>Duração</th>
                            <th>Status</th>
                            <th>Conteúdo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aulas.map(aula => `
                            <tr>
                                <td><strong>${aula.aluno_nome}</strong></td>
                                <td>${new Date(aula.data_aula).toLocaleString('pt-BR')}</td>
                                <td>${aula.duracao} min</td>
                                <td><span class="badge bg-${getStatusColor(aula.status)}">${aula.status}</span></td>
                                <td>${aula.conteudo ? (aula.conteudo.length > 50 ? aula.conteudo.substring(0, 50) + '...' : aula.conteudo) : '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" data-action="editar-aula" data-id="${aula.id}">Editar</button>
                                    <button class="btn btn-sm btn-outline-danger" data-action="deletar-aula" data-id="${aula.id}">Deletar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('aulas-list').innerHTML = html;
    }

    function getStatusColor(status) {
        const colors = {
            'agendada': 'primary',
            'realizada': 'success',
            'cancelada': 'danger'
        };
        return colors[status] || 'secondary';
    }

    // Filtros
    document.getElementById('filtro-aluno').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);

    function aplicarFiltros() {
        const alunoId = document.getElementById('filtro-aluno').value;
        const status = document.getElementById('filtro-status').value;
        
        let filtradas = aulasData;
        if (alunoId) {
            filtradas = filtradas.filter(a => a.aluno_id === parseInt(alunoId));
        }
        if (status) {
            filtradas = filtradas.filter(a => a.status === status);
        }
        renderizarAulas(filtradas);
    }

    // Event listeners
    container.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const id = e.target.getAttribute('data-id');

        if (action === 'nova-aula') {
            document.getElementById('aulaModalTitle').textContent = 'Nova Aula';
            document.getElementById('aulaForm').reset();
            document.getElementById('aula-id').value = '';
            document.getElementById('aula-duracao').value = '60';
            modal.show();
        } else if (action === 'editar-aula') {
            const aula = aulasData.find(a => a.id === parseInt(id));
            if (aula) {
                document.getElementById('aulaModalTitle').textContent = 'Editar Aula';
                document.getElementById('aula-id').value = aula.id;
                document.getElementById('aula-aluno-id').value = aula.aluno_id;
                const dataAula = new Date(aula.data_aula);
                document.getElementById('aula-data').value = dataAula.toISOString().slice(0, 16);
                document.getElementById('aula-duracao').value = aula.duracao;
                document.getElementById('aula-conteudo').value = aula.conteudo || '';
                document.getElementById('aula-status').value = aula.status?.toUpperCase() || 'AGENDADA';
                document.getElementById('aula-observacoes').value = aula.observacoes || '';
                modal.show();
            }
        } else if (action === 'salvar-aula') {
            const formData = {
                aluno_id: parseInt(document.getElementById('aula-aluno-id').value),
                data_aula: document.getElementById('aula-data').value,
                duracao: parseInt(document.getElementById('aula-duracao').value),
                conteudo: document.getElementById('aula-conteudo').value,
                status: document.getElementById('aula-status').value,
                observacoes: document.getElementById('aula-observacoes').value
            };

            try {
                const id = document.getElementById('aula-id').value;
                if (id) {
                    await api.updateAula(id, formData);
                } else {
                    await api.createAula(formData);
                }
                modal.hide();
                carregarDados();
            } catch (error) {
                alert('Erro ao salvar aula: ' + error.message);
            }
        } else if (action === 'deletar-aula') {
            if (confirm('Tem certeza que deseja deletar esta aula?')) {
                try {
                    await api.deleteAula(id);
                    carregarDados();
                } catch (error) {
                    alert('Erro ao deletar aula: ' + error.message);
                }
            }
        }
    });

    carregarDados();
}



