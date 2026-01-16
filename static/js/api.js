// Cliente API para comunicação com o backend ou storage local
// Detectar se está no GitHub Pages (base path)
const isGitHubPages = window.location.hostname.includes('github.io');
const BASE_PATH = isGitHubPages ? '/englishexperience' : '';
const API_BASE_URL = `${BASE_PATH}/api`;
let useLocalStorage = false;

// Verificar se está rodando no GitHub Pages (sem backend)
async function checkBackendAvailable() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Inicializar verificação
checkBackendAvailable().then(available => {
    useLocalStorage = !available;
    if (useLocalStorage) {
        console.log('Usando armazenamento local (IndexedDB)');
        // Garantir que localStorage está inicializado
        if (window.localStorage && !window.localStorage.db) {
            window.localStorage.init();
        }
    } else {
        console.log('Usando backend Flask');
    }
});

class ApiClient {
    async request(endpoint, options = {}) {
        // Se usar localStorage, redirecionar para métodos locais
        if (useLocalStorage) {
            return this.localRequest(endpoint, options);
        }

        // Caso contrário, usar backend
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Se tiver body e não for FormData, transformar em JSON
        if (config.body && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        } else if (config.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Erro ${response.status}`);
            }
            
            return data;
        } catch (error) {
            // Se falhar, tentar usar localStorage como fallback
            if (!useLocalStorage) {
                console.warn('Backend não disponível, usando localStorage');
                useLocalStorage = true;
                if (window.localStorage && !window.localStorage.db) {
                    await window.localStorage.init();
                }
                return this.localRequest(endpoint, options);
            }
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    async localRequest(endpoint, options = {}) {
        if (!window.localStorage || !window.localStorage.db) {
            await window.localStorage.init();
        }

        const method = options.method || 'GET';
        const body = options.body;

        // Mapear endpoints para métodos do localStorage
        if (endpoint === '/alunos') {
            if (method === 'GET') return window.localStorage.getAlunos();
            if (method === 'POST') return window.localStorage.createAluno(body);
        }
        if (endpoint.startsWith('/alunos/')) {
            const id = parseInt(endpoint.split('/')[2]);
            if (method === 'GET') return window.localStorage.getAluno(id);
            if (method === 'PUT') return window.localStorage.updateAluno(id, body);
            if (method === 'DELETE') return window.localStorage.deleteAluno(id);
        }
        if (endpoint === '/aulas') {
            if (method === 'GET') {
                const params = new URLSearchParams(window.location.search);
                const alunoId = params.get('aluno_id');
                return window.localStorage.getAulas(alunoId ? parseInt(alunoId) : null);
            }
            if (method === 'POST') return window.localStorage.createAula(body);
        }
        if (endpoint.startsWith('/aulas/')) {
            const id = parseInt(endpoint.split('/')[2]);
            if (method === 'GET') return window.localStorage.getAula(id);
            if (method === 'PUT') return window.localStorage.updateAula(id, body);
            if (method === 'DELETE') return window.localStorage.deleteAula(id);
        }
        if (endpoint === '/contratos') {
            if (method === 'GET') {
                const params = new URLSearchParams(window.location.search);
                const alunoId = params.get('aluno_id');
                return window.localStorage.getContratos(alunoId ? parseInt(alunoId) : null);
            }
            if (method === 'POST') return window.localStorage.uploadContrato(body);
        }
        if (endpoint.startsWith('/contratos/') && endpoint.endsWith('/download')) {
            const id = parseInt(endpoint.split('/')[2]);
            const contrato = await window.localStorage.getContrato(id);
            if (contrato && contrato.caminho_arquivo) {
                // Para GitHub Pages, retornar dados do arquivo
                return contrato;
            }
            throw new Error('Contrato não encontrado');
        }
        if (endpoint.startsWith('/contratos/')) {
            const id = parseInt(endpoint.split('/')[2]);
            if (method === 'GET') return window.localStorage.getContrato(id);
            if (method === 'DELETE') return window.localStorage.deleteContrato(id);
        }
        if (endpoint === '/lista-espera') {
            if (method === 'GET') return window.localStorage.getListaEspera();
            if (method === 'POST') return window.localStorage.addListaEspera(body);
        }
        if (endpoint.startsWith('/lista-espera/')) {
            const parts = endpoint.split('/');
            const id = parseInt(parts[2]);
            if (parts[3] === 'ativar') {
                // Ativar lista de espera = criar aluno
                const item = await window.localStorage.get('listaEspera', id);
                const aluno = await window.localStorage.createAluno({
                    nome: item.nome,
                    email: item.email,
                    telefone: item.telefone,
                    observacoes: item.observacoes
                });
                await window.localStorage.deleteListaEspera(id);
                return aluno;
            }
            if (method === 'GET') return window.localStorage.get('listaEspera', id);
            if (method === 'PUT') return window.localStorage.updateListaEspera(id, body);
            if (method === 'DELETE') return window.localStorage.deleteListaEspera(id);
        }
        if (endpoint === '/relatorios') {
            if (method === 'GET') {
                const params = new URLSearchParams(window.location.search);
                const alunoId = params.get('aluno_id');
                return window.localStorage.getRelatorios(alunoId ? parseInt(alunoId) : null);
            }
        }
        if (endpoint === '/relatorios/gerar') {
            if (method === 'POST') return window.localStorage.gerarRelatorio(body);
        }
        if (endpoint === '/google/status') {
            return { connected: false, message: 'Google Calendar não disponível em modo offline' };
        }

        throw new Error(`Endpoint não suportado: ${endpoint}`);
    }

    // Alunos
    async getAlunos() {
        return this.request('/alunos');
    }

    async getAluno(id) {
        return this.request(`/alunos/${id}`);
    }

    async createAluno(data) {
        return this.request('/alunos', { method: 'POST', body: data });
    }

    async updateAluno(id, data) {
        return this.request(`/alunos/${id}`, { method: 'PUT', body: data });
    }

    async deleteAluno(id) {
        return this.request(`/alunos/${id}`, { method: 'DELETE' });
    }

    // Aulas
    async getAulas(alunoId = null) {
        const endpoint = alunoId ? `/aulas?aluno_id=${alunoId}` : '/aulas';
        return this.request(endpoint);
    }

    async getAula(id) {
        return this.request(`/aulas/${id}`);
    }

    async createAula(data) {
        return this.request('/aulas', { method: 'POST', body: data });
    }

    async updateAula(id, data) {
        return this.request(`/aulas/${id}`, { method: 'PUT', body: data });
    }

    async deleteAula(id) {
        return this.request(`/aulas/${id}`, { method: 'DELETE' });
    }

    // Contratos
    async getContratos(alunoId = null) {
        const endpoint = alunoId ? `/contratos?aluno_id=${alunoId}` : '/contratos';
        return this.request(endpoint);
    }

    async getContrato(id) {
        return this.request(`/contratos/${id}`);
    }

    async uploadContrato(formData) {
        return this.request('/contratos', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async downloadContrato(id) {
        window.open(`${API_BASE_URL}/contratos/${id}/download`, '_blank');
    }

    async deleteContrato(id) {
        return this.request(`/contratos/${id}`, { method: 'DELETE' });
    }

    // Lista de Espera
    async getListaEspera() {
        return this.request('/lista-espera');
    }

    async getListaEsperaItem(id) {
        return this.request(`/lista-espera/${id}`);
    }

    async addListaEspera(data) {
        return this.request('/lista-espera', { method: 'POST', body: data });
    }

    async updateListaEspera(id, data) {
        return this.request(`/lista-espera/${id}`, { method: 'PUT', body: data });
    }

    async ativarListaEspera(id, data = {}) {
        return this.request(`/lista-espera/${id}/ativar`, { method: 'POST', body: data });
    }

    async deleteListaEspera(id) {
        return this.request(`/lista-espera/${id}`, { method: 'DELETE' });
    }

    // Relatórios
    async getRelatorios(alunoId = null) {
        const endpoint = alunoId ? `/relatorios?aluno_id=${alunoId}` : '/relatorios';
        return this.request(endpoint);
    }

    async getRelatorio(id) {
        return this.request(`/relatorios/${id}`);
    }

    async gerarRelatorio(data) {
        return this.request('/relatorios/gerar', { method: 'POST', body: data });
    }

    // Importação
    async importarAlunos() {
        return this.request('/importar-alunos', { method: 'POST' });
    }

    // Aniversários
    async downloadPlanilhaAniversarios() {
        window.open(`${API_BASE_URL}/aniversarios/planilha`, '_blank');
    }

    // Google Calendar
    async googleAuthorize() {
        return this.request('/google/authorize');
    }

    async googleStatus() {
        return this.request('/google/status');
    }

    async googleDisconnect() {
        return this.request('/google/disconnect', { method: 'POST' });
    }
}

const api = new ApiClient();

// Tornar api disponível globalmente
window.api = api;

