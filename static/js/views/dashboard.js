// View do Dashboard
export default async function dashboard(container) {
    container.innerHTML = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard</h2>
                <div class="btn-group">
                    <button class="btn btn-outline-primary" id="btn-export-backup">
                        <i class="bi bi-download"></i> Exportar Backup
                    </button>
                    <button class="btn btn-outline-secondary" id="btn-import-backup">
                        <i class="bi bi-upload"></i> Importar Backup
                    </button>
                    <input type="file" id="file-import" accept=".json" style="display: none;">
                </div>
            </div>
            
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="card text-white bg-primary">
                        <div class="card-body">
                            <h5 class="card-title">Total de Alunos</h5>
                            <h2 id="total-alunos" class="mb-0">-</h2>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card text-white bg-success">
                        <div class="card-body">
                            <h5 class="card-title">Aulas Agendadas</h5>
                            <h2 id="aulas-agendadas" class="mb-0">-</h2>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card text-white bg-warning">
                        <div class="card-body">
                            <h5 class="card-title">Lista de Espera</h5>
                            <h2 id="lista-espera-count" class="mb-0">-</h2>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card text-white bg-info">
                        <div class="card-body">
                            <h5 class="card-title">Contratos</h5>
                            <h2 id="total-contratos" class="mb-0">-</h2>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Próximas Aulas</h5>
                        </div>
                        <div class="card-body">
                            <div id="proximas-aulas">Carregando...</div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Alunos Recentes</h5>
                        </div>
                        <div class="card-body">
                            <div id="alunos-recentes">Carregando...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Carregar dados
    try {
        const [alunos, aulas, listaEspera, contratos] = await Promise.all([
            api.getAlunos(),
            api.getAulas(),
            api.getListaEspera(),
            api.getContratos()
        ]);

        // Atualizar estatísticas
        document.getElementById('total-alunos').textContent = alunos.length;
        document.getElementById('aulas-agendadas').textContent = aulas.filter(a => a.status === 'agendada').length;
        document.getElementById('lista-espera-count').textContent = listaEspera.filter(l => l.status === 'aguardando').length;
        document.getElementById('total-contratos').textContent = contratos.length;

        // Próximas aulas
        const proximasAulas = aulas
            .filter(a => a.status === 'agendada')
            .sort((a, b) => new Date(a.data_aula) - new Date(b.data_aula))
            .slice(0, 5);
        
        const proximasAulasHtml = proximasAulas.length > 0
            ? proximasAulas.map(aula => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <strong>${aula.aluno_nome}</strong><br>
                        <small class="text-muted">${new Date(aula.data_aula).toLocaleString('pt-BR')}</small>
                    </div>
                </div>
            `).join('')
            : '<p class="text-muted">Nenhuma aula agendada</p>';
        
        document.getElementById('proximas-aulas').innerHTML = proximasAulasHtml;

        // Alunos recentes
        const alunosRecentes = alunos
            .sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro))
            .slice(0, 5);
        
        const alunosRecentesHtml = alunosRecentes.length > 0
            ? alunosRecentes.map(aluno => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <strong>${aluno.nome}</strong><br>
                        <small class="text-muted">${aluno.email || 'Sem email'}</small>
                    </div>
                    <span class="badge bg-${aluno.status === 'ativo' ? 'success' : 'secondary'}">${aluno.status}</span>
                </div>
            `).join('')
            : '<p class="text-muted">Nenhum aluno cadastrado</p>';
        
        document.getElementById('alunos-recentes').innerHTML = alunosRecentesHtml;

    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
    }

    // Event listeners para backup
    const btnExport = document.getElementById('btn-export-backup');
    const btnImport = document.getElementById('btn-import-backup');
    const fileInput = document.getElementById('file-import');

    if (btnExport) {
        btnExport.addEventListener('click', async () => {
            try {
                await window.backupManager.exportData();
                alert('Backup exportado com sucesso!');
            } catch (error) {
                alert('Erro ao exportar backup: ' + error.message);
            }
        });
    }

    if (btnImport) {
        btnImport.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await window.backupManager.importData(file);
                    alert('Dados importados com sucesso! Recarregando página...');
                    window.location.reload();
                } catch (error) {
                    alert('Erro ao importar dados: ' + error.message);
                }
            }
        });
    }
}



