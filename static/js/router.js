// Sistema de roteamento SPA
class Router {
    constructor() {
        this.routes = {};
        this.currentView = null;
        this.init();
    }

    init() {
        // Mapear rotas para views
        this.routes = {
            '/': () => this.showView('dashboard'),
            '/alunos': () => this.showView('alunos'),
            '/aulas': () => this.showView('aulas'),
            '/contratos': () => this.showView('contratos'),
            '/lista-espera': () => this.showView('lista-espera'),
            '/relatorios': () => this.showView('relatorios')
        };

        // Escutar mudanças na hash
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Escutar cliques em links de navegação
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Rota inicial
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.routes[hash] || this.routes['/'];
        
        if (route) {
            route();
        } else {
            this.showView('dashboard');
        }
    }

    navigate(route) {
        window.location.hash = route;
    }

    showView(viewName) {
        // Atualizar navegação ativa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-route="${window.location.hash.slice(1) || '/'}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Carregar view correspondente
        const container = document.getElementById('main-content');
        if (!container) return;

        // Limpar conteúdo anterior
        container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div></div>';

        // Importar e executar view dinamicamente
        const viewPath = `./static/js/views/${viewName}.js`;
        import(viewPath)
            .then(module => {
                if (module.default && typeof module.default === 'function') {
                    module.default(container);
                } else {
                    console.error('View não exportada corretamente:', viewName);
                    container.innerHTML = `
                        <div class="alert alert-danger">
                            <h4>Erro ao carregar página</h4>
                            <p>View não encontrada ou mal formatada</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Erro ao carregar view:', error);
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <h4>Erro ao carregar página</h4>
                        <p>${error.message}</p>
                        <p><small>Verifique o console para mais detalhes</small></p>
                    </div>
                `;
            });
    }

    getCurrentRoute() {
        return window.location.hash.slice(1) || '/';
    }
}

// Inicializar router quando DOM estiver pronto
// Aguardar que api e localStorage estejam disponíveis
let router;
function initRouter() {
    // Verificar se api está disponível
    if (typeof window.api === 'undefined') {
        setTimeout(initRouter, 100);
        return;
    }
    router = new Router();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}

