# Sistema de Gestão para Aulas Particulares - SPA

## Visão Geral
Sistema web SPA (Single Page Application) desenvolvido em Python Flask (API REST) com frontend JavaScript puro, sem recarregamento de página, navegação gerenciada no cliente.

## Arquitetura SPA

### Backend
- **Flask como API REST**: Todas as rotas retornam JSON
- **CORS habilitado**: Para comunicação frontend-backend
- **Endpoints RESTful**: `/api/alunos`, `/api/aulas`, `/api/contratos`, etc.

### Frontend
- **JavaScript puro (Vanilla JS)**: Sem frameworks pesados
- **Sistema de roteamento no cliente**: Gerenciamento de views/rotas no JS
- **Alternância de views**: Troca de conteúdo sem recarregar página
- **Comunicação via Fetch API**: Todas as requisições via AJAX
- **UI moderna**: Bootstrap 5 para estilização

## Estrutura de Arquivos

```
Englishexperience/
├── app.py                 # Flask API (rotas retornam JSON)
├── models.py             # Modelos SQLAlchemy
├── database.py           # Configuração do banco
├── requirements.txt      # Dependências Python
├── config.py            # Configurações
├── static/              # Arquivos estáticos
│   ├── css/
│   │   └── style.css    # Estilos customizados
│   ├── js/
│   │   ├── app.js       # Aplicação principal SPA
│   │   ├── router.js    # Sistema de roteamento
│   │   ├── views/       # Módulos de views
│   │   │   ├── alunos.js
│   │   │   ├── aulas.js
│   │   │   ├── contratos.js
│   │   │   ├── lista-espera.js
│   │   │   └── relatorios.js
│   │   └── api.js       # Cliente API (fetch wrapper)
│   └── uploads/         # Documentos salvos
├── templates/
│   └── index.html       # HTML único (container SPA)
└── README.md
```

## Sistema de Navegação SPA

### Router.js
- Gerenciamento de rotas no cliente
- Hash-based routing (`#/alunos`, `#/aulas`, etc.) ou History API
- Mapeamento rota → view function
- Navegação programática

### Views
- Cada módulo tem sua view function
- Views renderizam conteúdo dinamicamente no container principal
- Sem recarregamento de página
- Estado mantido no JavaScript

### Estrutura de Views
```javascript
// Exemplo de view
function alunosView() {
    // Buscar dados via API
    // Renderizar HTML dinamicamente
    // Adicionar event listeners
    // Atualizar container principal
}
```

## API REST Endpoints

### Alunos
- `GET /api/alunos` - Listar todos
- `GET /api/alunos/<id>` - Detalhes
- `POST /api/alunos` - Criar
- `PUT /api/alunos/<id>` - Atualizar
- `DELETE /api/alunos/<id>` - Deletar

### Aulas
- `GET /api/aulas` - Listar
- `POST /api/aulas` - Criar
- `PUT /api/aulas/<id>` - Atualizar
- `DELETE /api/aulas/<id>` - Deletar

### Contratos
- `GET /api/contratos` - Listar
- `POST /api/contratos` - Upload
- `GET /api/contratos/<id>/download` - Download
- `DELETE /api/contratos/<id>` - Deletar

### Lista de Espera
- `GET /api/lista-espera` - Listar
- `POST /api/lista-espera` - Adicionar
- `PUT /api/lista-espera/<id>` - Atualizar
- `POST /api/lista-espera/<id>/ativar` - Converter para aluno

### Relatórios
- `GET /api/relatorios` - Listar templates
- `POST /api/relatorios/gerar` - Gerar relatório
- `GET /api/relatorios/<id>/pdf` - Download PDF

## Fluxo de Navegação

1. Usuário acessa `/` → carrega `index.html`
2. JavaScript inicializa router
3. Router detecta rota atual (`#/alunos`)
4. Router chama view correspondente
5. View faz requisição API
6. View renderiza HTML no container
7. Navegação entre views sem recarregar

## Banco de Dados (SQLite)
- Mesma estrutura do plano anterior
- Modelos SQLAlchemy
- Serialização JSON para API

## Funcionalidades Técnicas SPA

1. **Roteamento no Cliente**: Hash routing ou History API
2. **Estado da Aplicação**: Gerenciado no JavaScript
3. **Comunicação Assíncrona**: Todas as requisições via fetch
4. **Renderização Dinâmica**: HTML gerado via JavaScript
5. **Feedback Visual**: Loading states, mensagens de sucesso/erro
6. **Validação**: Tanto no frontend quanto backend

## Dependências

### Backend
- Flask
- Flask-CORS
- SQLAlchemy
- python-dateutil
- reportlab/weasyprint (PDF)

### Frontend
- Bootstrap 5 (CDN)
- JavaScript puro (sem dependências npm)

## Implementação

1. Setup inicial (estrutura, API Flask básica)
2. Sistema de roteamento JavaScript
3. API REST endpoints
4. Views e renderização dinâmica
5. Integração frontend-backend
6. Upload de arquivos (contratos)
7. Geração de relatórios PDF



