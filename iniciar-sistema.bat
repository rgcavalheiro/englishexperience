@echo off
cd /d "%~dp0"
echo Iniciando English Experience...
echo.
start "English Experience - Servidor Flask" cmd /k "python app.py"
timeout /t 4 /nobreak >nul
start http://localhost:8000
echo.
echo Sistema iniciado!
echo Servidor rodando na porta 8000
echo Navegador aberto automaticamente
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul



