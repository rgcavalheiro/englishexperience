// Aplicação principal SPA
// Este arquivo pode ser usado para inicialização global e utilitários

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('English Experience SPA iniciado');
    
    // Configurações globais
    window.app = {
        version: '1.0.0',
        initialized: true
    };
    
    // Utilitários globais
    window.utils = {
        formatDate: (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        },
        
        formatDateTime: (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR');
        },
        
        showAlert: (message, type = 'info') => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.insertBefore(alertDiv, document.body.firstChild);
            
            // Auto-remover após 5 segundos
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    };
});



