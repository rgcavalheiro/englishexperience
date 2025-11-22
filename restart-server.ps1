# Script para reiniciar o servidor Flask e abrir o navegador

Write-Host "Parando servidor Flask existente..." -ForegroundColor Yellow

# Parar processos Python que possam estar rodando o Flask
Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*python*"
} | ForEach-Object {
    try {
        $proc = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Processo na porta 8000 encerrado" -ForegroundColor Green
        }
    } catch {
        # Ignorar erros
    }
}

# Aguardar um momento
Start-Sleep -Seconds 1

Write-Host "Iniciando servidor Flask..." -ForegroundColor Yellow

# Iniciar servidor em nova janela
Start-Process python -ArgumentList "app.py" -WindowStyle Normal

# Aguardar servidor iniciar
Write-Host "Aguardando servidor iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Abrir navegador
Write-Host "Abrindo navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:8000"

Write-Host "Servidor iniciado e navegador aberto!" -ForegroundColor Green

