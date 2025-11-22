# Script para parar o servidor Flask

Write-Host "Parando servidor Flask..." -ForegroundColor Yellow

# Encontrar e parar processos na porta 8000
$connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($connections) {
    $connections | ForEach-Object {
        $pid = $_.OwningProcess
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Processo $pid encerrado" -ForegroundColor Green
        } catch {
            Write-Host "Erro ao encerrar processo $pid" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Nenhum processo encontrado na porta 8000" -ForegroundColor Yellow
}

# Também tentar parar processos Python
Get-Process python -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "Processo Python $($_.Id) encerrado" -ForegroundColor Green
    } catch {
        # Ignorar erros
    }
}

Write-Host "Concluído!" -ForegroundColor Green

