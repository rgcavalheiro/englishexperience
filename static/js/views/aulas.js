// View de Aulas
export default async function aulas(container) {
    container.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Planejamento de Aulas</h2>
                <div class="d-flex align-items-center gap-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="toggle-visualizacao" role="switch">
                        <label class="form-check-label" for="toggle-visualizacao">
                            <i class="bi bi-calendar-week"></i> Calendário
                        </label>
                    </div>
                    <button class="btn btn-outline-primary me-2" id="btn-google-calendar" data-action="google-calendar">
                        <i class="bi bi-calendar-check"></i> <span id="google-status-text">Conectar Google Calendar</span>
                    </button>
                    <button class="btn btn-primary" data-action="nova-aula">
                        <i class="bi bi-plus-circle"></i> Nova Aula
                    </button>
                </div>
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
                        <div class="col-md-4" id="controles-calendario" style="display: none;">
                            <div class="d-flex gap-2 align-items-center">
                                <button class="btn btn-sm btn-outline-secondary" id="btn-semana-anterior">
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                                <span id="semana-atual" class="fw-bold"></span>
                                <button class="btn btn-sm btn-outline-secondary" id="btn-semana-proxima">
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary" id="btn-hoje">
                                    Hoje
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="aulas-list">Carregando...</div>
                    <div id="aulas-calendario" style="display: none;"></div>
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
                            <input type="hidden" id="aula-tem-grupo" value="false">
                            <div class="mb-3" id="div-atualizar-grupo" style="display: none;">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="aula-atualizar-grupo">
                                    <label class="form-check-label" for="aula-atualizar-grupo">
                                        <strong>Atualizar todas as aulas relacionadas</strong>
                                    </label>
                                    <small class="form-text text-muted d-block">
                                        Se marcado, o conteúdo será atualizado em todas as aulas do mesmo grupo (mesmos dias da semana e horário)
                                    </small>
                                </div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="aula-repetir-semanal">
                                    <label class="form-check-label" for="aula-repetir-semanal">
                                        Repetir semanalmente
                                    </label>
                                </div>
                            </div>
                            <div id="div-repeticao-opcoes" style="display: none;">
                                <div class="mb-3">
                                    <label class="form-label">Frequência semanal</label>
                                    <select class="form-select" id="aula-frequencia-semanal">
                                        <option value="1">1x por semana</option>
                                        <option value="2">2x por semana</option>
                                        <option value="3">3x por semana</option>
                                        <option value="4">4x por semana</option>
                                        <option value="5">5x por semana</option>
                                    </select>
                                </div>
                                <div class="mb-3" id="div-dias-semana" style="display: none;">
                                    <label class="form-label">Dias da semana</label>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="dia-segunda" value="0">
                                                <label class="form-check-label" for="dia-segunda">Segunda-feira</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="dia-terca" value="1">
                                                <label class="form-check-label" for="dia-terca">Terça-feira</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="dia-quarta" value="2">
                                                <label class="form-check-label" for="dia-quarta">Quarta-feira</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="dia-quinta" value="3">
                                                <label class="form-check-label" for="dia-quinta">Quinta-feira</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="dia-sexta" value="4">
                                                <label class="form-check-label" for="dia-sexta">Sexta-feira</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="dia-sabado" value="5">
                                                <label class="form-check-label" for="dia-sabado">Sábado</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="dia-domingo" value="6">
                                                <label class="form-check-label" for="dia-domingo">Domingo</label>
                                            </div>
                                        </div>
                                    </div>
                                    <small class="form-text text-muted">Selecione os dias da semana para as aulas</small>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Número de semanas</label>
                                    <input type="number" class="form-control" id="aula-num-semanas" value="4" min="1" max="52">
                                    <small class="form-text text-muted">Quantas semanas a aula será repetida</small>
                                </div>
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
    let visualizacaoCalendario = false;
    let semanaAtual = new Date(); // Data da semana sendo exibida

    if (typeof bootstrap !== 'undefined') {
        modal = new bootstrap.Modal(document.getElementById('aulaModal'));
    }

    async function verificarGoogleCalendar() {
        try {
            const status = await api.googleStatus();
            const btn = document.getElementById('btn-google-calendar');
            const statusText = document.getElementById('google-status-text');
            
            if (!btn || !statusText) return;
            
            if (status.connected) {
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-success');
                statusText.textContent = 'Google Calendar Conectado';
                btn.setAttribute('data-action', 'google-disconnect');
            } else {
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-primary');
                statusText.textContent = 'Conectar Google Calendar';
                btn.setAttribute('data-action', 'google-calendar');
            }
        } catch (error) {
            console.error('Erro ao verificar status do Google Calendar:', error);
        }
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
            
            if (visualizacaoCalendario) {
                renderizarCalendario(aulasData);
            } else {
                renderizarAulas(aulasData);
            }
            
            // Verificar status do Google Calendar
            await verificarGoogleCalendar();
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
        if (visualizacaoCalendario) {
            renderizarCalendario(filtradas);
        } else {
            renderizarAulas(filtradas);
        }
    }
    
    function renderizarCalendario(aulas) {
        // Calcular início da semana (segunda-feira)
        const inicioSemana = new Date(semanaAtual);
        const diaSemana = inicioSemana.getDay();
        const diff = inicioSemana.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); // Ajustar para segunda-feira
        inicioSemana.setDate(diff);
        inicioSemana.setHours(0, 0, 0, 0);
        
        // Calcular fim da semana (domingo)
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(fimSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);
        
        // Filtrar aulas da semana
        const aulasSemana = aulas.filter(aula => {
            const dataAula = new Date(aula.data_aula);
            return dataAula >= inicioSemana && dataAula <= fimSemana;
        });
        
        // Agrupar aulas por dia
        const aulasPorDia = {};
        const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(dia.getDate() + i);
            const diaKey = dia.toISOString().split('T')[0];
            aulasPorDia[diaKey] = aulasSemana.filter(aula => {
                const dataAula = new Date(aula.data_aula);
                return dataAula.toISOString().split('T')[0] === diaKey;
            });
        }
        
        // Atualizar texto da semana
        const opcoes = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const dataInicio = inicioSemana.toLocaleDateString('pt-BR', opcoes);
        const dataFim = fimSemana.toLocaleDateString('pt-BR', opcoes);
        document.getElementById('semana-atual').textContent = `${dataInicio} - ${dataFim}`;
        
        // Renderizar calendário
        let html = '<div class="table-responsive"><table class="table table-bordered">';
        html += '<thead><tr>';
        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(dia.getDate() + i);
            const diaNome = diasSemana[i];
            const diaNum = dia.getDate();
            const mesNome = dia.toLocaleDateString('pt-BR', { month: 'short' });
            html += `<th class="text-center" style="width: 14.28%;">
                <div class="fw-bold">${diaNome}</div>
                <div class="text-muted small">${diaNum} ${mesNome}</div>
            </th>`;
        }
        html += '</tr></thead><tbody><tr>';
        
        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(dia.getDate() + i);
            const diaKey = dia.toISOString().split('T')[0];
            const aulasDia = aulasPorDia[diaKey] || [];
            
            html += '<td style="height: 400px; vertical-align: top; padding: 8px;">';
            html += '<div class="d-flex flex-column gap-2">';
            
            if (aulasDia.length === 0) {
                html += '<div class="text-muted text-center small mt-2">Sem aulas</div>';
            } else {
                aulasDia.sort((a, b) => {
                    const horaA = new Date(a.data_aula).getHours();
                    const horaB = new Date(b.data_aula).getHours();
                    return horaA - horaB;
                });
                
                aulasDia.forEach(aula => {
                    const dataAula = new Date(aula.data_aula);
                    const hora = dataAula.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const statusClass = {
                        'agendada': 'primary',
                        'realizada': 'success',
                        'cancelada': 'danger'
                    }[aula.status?.toLowerCase()] || 'secondary';
                    
                    html += `<div class="card border-${statusClass} shadow-sm" style="cursor: pointer;" 
                        data-action="editar-aula" data-id="${aula.id}">
                        <div class="card-body p-2">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <div class="fw-bold small">${hora}</div>
                                    <div class="small">${aula.aluno_nome || 'Sem aluno'}</div>
                                    ${aula.conteudo ? `<div class="text-muted small mt-1" style="font-size: 0.75rem;">${aula.conteudo.substring(0, 30)}${aula.conteudo.length > 30 ? '...' : ''}</div>` : ''}
                                </div>
                                <span class="badge bg-${statusClass}">${aula.status || 'Agendada'}</span>
                            </div>
                        </div>
                    </div>`;
                });
            }
            
            html += '</div></td>';
        }
        
        html += '</tr></tbody></table></div>';
        
        document.getElementById('aulas-calendario').innerHTML = html;
    }

    // Event listeners
    container.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const id = e.target.getAttribute('data-id');

        if (action === 'google-calendar') {
            try {
                const response = await api.googleAuthorize();
                if (response.authorization_url) {
                    window.location.href = response.authorization_url;
                }
            } catch (error) {
                alert('Erro ao conectar com Google Calendar: ' + error.message);
            }
        } else if (action === 'google-disconnect') {
            if (confirm('Deseja desconectar o Google Calendar?')) {
                try {
                    await api.googleDisconnect();
                    await verificarGoogleCalendar();
                    alert('Google Calendar desconectado com sucesso');
                } catch (error) {
                    alert('Erro ao desconectar: ' + error.message);
                }
            }
        } else if (action === 'nova-aula') {
            document.getElementById('aulaModalTitle').textContent = 'Nova Aula';
            document.getElementById('aulaForm').reset();
            document.getElementById('aula-id').value = '';
            document.getElementById('aula-duracao').value = '60';
            document.getElementById('aula-repetir-semanal').checked = false;
            document.getElementById('div-repeticao-opcoes').style.display = 'none';
            document.getElementById('div-dias-semana').style.display = 'none';
            document.getElementById('aula-frequencia-semanal').value = '1';
            document.getElementById('aula-num-semanas').value = '4';
            // Limpar checkboxes dos dias
            ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].forEach(dia => {
                const checkbox = document.getElementById(`dia-${dia}`);
                if (checkbox) checkbox.checked = false;
            });
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
                document.getElementById('aula-repetir-semanal').checked = false;
                document.getElementById('div-repeticao-opcoes').style.display = 'none';
                document.getElementById('div-dias-semana').style.display = 'none';
                
                // Verificar se a aula pertence a um grupo
                const temGrupo = aula.grupo_aula_id ? true : false;
                document.getElementById('aula-tem-grupo').value = temGrupo ? 'true' : 'false';
                document.getElementById('div-atualizar-grupo').style.display = temGrupo ? 'block' : 'none';
                document.getElementById('aula-atualizar-grupo').checked = false;
                
                modal.show();
            }
        } else if (action === 'salvar-aula') {
            const repetirSemanal = document.getElementById('aula-repetir-semanal').checked;
            const frequenciaSemanal = repetirSemanal ? parseInt(document.getElementById('aula-frequencia-semanal').value) : 1;
            
            // Coletar dias selecionados se frequência > 1
            const diasSelecionados = [];
            if (repetirSemanal && frequenciaSemanal > 1) {
                ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].forEach(dia => {
                    const checkbox = document.getElementById(`dia-${dia}`);
                    if (checkbox && checkbox.checked) {
                        diasSelecionados.push(parseInt(checkbox.value));
                    }
                });
            }
            
            const formData = {
                aluno_id: parseInt(document.getElementById('aula-aluno-id').value),
                data_aula: document.getElementById('aula-data').value,
                duracao: parseInt(document.getElementById('aula-duracao').value),
                conteudo: document.getElementById('aula-conteudo').value,
                status: document.getElementById('aula-status').value,
                observacoes: document.getElementById('aula-observacoes').value,
                repetir_semanal: repetirSemanal,
                frequencia_semanal: frequenciaSemanal,
                dias_semana: diasSelecionados,
                num_semanas: repetirSemanal ? parseInt(document.getElementById('aula-num-semanas').value) : 1
            };

            // Validar dias selecionados
            if (repetirSemanal && frequenciaSemanal > 1) {
                if (diasSelecionados.length !== frequenciaSemanal) {
                    alert(`Selecione exatamente ${frequenciaSemanal} dia(s) da semana`);
                    return;
                }
            }

            try {
                const id = document.getElementById('aula-id').value;
                // Adicionar flag para sincronizar com Google Calendar
                formData.sincronizar_google = true;
                
                if (id) {
                    // Edição não permite repetir
                    delete formData.repetir_semanal;
                    delete formData.frequencia_semanal;
                    delete formData.dias_semana;
                    delete formData.num_semanas;
                    
                    // Verificar se deve atualizar grupo
                    const temGrupo = document.getElementById('aula-tem-grupo').value === 'true';
                    const atualizarGrupo = document.getElementById('aula-atualizar-grupo').checked;
                    formData.atualizar_grupo = temGrupo && atualizarGrupo;
                    
                    const response = await api.updateAula(id, formData);
                    if (response.total_atualizadas && response.total_atualizadas > 1) {
                        alert(`${response.total_atualizadas} aulas atualizadas com sucesso!`);
                    }
                } else {
                    const response = await api.createAula(formData);
                    if (response.total && response.total > 1) {
                        alert(`${response.total} aulas criadas com sucesso!`);
                    }
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

    // Toggle de visualização
    document.getElementById('toggle-visualizacao').addEventListener('change', (e) => {
        visualizacaoCalendario = e.target.checked;
        const divLista = document.getElementById('aulas-list');
        const divCalendario = document.getElementById('aulas-calendario');
        const controlesCalendario = document.getElementById('controles-calendario');
        
        if (visualizacaoCalendario) {
            divLista.style.display = 'none';
            divCalendario.style.display = 'block';
            controlesCalendario.style.display = 'block';
            renderizarCalendario(aulasData);
        } else {
            divLista.style.display = 'block';
            divCalendario.style.display = 'none';
            controlesCalendario.style.display = 'none';
            renderizarAulas(aulasData);
        }
    });
    
    // Controles de navegação do calendário
    document.getElementById('btn-semana-anterior').addEventListener('click', () => {
        semanaAtual.setDate(semanaAtual.getDate() - 7);
        renderizarCalendario(aulasData);
    });
    
    document.getElementById('btn-semana-proxima').addEventListener('click', () => {
        semanaAtual.setDate(semanaAtual.getDate() + 7);
        renderizarCalendario(aulasData);
    });
    
    document.getElementById('btn-hoje').addEventListener('click', () => {
        semanaAtual = new Date();
        renderizarCalendario(aulasData);
    });
    
    // Event listeners para mostrar/ocultar campos de repetição
    container.addEventListener('change', (e) => {
        if (e.target.id === 'aula-repetir-semanal') {
            const divOpcoes = document.getElementById('div-repeticao-opcoes');
            if (divOpcoes) {
                divOpcoes.style.display = e.target.checked ? 'block' : 'none';
            }
        }
        
        if (e.target.id === 'aula-frequencia-semanal') {
            const divDias = document.getElementById('div-dias-semana');
            const frequencia = parseInt(e.target.value);
            if (divDias) {
                divDias.style.display = frequencia > 1 ? 'block' : 'none';
            }
            
            // Se frequência for 1x, limpar seleção de dias
            if (frequencia === 1) {
                ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].forEach(dia => {
                    document.getElementById(`dia-${dia}`).checked = false;
                });
            }
        }
    });

    carregarDados();
    
    // Verificar se veio do callback do Google
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('google_connected') === 'true') {
        setTimeout(async () => {
            await verificarGoogleCalendar();
            alert('Google Calendar conectado com sucesso! As aulas serão sincronizadas automaticamente.');
            // Limpar parâmetro da URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }, 500);
    }
}



