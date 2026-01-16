// Sistema de backup e restauração de dados
class BackupManager {
    constructor() {
        // Aguardar api estar disponível
        this.api = null;
        setTimeout(() => {
            this.api = window.api;
        }, 100);
    }

    async exportData() {
        try {
            let data;
            if (window.localStorage && window.localStorage.db) {
                // Usar localStorage
                data = await window.localStorage.exportData();
            } else {
                // Tentar usar API
                const alunos = await this.api.getAlunos();
                const aulas = await this.api.getAulas();
                const contratos = await this.api.getContratos();
                const listaEspera = await this.api.getListaEspera();
                const relatorios = await this.api.getRelatorios();
                
                data = {
                    alunos,
                    aulas,
                    contratos,
                    listaEspera,
                    relatorios,
                    exportDate: new Date().toISOString()
                };
            }

            // Criar arquivo JSON
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `english-experience-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, message: 'Backup exportado com sucesso!' };
        } catch (error) {
            console.error('Erro ao exportar backup:', error);
            throw new Error('Erro ao exportar backup: ' + error.message);
        }
    }

    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    const dbStorage = window.dbStorage || window.localStorage;
                    if (dbStorage && dbStorage.db) {
                        // Usar dbStorage
                        await dbStorage.importData(data);
                    } else {
                        // Importar via API (se disponível)
                        // Por enquanto, apenas dbStorage
                        throw new Error('Importação via API não implementada. Use o modo offline.');
                    }

                    resolve({ success: true, message: 'Dados importados com sucesso!' });
                } catch (error) {
                    reject(new Error('Erro ao importar dados: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    }

    async clearAllData() {
        if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!')) {
            const dbStorage = window.dbStorage || window.localStorage;
            if (dbStorage && dbStorage.db) {
                await dbStorage.clearAll();
                alert('Todos os dados foram limpos!');
                window.location.reload();
            } else {
                alert('Limpeza de dados não disponível no modo online.');
            }
        }
    }
}

window.backupManager = new BackupManager();

