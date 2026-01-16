// Cliente API para comunicação com o backend
const API_BASE_URL = '/api';

class ApiClient {
    async request(endpoint, options = {}) {
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
            console.error('Erro na requisição:', error);
            throw error;
        }
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
}

const api = new ApiClient();

// Tornar api disponível globalmente
window.api = api;

