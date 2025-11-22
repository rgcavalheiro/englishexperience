# English Experience - Sistema de Gestão de Aulas Particulares

Sistema web SPA (Single Page Application) para gerenciar aulas particulares, alunos, contratos, lista de espera e relatórios.

## Características

- **SPA (Single Page Application)**: Navegação sem recarregamento de página
- **Backend REST API**: Flask com endpoints JSON
- **Frontend JavaScript**: Vanilla JS com roteamento no cliente
- **Banco de Dados**: SQLite
- **Interface Moderna**: Bootstrap 5 com design responsivo

## Módulos

1. **Dashboard**: Visão geral com estatísticas e informações rápidas
2. **Alunos**: Gestão completa de alunos (CRUD)
3. **Aulas**: Planejamento e histórico de aulas
4. **Contratos**: Upload e gestão de documentos
5. **Lista de Espera**: Gerenciamento de interessados
6. **Relatórios**: Geração de relatórios personalizados

## Instalação

### Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Passos

1. Clone ou baixe o repositório

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Execute a aplicação:
```bash
python app.py
```

4. Acesse no navegador:
```
http://localhost:8000
```

## Estrutura do Projeto

```
Englishexperience/
├── app.py                 # Aplicação Flask (API REST)
├── models.py             # Modelos SQLAlchemy
├── database.py           # Configuração do banco
├── config.py            # Configurações
├── requirements.txt     # Dependências Python
├── static/              # Arquivos estáticos
│   ├── css/
│   │   └── style.css    # Estilos customizados
│   ├── js/
│   │   ├── api.js       # Cliente API
│   │   ├── router.js    # Sistema de roteamento
│   │   ├── app.js       # App principal
│   │   └── views/       # Views JavaScript
│   │       ├── dashboard.js
│   │       ├── alunos.js
│   │       ├── aulas.js
│   │       ├── contratos.js
│   │       ├── lista-espera.js
│   │       └── relatorios.js
│   └── uploads/         # Documentos salvos
├── templates/
│   └── index.html       # HTML único (SPA container)
└── README.md
```

## API Endpoints

### Alunos
- `GET /api/alunos` - Listar todos
- `GET /api/alunos/<id>` - Obter aluno
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/<id>` - Atualizar aluno
- `DELETE /api/alunos/<id>` - Deletar aluno

### Aulas
- `GET /api/aulas` - Listar aulas
- `GET /api/aulas?aluno_id=<id>` - Filtrar por aluno
- `POST /api/aulas` - Criar aula
- `PUT /api/aulas/<id>` - Atualizar aula
- `DELETE /api/aulas/<id>` - Deletar aula

### Contratos
- `GET /api/contratos` - Listar contratos
- `POST /api/contratos` - Upload de documento
- `GET /api/contratos/<id>/download` - Download
- `DELETE /api/contratos/<id>` - Deletar

### Lista de Espera
- `GET /api/lista-espera` - Listar
- `POST /api/lista-espera` - Adicionar
- `PUT /api/lista-espera/<id>` - Atualizar
- `POST /api/lista-espera/<id>/ativar` - Converter para aluno
- `DELETE /api/lista-espera/<id>` - Deletar

### Relatórios
- `GET /api/relatorios` - Listar relatórios
- `POST /api/relatorios/gerar` - Gerar relatório
- `GET /api/relatorios/<id>` - Obter relatório

## Uso

### Navegação
- Use o menu superior para navegar entre os módulos
- A navegação é feita sem recarregar a página (SPA)
- Use os botões de ação em cada módulo para criar, editar ou deletar registros

### Criar Aluno
1. Vá para "Alunos"
2. Clique em "Novo Aluno"
3. Preencha o formulário
4. Clique em "Salvar"

### Agendar Aula
1. Vá para "Aulas"
2. Clique em "Nova Aula"
3. Selecione o aluno e preencha os dados
4. Clique em "Salvar"

### Upload de Contrato
1. Vá para "Contratos"
2. Clique em "Novo Documento"
3. Selecione o aluno e o arquivo
4. Clique em "Upload"

### Gerar Relatório
1. Vá para "Relatórios"
2. Clique em "Gerar Relatório"
3. Selecione o aluno e período (opcional)
4. Clique em "Gerar"

## Tecnologias

- **Backend**: Flask, SQLAlchemy, Flask-CORS
- **Frontend**: JavaScript (ES6 Modules), Bootstrap 5
- **Banco de Dados**: SQLite
- **Arquitetura**: REST API + SPA

## Notas

- O banco de dados SQLite será criado automaticamente na primeira execução
- Os arquivos de upload são salvos em `static/uploads/`
- O sistema usa hash-based routing (`#/alunos`, `#/aulas`, etc.)

## Desenvolvimento

Para desenvolvimento, execute com debug ativado:
```bash
python app.py
```

O servidor Flask estará rodando em modo debug na porta 8000.

## Licença

Este projeto é de uso pessoal/educacional.

