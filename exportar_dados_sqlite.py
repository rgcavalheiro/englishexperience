#!/usr/bin/env python3
"""
Script para exportar dados do SQLite para JSON
Use este script para exportar seus dados locais e depois importar no GitHub Pages
"""

from models import Aluno, Aula, Contrato, ListaEspera, Relatorio
from database import db
from app import app
import json
from datetime import datetime

def exportar_dados():
    """Exporta todos os dados do banco SQLite para JSON"""
    with app.app_context():
        # Buscar todos os dados
        alunos = Aluno.query.all()
        aulas = Aula.query.all()
        contratos = Contrato.query.all()
        lista_espera = ListaEspera.query.all()
        relatorios = Relatorio.query.all()
        
        # Converter para dicionários
        dados = {
            'alunos': [aluno_to_dict(aluno) for aluno in alunos],
            'aulas': [aula_to_dict(aula) for aula in aulas],
            'contratos': [contrato_to_dict(contrato) for contrato in contratos],
            'listaEspera': [lista_espera_to_dict(item) for item in lista_espera],
            'relatorios': [relatorio_to_dict(relatorio) for relatorio in relatorios],
            'exportDate': datetime.now().isoformat()
        }
        
        # Salvar em arquivo JSON
        filename = f'backup_sqlite_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(dados, f, indent=2, ensure_ascii=False, default=str)
        
        print(f'✅ Dados exportados com sucesso para: {filename}')
        print(f'   - {len(dados["alunos"])} alunos')
        print(f'   - {len(dados["aulas"])} aulas')
        print(f'   - {len(dados["contratos"])} contratos')
        print(f'   - {len(dados["listaEspera"])} itens na lista de espera')
        print(f'   - {len(dados["relatorios"])} relatórios')
        print(f'\n📥 Agora você pode importar este arquivo no GitHub Pages usando o botão "Importar Backup" no Dashboard!')
        
        return filename

def aluno_to_dict(aluno):
    """Converte Aluno para dicionário"""
    return {
        'id': aluno.id,
        'nome': aluno.nome,
        'email': aluno.email,
        'telefone': aluno.telefone,
        'data_nascimento': aluno.data_nascimento.isoformat() if aluno.data_nascimento else None,
        'endereco': aluno.endereco,
        'observacoes': aluno.observacoes,
        'status': aluno.status.value if aluno.status else 'ativo',
        'data_cadastro': aluno.data_cadastro.isoformat() if aluno.data_cadastro else None,
        'valor_hora_aula': float(aluno.valor_hora_aula) if aluno.valor_hora_aula else None,
        'frequencia_mensal': aluno.frequencia_mensal
    }

def aula_to_dict(aula):
    """Converte Aula para dicionário"""
    # Verificar se aula tem aluno_nome (join)
    aluno_nome = None
    if hasattr(aula, 'aluno_nome'):
        aluno_nome = aula.aluno_nome
    elif aula.aluno:
        aluno_nome = aula.aluno.nome
    
    return {
        'id': aula.id,
        'aluno_id': aula.aluno_id,
        'aluno_nome': aluno_nome,
        'data_aula': aula.data_aula.isoformat() if aula.data_aula else None,
        'conteudo': aula.conteudo,
        'observacoes': aula.observacoes,
        'status': aula.status.value if aula.status else 'agendada',
        'data_criacao': aula.data_criacao.isoformat() if aula.data_criacao else None,
        'google_event_id': aula.google_event_id if hasattr(aula, 'google_event_id') else None,
        'grupo_aula_id': aula.grupo_aula_id if hasattr(aula, 'grupo_aula_id') else None
    }

def contrato_to_dict(contrato):
    """Converte Contrato para dicionário"""
    return {
        'id': contrato.id,
        'aluno_id': contrato.aluno_id,
        'nome_arquivo': contrato.nome_arquivo,
        'caminho_arquivo': contrato.caminho_arquivo,
        'tipo': contrato.tipo,
        'data_upload': contrato.data_upload.isoformat() if contrato.data_upload else None,
        'observacoes': contrato.observacoes
    }

def lista_espera_to_dict(item):
    """Converte ListaEspera para dicionário"""
    return {
        'id': item.id,
        'nome': item.nome,
        'email': item.email,
        'telefone': item.telefone,
        'observacoes': item.observacoes,
        'data_cadastro': item.data_cadastro.isoformat() if item.data_cadastro else None,
        'status': item.status.value if item.status else 'aguardando'
    }

def relatorio_to_dict(relatorio):
    """Converte Relatorio para dicionário"""
    return {
        'id': relatorio.id,
        'aluno_id': relatorio.aluno_id,
        'tipo': relatorio.tipo,
        'data_inicio': relatorio.data_inicio.isoformat() if relatorio.data_inicio else None,
        'data_fim': relatorio.data_fim.isoformat() if relatorio.data_fim else None,
        'conteudo': relatorio.conteudo,
        'data_criacao': relatorio.data_criacao.isoformat() if relatorio.data_criacao else None
    }

if __name__ == '__main__':
    exportar_dados()

