# Instruções para Instalação e Execução

## Problema Identificado

O Python não está instalado corretamente no sistema. O comando `python` está redirecionando para a Microsoft Store.

## Soluções

### Opção 1: Instalar Python do site oficial (Recomendado)

1. Acesse: https://www.python.org/downloads/
2. Baixe a versão mais recente do Python 3.x
3. Durante a instalação, **marque a opção "Add Python to PATH"**
4. Após instalação, reinicie o terminal/PowerShell
5. Verifique com: `python --version`

### Opção 2: Usar Python já instalado

Se você já tem Python instalado em outro local, informe o caminho completo para atualizarmos os scripts.

### Opção 3: Usar Anaconda/Miniconda

Se você usa Anaconda:
```powershell
conda activate base
python app.py
```

## Após Instalação

1. Instale as dependências:
```powershell
pip install -r requirements.txt
```

2. Execute o servidor:
```powershell
python app.py
```

3. Acesse no navegador: `http://localhost:8000`

## Verificar Instalação

Execute no PowerShell:
```powershell
python --version
pip --version
```

Ambos devem retornar versões sem erros.



