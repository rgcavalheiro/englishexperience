# Script para iniciar o sistema English Experience
# Pode ser executado diretamente ou através de atalho

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  English Experience - Sistema de Gestão" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Python não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Python primeiro." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Parar servidor existente se houver
Write-Host "Verificando servidores existentes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*python*"
} | ForEach-Object {
    try {
        $conn = Get-NetTCPConnection -LocalPort 8000 -OwningProcess $_.Id -ErrorAction SilentlyContinue
        if ($conn) {
            Write-Host "Parando servidor existente (PID: $($_.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    } catch {
        # Ignorar erros
    }
}

# Iniciar servidor Flask
Write-Host "Iniciando servidor Flask..." -ForegroundColor Yellow
Start-Process python -ArgumentList "app.py" -WindowStyle Normal

# Aguardar servidor iniciar
Write-Host "Aguardando servidor iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

# Verificar se servidor está rodando
$serverRunning = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($serverRunning) {
    Write-Host "Servidor iniciado com sucesso!" -ForegroundColor Green
    Write-Host "Abrindo navegador..." -ForegroundColor Yellow
    Start-Process "http://localhost:8000"
    Write-Host ""
    Write-Host "Sistema disponível em: http://localhost:8000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pressione qualquer tecla para fechar esta janela..." -ForegroundColor Cyan
    Write-Host "(O servidor continuará rodando em outra janela)" -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host "ERRO: Servidor não iniciou corretamente!" -ForegroundColor Red
    Write-Host "Verifique se há erros na janela do servidor." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
}



