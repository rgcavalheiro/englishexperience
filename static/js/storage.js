// Sistema de armazenamento local usando IndexedDB
class LocalStorage {
    constructor() {
        this.dbName = 'EnglishExperienceDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Criar object stores
                if (!db.objectStoreNames.contains('alunos')) {
                    const alunosStore = db.createObjectStore('alunos', { keyPath: 'id', autoIncrement: true });
                    alunosStore.createIndex('nome', 'nome', { unique: false });
                }

                if (!db.objectStoreNames.contains('aulas')) {
                    const aulasStore = db.createObjectStore('aulas', { keyPath: 'id', autoIncrement: true });
                    aulasStore.createIndex('aluno_id', 'aluno_id', { unique: false });
                    aulasStore.createIndex('data_aula', 'data_aula', { unique: false });
                }

                if (!db.objectStoreNames.contains('contratos')) {
                    const contratosStore = db.createObjectStore('contratos', { keyPath: 'id', autoIncrement: true });
                    contratosStore.createIndex('aluno_id', 'aluno_id', { unique: false });
                }

                if (!db.objectStoreNames.contains('listaEspera')) {
                    db.createObjectStore('listaEspera', { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains('relatorios')) {
                    const relatoriosStore = db.createObjectStore('relatorios', { keyPath: 'id', autoIncrement: true });
                    relatoriosStore.createIndex('aluno_id', 'aluno_id', { unique: false });
                }
            };
        });
    }

    // Métodos genéricos
    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve({ ...data, id: request.result });
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async query(storeName, indexName, value) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Métodos específicos
    async getAlunos() {
        return this.getAll('alunos');
    }

    async getAluno(id) {
        return this.get('alunos', id);
    }

    async createAluno(data) {
        const aluno = {
            ...data,
            data_cadastro: new Date().toISOString(),
            status: data.status || 'ativo'
        };
        return this.add('alunos', aluno);
    }

    async updateAluno(id, data) {
        const aluno = await this.getAluno(id);
        if (!aluno) throw new Error('Aluno não encontrado');
        const updated = { ...aluno, ...data, id };
        return this.put('alunos', updated);
    }

    async deleteAluno(id) {
        // Deletar aulas relacionadas
        const aulas = await this.query('aulas', 'aluno_id', id);
        for (const aula of aulas) {
            await this.delete('aulas', aula.id);
        }
        return this.delete('alunos', id);
    }

    async getAulas(alunoId = null) {
        if (alunoId) {
            return this.query('aulas', 'aluno_id', alunoId);
        }
        return this.getAll('aulas');
    }

    async getAula(id) {
        return this.get('aulas', id);
    }

    async createAula(data) {
        const aula = {
            ...data,
            data_aula: data.data_aula,
            data_criacao: new Date().toISOString(),
            status: data.status || 'agendada'
        };
        return this.add('aulas', aula);
    }

    async updateAula(id, data) {
        const aula = await this.getAula(id);
        if (!aula) throw new Error('Aula não encontrada');
        const updated = { ...aula, ...data, id };
        return this.put('aulas', updated);
    }

    async deleteAula(id) {
        return this.delete('aulas', id);
    }

    async getContratos(alunoId = null) {
        if (alunoId) {
            return this.query('contratos', 'aluno_id', alunoId);
        }
        return this.getAll('contratos');
    }

    async getContrato(id) {
        return this.get('contratos', id);
    }

    async uploadContrato(data) {
        const contrato = {
            ...data,
            data_upload: new Date().toISOString()
        };
        return this.add('contratos', contrato);
    }

    async deleteContrato(id) {
        return this.delete('contratos', id);
    }

    async getListaEspera() {
        return this.getAll('listaEspera');
    }

    async addListaEspera(data) {
        const item = {
            ...data,
            data_cadastro: new Date().toISOString(),
            status: data.status || 'aguardando'
        };
        return this.add('listaEspera', item);
    }

    async updateListaEspera(id, data) {
        const item = await this.get('listaEspera', id);
        if (!item) throw new Error('Item não encontrado');
        const updated = { ...item, ...data, id };
        return this.put('listaEspera', updated);
    }

    async deleteListaEspera(id) {
        return this.delete('listaEspera', id);
    }

    async getRelatorios(alunoId = null) {
        if (alunoId) {
            return this.query('relatorios', 'aluno_id', alunoId);
        }
        return this.getAll('relatorios');
    }

    async gerarRelatorio(data) {
        const relatorio = {
            ...data,
            data_criacao: new Date().toISOString()
        };
        return this.add('relatorios', relatorio);
    }

    // Exportar todos os dados
    async exportData() {
        const data = {
            alunos: await this.getAlunos(),
            aulas: await this.getAulas(),
            contratos: await this.getContratos(),
            listaEspera: await this.getListaEspera(),
            relatorios: await this.getRelatorios(),
            exportDate: new Date().toISOString()
        };
        return data;
    }

    // Importar dados
    async importData(data) {
        // Limpar dados existentes
        await this.clearAll();

        // Importar dados
        if (data.alunos) {
            for (const aluno of data.alunos) {
                await this.put('alunos', aluno);
            }
        }
        if (data.aulas) {
            for (const aula of data.aulas) {
                await this.put('aulas', aula);
            }
        }
        if (data.contratos) {
            for (const contrato of data.contratos) {
                await this.put('contratos', contrato);
            }
        }
        if (data.listaEspera) {
            for (const item of data.listaEspera) {
                await this.put('listaEspera', item);
            }
        }
        if (data.relatorios) {
            for (const relatorio of data.relatorios) {
                await this.put('relatorios', relatorio);
            }
        }
    }

    async clearAll() {
        const stores = ['alunos', 'aulas', 'contratos', 'listaEspera', 'relatorios'];
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }
}

// Criar instância global
const dbStorage = new LocalStorage();

// Inicializar quando o módulo for carregado
(async () => {
    try {
        await dbStorage.init();
        console.log('IndexedDB inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar IndexedDB:', error);
    }
})();

// Exportar com nome diferente para não conflitar com localStorage nativo
window.dbStorage = dbStorage;
// Manter compatibilidade com código antigo
window.localStorage = dbStorage;

