# Deploy no GitHub Pages

Este sistema foi adaptado para funcionar no GitHub Pages usando armazenamento local (IndexedDB).

## Como fazer o deploy

1. **Criar repositório no GitHub**
   ```bash
   git remote add origin https://github.com/seu-usuario/englishexperience.git
   git push -u origin main
   ```

2. **Configurar GitHub Pages**
   - Vá em Settings > Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Salve

3. **Aguardar deploy**
   - O GitHub Pages irá fazer o deploy automaticamente
   - A URL será: `https://seu-usuario.github.io/englishexperience/`

## Funcionalidades

### Modo Offline (GitHub Pages)
- ✅ Armazenamento local usando IndexedDB
- ✅ Todas as funcionalidades principais
- ✅ Exportar/Importar backup em JSON
- ✅ Funciona sem servidor

### Modo Online (Flask local)
- ✅ Todas as funcionalidades
- ✅ Integração com Google Calendar (quando configurado)
- ✅ Upload de arquivos

## Backup e Restauração

### Exportar Dados
1. Acesse o Dashboard
2. Clique em "Exportar Backup"
3. Um arquivo JSON será baixado com todos os dados

### Importar Dados
1. Acesse o Dashboard
2. Clique em "Importar Backup"
3. Selecione o arquivo JSON anteriormente exportado
4. Os dados serão restaurados

## Estrutura de Arquivos

```
.
├── templates/
│   └── index.html          # Página principal
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── storage.js      # Sistema de armazenamento local
│       ├── api.js          # Cliente API (com fallback para localStorage)
│       ├── backup.js       # Sistema de backup/restauração
│       ├── app.js
│       ├── router.js
│       └── views/
│           └── ...
├── .github/
│   └── workflows/
│       └── deploy.yml      # Workflow de deploy automático
└── _redirects              # Configuração para SPA
```

## Notas Importantes

1. **Dados Locais**: Os dados são armazenados no navegador (IndexedDB)
2. **Backup Regular**: Faça backups regulares exportando os dados
3. **Limpar Dados**: Use com cuidado - dados limpos não podem ser recuperados
4. **Google Calendar**: Não funciona no modo offline (GitHub Pages)

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

