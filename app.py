from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from config import Config
from database import db
from models import Aluno, Aula, Contrato, ListaEspera, Relatorio, StatusAluno, StatusAula
from datetime import datetime
import os
import json
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

# Criar pastas necessárias
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static/uploads', exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# ========== ROTA DE IMPORTAÇÃO ==========
@app.route('/api/importar-alunos', methods=['POST'])
def importar_alunos_endpoint():
    """Endpoint para importar alunos de uma planilha Excel"""
    try:
        from openpyxl import load_workbook
        
        # Caminho da planilha
        planilha_path = os.path.join('imports', 'Planilha_Aulas_Teacher_Nathy.xlsx')
        
        if not os.path.exists(planilha_path):
            return jsonify({'error': 'Planilha não encontrada'}), 404
        
        # Carregar planilha
        wb = load_workbook(planilha_path, data_only=True)
        ws = wb.active
        
        alunos_importados = 0
        alunos_atualizados = 0
        alunos_erro = 0
        erros = []
        
        # Processar linhas (começando da linha 2, linha 1 é cabeçalho)
        for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if not row or not row[0]:
                continue
            
            try:
                # Coluna A: Nome do aluno
                nome = str(row[0]).strip() if row[0] else None
                if not nome or nome.lower() in ['nome', 'aluno', '']:
                    continue
                
                # Coluna B: Valor Hora-Aula (R$)
                valor_hora = None
                if len(row) > 1 and row[1]:
                    try:
                        valor_hora = float(row[1])
                    except (ValueError, TypeError):
                        pass
                
                # Coluna C: Nº de Aulas no Mês
                frequencia_mensal = None
                if len(row) > 2 and row[2]:
                    try:
                        frequencia_mensal = int(float(row[2]))
                    except (ValueError, TypeError):
                        pass
                
                # Coluna E: Observações
                observacoes_planilha = None
                if len(row) > 4 and row[4]:
                    observacoes_planilha = str(row[4]).strip()
                
                # Montar observações
                observacoes_parts = []
                if valor_hora:
                    observacoes_parts.append(f"Valor hora/aula: R$ {valor_hora:.2f}")
                if frequencia_mensal:
                    observacoes_parts.append(f"Frequência mensal: {frequencia_mensal} aulas")
                if observacoes_planilha:
                    observacoes_parts.append(observacoes_planilha)
                
                observacoes = "Importado da planilha. " + ". ".join(observacoes_parts) if observacoes_parts else "Importado da planilha"
                
                # Verificar se aluno já existe
                aluno_existente = Aluno.query.filter_by(nome=nome).first()
                if aluno_existente:
                    # Atualizar aluno existente
                    aluno_existente.valor_hora_aula = valor_hora
                    aluno_existente.frequencia_mensal = frequencia_mensal
                    if observacoes_parts:
                        obs_atual = aluno_existente.observacoes or ""
                        aluno_existente.observacoes = f"{obs_atual}. Atualizado da planilha: {'. '.join(observacoes_parts)}" if obs_atual else observacoes
                    alunos_atualizados += 1
                    continue
                
                # Criar novo aluno
                aluno = Aluno(
                    nome=nome,
                    status=StatusAluno.ATIVO,
                    valor_hora_aula=valor_hora,
                    frequencia_mensal=frequencia_mensal,
                    observacoes=observacoes
                )
                
                db.session.add(aluno)
                alunos_importados += 1
                
            except Exception as e:
                alunos_erro += 1
                erros.append(f"Linha {row_num}: {str(e)}")
                continue
        
        # Commit das alterações
        db.session.commit()
        
        return jsonify({
            'message': 'Importação concluída',
            'alunos_importados': alunos_importados,
            'alunos_atualizados': alunos_atualizados,
            'erros': alunos_erro,
            'detalhes_erros': erros[:10]  # Limitar a 10 erros
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========== ROTAS DE ALUNOS ==========
@app.route('/api/alunos', methods=['GET'])
def listar_alunos():
    try:
        alunos = Aluno.query.all()
        return jsonify([aluno.to_dict() for aluno in alunos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alunos/<int:id>', methods=['GET'])
def obter_aluno(id):
    try:
        aluno = Aluno.query.get_or_404(id)
        return jsonify(aluno.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alunos', methods=['POST'])
def criar_aluno():
    try:
        data = request.get_json()
        aluno = Aluno(
            nome=data.get('nome'),
            email=data.get('email'),
            telefone=data.get('telefone'),
            endereco=data.get('endereco'),
            data_nascimento=datetime.fromisoformat(data['data_nascimento']).date() if data.get('data_nascimento') else None,
            observacoes=data.get('observacoes'),
            status=StatusAluno[data.get('status', 'ATIVO').upper()]
        )
        db.session.add(aluno)
        db.session.commit()
        return jsonify(aluno.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/alunos/<int:id>', methods=['PUT'])
def atualizar_aluno(id):
    try:
        aluno = Aluno.query.get_or_404(id)
        data = request.get_json()
        
        aluno.nome = data.get('nome', aluno.nome)
        aluno.email = data.get('email', aluno.email)
        aluno.telefone = data.get('telefone', aluno.telefone)
        aluno.endereco = data.get('endereco', aluno.endereco)
        if data.get('data_nascimento'):
            aluno.data_nascimento = datetime.fromisoformat(data['data_nascimento']).date()
        aluno.observacoes = data.get('observacoes', aluno.observacoes)
        if data.get('status'):
            aluno.status = StatusAluno[data['status'].upper()]
        
        db.session.commit()
        return jsonify(aluno.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/alunos/<int:id>', methods=['DELETE'])
def deletar_aluno(id):
    try:
        aluno = Aluno.query.get_or_404(id)
        db.session.delete(aluno)
        db.session.commit()
        return jsonify({'message': 'Aluno deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========== ROTAS DE AULAS ==========
@app.route('/api/aulas', methods=['GET'])
def listar_aulas():
    try:
        aluno_id = request.args.get('aluno_id', type=int)
        query = Aula.query
        if aluno_id:
            query = query.filter_by(aluno_id=aluno_id)
        aulas = query.order_by(Aula.data_aula.desc()).all()
        return jsonify([aula.to_dict() for aula in aulas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/aulas/<int:id>', methods=['GET'])
def obter_aula(id):
    try:
        aula = Aula.query.get_or_404(id)
        return jsonify(aula.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/aulas', methods=['POST'])
def criar_aula():
    try:
        data = request.get_json()
        aula = Aula(
            aluno_id=data.get('aluno_id'),
            data_aula=datetime.fromisoformat(data['data_aula']),
            duracao=data.get('duracao', 60),
            conteudo=data.get('conteudo'),
            observacoes=data.get('observacoes'),
            status=StatusAula[data.get('status', 'AGENDADA').upper()]
        )
        db.session.add(aula)
        db.session.commit()
        return jsonify(aula.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/aulas/<int:id>', methods=['PUT'])
def atualizar_aula(id):
    try:
        aula = Aula.query.get_or_404(id)
        data = request.get_json()
        
        if data.get('aluno_id'):
            aula.aluno_id = data['aluno_id']
        if data.get('data_aula'):
            aula.data_aula = datetime.fromisoformat(data['data_aula'])
        if data.get('duracao'):
            aula.duracao = data['duracao']
        aula.conteudo = data.get('conteudo', aula.conteudo)
        aula.observacoes = data.get('observacoes', aula.observacoes)
        if data.get('status'):
            aula.status = StatusAula[data['status'].upper()]
        
        db.session.commit()
        return jsonify(aula.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/aulas/<int:id>', methods=['DELETE'])
def deletar_aula(id):
    try:
        aula = Aula.query.get_or_404(id)
        db.session.delete(aula)
        db.session.commit()
        return jsonify({'message': 'Aula deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========== ROTAS DE CONTRATOS ==========
@app.route('/api/contratos', methods=['GET'])
def listar_contratos():
    try:
        aluno_id = request.args.get('aluno_id', type=int)
        query = Contrato.query
        if aluno_id:
            query = query.filter_by(aluno_id=aluno_id)
        contratos = query.order_by(Contrato.data_upload.desc()).all()
        return jsonify([contrato.to_dict() for contrato in contratos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contratos/<int:id>', methods=['GET'])
def obter_contrato(id):
    try:
        contrato = Contrato.query.get_or_404(id)
        return jsonify(contrato.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contratos', methods=['POST'])
def upload_contrato():
    try:
        if 'arquivo' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['arquivo']
        if file.filename == '':
            return jsonify({'error': 'Nome de arquivo vazio'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            contrato = Contrato(
                aluno_id=request.form.get('aluno_id', type=int),
                nome_arquivo=file.filename,
                caminho_arquivo=filepath,
                tipo_documento=request.form.get('tipo_documento', 'documento'),
                observacoes=request.form.get('observacoes')
            )
            db.session.add(contrato)
            db.session.commit()
            return jsonify(contrato.to_dict()), 201
        else:
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/contratos/<int:id>/download', methods=['GET'])
def download_contrato(id):
    try:
        contrato = Contrato.query.get_or_404(id)
        return send_file(contrato.caminho_arquivo, as_attachment=True, download_name=contrato.nome_arquivo)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contratos/<int:id>', methods=['DELETE'])
def deletar_contrato(id):
    try:
        contrato = Contrato.query.get_or_404(id)
        filepath = contrato.caminho_arquivo
        db.session.delete(contrato)
        db.session.commit()
        
        # Deletar arquivo físico
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({'message': 'Contrato deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========== ROTAS DE LISTA DE ESPERA ==========
@app.route('/api/lista-espera', methods=['GET'])
def listar_lista_espera():
    try:
        pessoas = ListaEspera.query.order_by(ListaEspera.prioridade.desc(), ListaEspera.data_cadastro.asc()).all()
        return jsonify([pessoa.to_dict() for pessoa in pessoas]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lista-espera/<int:id>', methods=['GET'])
def obter_lista_espera(id):
    try:
        pessoa = ListaEspera.query.get_or_404(id)
        return jsonify(pessoa.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lista-espera', methods=['POST'])
def adicionar_lista_espera():
    try:
        data = request.get_json()
        pessoa = ListaEspera(
            nome=data.get('nome'),
            email=data.get('email'),
            telefone=data.get('telefone'),
            observacoes=data.get('observacoes'),
            prioridade=data.get('prioridade', 5),
            status=data.get('status', 'aguardando')
        )
        db.session.add(pessoa)
        db.session.commit()
        return jsonify(pessoa.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/lista-espera/<int:id>', methods=['PUT'])
def atualizar_lista_espera(id):
    try:
        pessoa = ListaEspera.query.get_or_404(id)
        data = request.get_json()
        
        pessoa.nome = data.get('nome', pessoa.nome)
        pessoa.email = data.get('email', pessoa.email)
        pessoa.telefone = data.get('telefone', pessoa.telefone)
        pessoa.observacoes = data.get('observacoes', pessoa.observacoes)
        pessoa.prioridade = data.get('prioridade', pessoa.prioridade)
        pessoa.status = data.get('status', pessoa.status)
        
        db.session.commit()
        return jsonify(pessoa.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/lista-espera/<int:id>/ativar', methods=['POST'])
def ativar_lista_espera(id):
    try:
        pessoa = ListaEspera.query.get_or_404(id)
        data = request.get_json()
        
        # Criar aluno a partir da lista de espera
        aluno = Aluno(
            nome=pessoa.nome,
            email=pessoa.email,
            telefone=pessoa.telefone,
            observacoes=f"Convertido da lista de espera. {pessoa.observacoes or ''}",
            status=StatusAluno.ATIVO
        )
        db.session.add(aluno)
        
        # Atualizar status da lista de espera
        pessoa.status = 'convertido'
        db.session.commit()
        
        return jsonify({
            'message': 'Pessoa convertida para aluno com sucesso',
            'aluno': aluno.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/lista-espera/<int:id>', methods=['DELETE'])
def deletar_lista_espera(id):
    try:
        pessoa = ListaEspera.query.get_or_404(id)
        db.session.delete(pessoa)
        db.session.commit()
        return jsonify({'message': 'Registro deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========== ROTAS DE RELATÓRIOS ==========
@app.route('/api/relatorios', methods=['GET'])
def listar_relatorios():
    try:
        aluno_id = request.args.get('aluno_id', type=int)
        query = Relatorio.query
        if aluno_id:
            query = query.filter_by(aluno_id=aluno_id)
        relatorios = query.order_by(Relatorio.data_criacao.desc()).all()
        return jsonify([relatorio.to_dict() for relatorio in relatorios]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/relatorios/gerar', methods=['POST'])
def gerar_relatorio():
    try:
        data = request.get_json()
        aluno_id = data.get('aluno_id')
        periodo_inicio = datetime.fromisoformat(data['periodo_inicio']).date() if data.get('periodo_inicio') else None
        periodo_fim = datetime.fromisoformat(data['periodo_fim']).date() if data.get('periodo_fim') else None
        
        # Buscar dados do aluno e aulas
        aluno = Aluno.query.get_or_404(aluno_id)
        query_aulas = Aula.query.filter_by(aluno_id=aluno_id)
        
        if periodo_inicio:
            query_aulas = query_aulas.filter(Aula.data_aula >= datetime.combine(periodo_inicio, datetime.min.time()))
        if periodo_fim:
            query_aulas = query_aulas.filter(Aula.data_aula <= datetime.combine(periodo_fim, datetime.max.time()))
        
        aulas = query_aulas.all()
        
        # Calcular estatísticas
        total_aulas = len(aulas)
        aulas_realizadas = len([a for a in aulas if a.status == StatusAula.REALIZADA])
        aulas_agendadas = len([a for a in aulas if a.status == StatusAula.AGENDADA])
        
        # Criar relatório
        relatorio_data = {
            'aluno': aluno.to_dict(),
            'periodo': {
                'inicio': periodo_inicio.isoformat() if periodo_inicio else None,
                'fim': periodo_fim.isoformat() if periodo_fim else None
            },
            'estatisticas': {
                'total_aulas': total_aulas,
                'aulas_realizadas': aulas_realizadas,
                'aulas_agendadas': aulas_agendadas,
                'taxa_frequencia': (aulas_realizadas / total_aulas * 100) if total_aulas > 0 else 0
            },
            'aulas': [aula.to_dict() for aula in aulas]
        }
        
        relatorio = Relatorio(
            aluno_id=aluno_id,
            titulo=data.get('titulo', f'Relatório - {aluno.nome}'),
            periodo_inicio=periodo_inicio,
            periodo_fim=periodo_fim,
            conteudo=json.dumps(relatorio_data, ensure_ascii=False)
        )
        db.session.add(relatorio)
        db.session.commit()
        
        return jsonify(relatorio.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/relatorios/<int:id>', methods=['GET'])
def obter_relatorio(id):
    try:
        relatorio = Relatorio.query.get_or_404(id)
        relatorio_dict = relatorio.to_dict()
        if relatorio.conteudo:
            relatorio_dict['dados'] = json.loads(relatorio.conteudo)
        return jsonify(relatorio_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rota para servir o index.html
@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

# Rota para servir arquivos estáticos
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=8000)
