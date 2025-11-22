// View de Lista de Espera
export default async function listaEspera(container) {
    container.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Lista de Espera</h2>
                <button class="btn btn-primary" data-action="nova-lista-espera">
                    <i class="bi bi-plus-circle"></i> Adicionar à Lista
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div id="lista-espera-content">Carregando...</div>
                </div>
            </div>
        </div>
        
        <!-- Modal para criar/editar lista de espera -->
        <div class="modal fade" id="listaEsperaModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="listaEsperaModalTitle">Adicionar à Lista de Espera</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="listaEsperaForm">
                            <input type="hidden" id="lista-espera-id">
                            <div class="mb-3">
                                <label class="form-label">Nome *</label>
                                <input type="text" class="form-control" id="lista-espera-nome" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="lista-espera-email">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Telefone</label>
                                    <input type="text" class="form-control" id="lista-espera-telefone">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Prioridade (1-10)</label>
                                <input type="number" class="form-control" id="lista-espera-prioridade" min="1" max="10" value="5">
                                <small class="form-text text-muted">10 = maior prioridade</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-select" id="lista-espera-status">
                                    <option value="aguardando">Aguardando</option>
                                    <option value="contatado">Contatado</option>
                                    <option value="convertido">Convertido</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Observações</label>
                                <textarea class="form-control" id="lista-espera-observacoes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-action="salvar-lista-espera">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let listaEsperaData = [];
    let modal = null;

    if (typeof bootstrap !== 'undefined') {
        modal = new bootstrap.Modal(document.getElementById('listaEsperaModal'));
    }

    async function carregarListaEspera() {
        try {
            listaEsperaData = await api.getListaEspera();
            renderizarListaEspera(listaEsperaData);
        } catch (error) {
            document.getElementById('lista-espera-content').innerHTML = `<div class="alert alert-danger">Erro ao carregar lista de espera: ${error.message}</div>`;
        }
    }

    function renderizarListaEspera(lista) {
        const aguardando = lista.filter(l => l.status === 'aguardando');
        const contatados = lista.filter(l => l.status === 'contatado');
        const convertidos = lista.filter(l => l.status === 'convertido');

        if (lista.length === 0) {
            document.getElementById('lista-espera-content').innerHTML = '<p class="text-muted">Lista de espera vazia</p>';
            return;
        }

        const html = `
            <ul class="nav nav-tabs mb-3" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#aguardando">
                        Aguardando <span class="badge bg-warning">${aguardando.length}</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#contatados">
                        Contatados <span class="badge bg-info">${contatados.length}</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#convertidos">
                        Convertidos <span class="badge bg-success">${convertidos.length}</span>
                    </button>
                </li>
            </ul>
            
            <div class="tab-content">
                <div class="tab-pane fade show active" id="aguardando">
                    ${renderizarTabela(aguardando)}
                </div>
                <div class="tab-pane fade" id="contatados">
                    ${renderizarTabela(contatados)}
                </div>
                <div class="tab-pane fade" id="convertidos">
                    ${renderizarTabela(convertidos)}
                </div>
            </div>
        `;
        document.getElementById('lista-espera-content').innerHTML = html;
    }

    function renderizarTabela(lista) {
        if (lista.length === 0) {
            return '<p class="text-muted">Nenhum registro nesta categoria</p>';
        }

        return `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Prioridade</th>
                            <th>Data Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lista.map(item => `
                            <tr>
                                <td><strong>${item.nome}</strong></td>
                                <td>${item.email || '-'}</td>
                                <td>${item.telefone || '-'}</td>
                                <td>
                                    <span class="badge bg-${item.prioridade >= 8 ? 'danger' : item.prioridade >= 5 ? 'warning' : 'secondary'}">
                                        ${item.prioridade}/10
                                    </span>
                                </td>
                                <td>${new Date(item.data_cadastro).toLocaleDateString('pt-BR')}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" data-action="editar-lista-espera" data-id="${item.id}">Editar</button>
                                    ${item.status === 'aguardando' ? `
                                        <button class="btn btn-sm btn-outline-success" data-action="ativar-lista-espera" data-id="${item.id}">Ativar</button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-outline-danger" data-action="deletar-lista-espera" data-id="${item.id}">Deletar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Event listeners
    container.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const id = e.target.getAttribute('data-id');

        if (action === 'nova-lista-espera') {
            document.getElementById('listaEsperaModalTitle').textContent = 'Adicionar à Lista de Espera';
            document.getElementById('listaEsperaForm').reset();
            document.getElementById('lista-espera-id').value = '';
            document.getElementById('lista-espera-prioridade').value = '5';
            modal.show();
        } else if (action === 'editar-lista-espera') {
            const item = listaEsperaData.find(l => l.id === parseInt(id));
            if (item) {
                document.getElementById('listaEsperaModalTitle').textContent = 'Editar Lista de Espera';
                document.getElementById('lista-espera-id').value = item.id;
                document.getElementById('lista-espera-nome').value = item.nome || '';
                document.getElementById('lista-espera-email').value = item.email || '';
                document.getElementById('lista-espera-telefone').value = item.telefone || '';
                document.getElementById('lista-espera-prioridade').value = item.prioridade;
                document.getElementById('lista-espera-status').value = item.status;
                document.getElementById('lista-espera-observacoes').value = item.observacoes || '';
                modal.show();
            }
        } else if (action === 'salvar-lista-espera') {
            const formData = {
                nome: document.getElementById('lista-espera-nome').value,
                email: document.getElementById('lista-espera-email').value,
                telefone: document.getElementById('lista-espera-telefone').value,
                prioridade: parseInt(document.getElementById('lista-espera-prioridade').value),
                status: document.getElementById('lista-espera-status').value,
                observacoes: document.getElementById('lista-espera-observacoes').value
            };

            try {
                const id = document.getElementById('lista-espera-id').value;
                if (id) {
                    await api.updateListaEspera(id, formData);
                } else {
                    await api.addListaEspera(formData);
                }
                modal.hide();
                carregarListaEspera();
            } catch (error) {
                alert('Erro ao salvar: ' + error.message);
            }
        } else if (action === 'ativar-lista-espera') {
            if (confirm('Converter esta pessoa em aluno ativo?')) {
                try {
                    await api.ativarListaEspera(id);
                    alert('Pessoa convertida para aluno com sucesso!');
                    carregarListaEspera();
                } catch (error) {
                    alert('Erro ao ativar: ' + error.message);
                }
            }
        } else if (action === 'deletar-lista-espera') {
            if (confirm('Tem certeza que deseja deletar este registro?')) {
                try {
                    await api.deleteListaEspera(id);
                    carregarListaEspera();
                } catch (error) {
                    alert('Erro ao deletar: ' + error.message);
                }
            }
        }
    });

    carregarListaEspera();
}



