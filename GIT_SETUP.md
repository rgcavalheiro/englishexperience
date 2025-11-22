# Configuração do Git

## Git não encontrado

O Git não está instalado ou não está no PATH do sistema.

## Instalação do Git

### Opção 1: Instalar Git para Windows (Recomendado)

1. Baixe o Git de: https://git-scm.com/download/win
2. Execute o instalador
3. Durante a instalação, certifique-se de marcar "Add Git to PATH"
4. Reinicie o terminal/PowerShell após instalar

### Opção 2: Usar GitHub Desktop

Se você usa GitHub Desktop, o Git já está instalado, mas pode não estar no PATH.

## Após Instalação

Execute os seguintes comandos no PowerShell:

```powershell
# Inicializar repositório
git init

# Adicionar remoto
git remote add origin https://github.com/rgcavalheiro/englishexperience.git

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Initial commit: Sistema de gestão de aulas particulares SPA"

# Renomear branch para main
git branch -M main

# Enviar para o remoto
git push -u origin main
```

## Verificar Instalação

Após instalar, verifique com:
```powershell
git --version
```


