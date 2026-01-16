# Configuração do Google Calendar

## Pré-requisitos

1. Conta Google
2. Acesso ao Google Cloud Console

## Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Anote o ID do projeto

### 2. Habilitar Google Calendar API

1. No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
2. Procure por "Google Calendar API"
3. Clique em "Ativar"

### 3. Criar Credenciais OAuth 2.0

1. Vá em "APIs e Serviços" > "Credenciais"
2. Clique em "Criar credenciais" > "ID do cliente OAuth"
3. Se solicitado, configure a tela de consentimento OAuth:
   - Tipo de usuário: Externo
   - Preencha as informações básicas
   - Adicione seu email como usuário de teste
4. Configure o ID do cliente OAuth:
   - Tipo de aplicativo: Aplicativo da Web
   - Nome: English Experience Calendar
   - URIs de redirecionamento autorizados:
     - `http://localhost:8000/api/google/oauth2callback`
     - (Para produção, adicione a URL do seu servidor)
5. Clique em "Criar"
6. **IMPORTANTE**: Copie o "ID do cliente" e o "Segredo do cliente"

### 4. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente ou configure no `config.py`:

```bash
export GOOGLE_CLIENT_ID="seu-client-id-aqui"
export GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
export GOOGLE_REDIRECT_URI="http://localhost:8000/api/google/oauth2callback"
```

Ou edite o arquivo `config.py` diretamente:

```python
GOOGLE_CLIENT_ID = 'seu-client-id-aqui'
GOOGLE_CLIENT_SECRET = 'seu-client-secret-aqui'
GOOGLE_REDIRECT_URI = 'http://localhost:8000/api/google/oauth2callback'
```

### 5. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 6. Atualizar Banco de Dados

Execute o script para adicionar as novas colunas:

```bash
python atualizar_banco.py
```

Ou reinicie o servidor (o banco será atualizado automaticamente).

## Como Usar

1. Acesse a aba "Aulas" no sistema
2. Clique no botão "Conectar Google Calendar"
3. Faça login com sua conta Google
4. Autorize o acesso ao Google Calendar
5. Você será redirecionado de volta ao sistema
6. Agora, todas as aulas criadas/atualizadas serão sincronizadas automaticamente com seu Google Calendar

## Funcionalidades

- ✅ Criar eventos no Google Calendar ao criar aulas
- ✅ Atualizar eventos quando aulas são modificadas
- ✅ Deletar eventos quando aulas são removidas
- ✅ Status da aula refletido no Google Calendar (cancelada = evento cancelado)
- ✅ Lembretes automáticos (1 dia antes e 1 hora antes)

## Desconectar

Para desconectar o Google Calendar:
1. Vá na aba "Aulas"
2. Clique no botão "Google Calendar Conectado"
3. Confirme a desconexão

## Notas Importantes

- Os eventos são criados no calendário principal (primary) da conta Google
- O sistema armazena tokens de forma segura no banco de dados
- Os tokens são atualizados automaticamente quando expiram
- A sincronização é automática para todas as operações de aulas

