// View de Relatórios
export default async function relatorios(container) {
    container.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Relatórios</h2>
                <button class="btn btn-primary" data-action="gerar-relatorio">
                    <i class="bi bi-file-earmark-pdf"></i> Gerar Relatório
                </button>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <div id="relatorios-list">Carregando...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal para gerar relatório -->
        <div class="modal fade" id="relatorioModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Gerar Relatório Personalizado</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="relatorioForm">
                            <div class="mb-3">
                                <label class="form-label">Título do Relatório *</label>
                                <input type="text" class="form-control" id="relatorio-titulo" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Aluno *</label>
                                <select class="form-select" id="relatorio-aluno-id" required>
                                    <option value="">Selecione um aluno</option>
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Período Início</label>
                                    <input type="date" class="form-control" id="relatorio-periodo-inicio">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Período Fim</label>
                                    <input type="date" class="form-control" id="relatorio-periodo-fim">
                                </div>
                            </div>
                            <div class="alert alert-info">
                                <small>Selecione um período para filtrar as aulas. Deixe em branco para incluir todas as aulas.</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-action="salvar-relatorio">Gerar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal para visualizar relatório -->
        <div class="modal fade" id="visualizarRelatorioModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="visualizarRelatorioTitle">Relatório</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="visualizarRelatorioContent">
                        Carregando...
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let relatoriosData = [];
    let alunosData = [];
    let modalGerar = null;
    let modalVisualizar = null;

    if (typeof bootstrap !== 'undefined') {
        modalGerar = new bootstrap.Modal(document.getElementById('relatorioModal'));
        modalVisualizar = new bootstrap.Modal(document.getElementById('visualizarRelatorioModal'));
    }

    async function carregarDados() {
        try {
            [relatoriosData, alunosData] = await Promise.all([
                api.getRelatorios(),
                api.getAlunos()
            ]);
            
            // Popular select de alunos
            const selectAluno = document.getElementById('relatorio-aluno-id');
            alunosData.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.id;
                option.textContent = aluno.nome;
                selectAluno.appendChild(option);
            });
            
            renderizarRelatorios(relatoriosData);
        } catch (error) {
            document.getElementById('relatorios-list').innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
        }
    }

    function renderizarRelatorios(relatorios) {
        if (relatorios.length === 0) {
            document.getElementById('relatorios-list').innerHTML = '<p class="text-muted">Nenhum relatório gerado</p>';
            return;
        }

        const html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Aluno</th>
                            <th>Período</th>
                            <th>Data Criação</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${relatorios.map(relatorio => `
                            <tr>
                                <td><strong>${relatorio.titulo}</strong></td>
                                <td>${relatorio.aluno_nome}</td>
                                <td>
                                    ${relatorio.periodo_inicio && relatorio.periodo_fim 
                                        ? `${new Date(relatorio.periodo_inicio).toLocaleDateString('pt-BR')} - ${new Date(relatorio.periodo_fim).toLocaleDateString('pt-BR')}`
                                        : 'Todos os períodos'}
                                </td>
                                <td>${new Date(relatorio.data_criacao).toLocaleDateString('pt-BR')}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" data-action="visualizar-relatorio" data-id="${relatorio.id}">Visualizar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('relatorios-list').innerHTML = html;
    }

    function renderizarVisualizacao(dados) {
        const stats = dados.estatisticas;
        const html = `
            <div class="relatorio-visualizacao">
                <h4>${dados.aluno.nome}</h4>
                <hr>
                
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <h6>Total de Aulas</h6>
                                <h3>${stats.total_aulas}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <h6>Aulas Realizadas</h6>
                                <h3>${stats.aulas_realizadas}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body">
                                <h6>Aulas Agendadas</h6>
                                <h3>${stats.aulas_agendadas}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-info text-white">
                            <div class="card-body">
                                <h6>Taxa de Frequência</h6>
                                <h3>${stats.taxa_frequencia.toFixed(1)}%</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h5>Detalhamento de Aulas</h5>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Duração</th>
                                <th>Status</th>
                                <th>Conteúdo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dados.aulas.map(aula => `
                                <tr>
                                    <td>${new Date(aula.data_aula).toLocaleString('pt-BR')}</td>
                                    <td>${aula.duracao} min</td>
                                    <td><span class="badge bg-${aula.status === 'realizada' ? 'success' : aula.status === 'agendada' ? 'primary' : 'danger'}">${aula.status}</span></td>
                                    <td>${aula.conteudo || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        return html;
    }

    // Event listeners
    container.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const id = e.target.getAttribute('data-id');

        if (action === 'gerar-relatorio') {
            document.getElementById('relatorioForm').reset();
            modalGerar.show();
        } else if (action === 'salvar-relatorio') {
            const formData = {
                titulo: document.getElementById('relatorio-titulo').value,
                aluno_id: parseInt(document.getElementById('relatorio-aluno-id').value),
                periodo_inicio: document.getElementById('relatorio-periodo-inicio').value || null,
                periodo_fim: document.getElementById('relatorio-periodo-fim').value || null
            };

            try {
                await api.gerarRelatorio(formData);
                modalGerar.hide();
                carregarDados();
            } catch (error) {
                alert('Erro ao gerar relatório: ' + error.message);
            }
        } else if (action === 'visualizar-relatorio') {
            try {
                const relatorio = await api.getRelatorio(id);
                const dados = JSON.parse(relatorio.conteudo);
                
                document.getElementById('visualizarRelatorioTitle').textContent = relatorio.titulo;
                document.getElementById('visualizarRelatorioContent').innerHTML = renderizarVisualizacao(dados);
                modalVisualizar.show();
            } catch (error) {
                alert('Erro ao carregar relatório: ' + error.message);
            }
        }
    });

    carregarDados();
}



