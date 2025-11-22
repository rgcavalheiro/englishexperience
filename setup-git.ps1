# Script para configurar Git e fazer push inicial

Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Git não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "Por favor, instale o Git de: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Inicializar repositório
if (-not (Test-Path .git)) {
    git init
    Write-Host "Repositório inicializado" -ForegroundColor Green
} else {
    Write-Host "Repositório já inicializado" -ForegroundColor Yellow
}

# Verificar se remoto já existe
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin https://github.com/rgcavalheiro/englishexperience.git
    Write-Host "Remoto 'origin' adicionado" -ForegroundColor Green
} else {
    Write-Host "Remoto 'origin' já existe: $remoteExists" -ForegroundColor Yellow
    git remote set-url origin https://github.com/rgcavalheiro/englishexperience.git
    Write-Host "URL do remoto atualizada" -ForegroundColor Green
}

# Adicionar arquivos
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Fazer commit
Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Sistema de gestão de aulas particulares SPA"

# Renomear branch para main
git branch -M main

# Enviar para o remoto
Write-Host "Enviando para o remoto..." -ForegroundColor Yellow
Write-Host "NOTA: Você pode precisar fazer login no GitHub ou configurar credenciais" -ForegroundColor Cyan
git push -u origin main

Write-Host "Concluído!" -ForegroundColor Green


