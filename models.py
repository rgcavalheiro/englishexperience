from database import db
from datetime import datetime
from sqlalchemy import Enum, Numeric
import enum

class StatusAluno(enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"
    LISTA_ESPERA = "lista_espera"

class StatusAula(enum.Enum):
    AGENDADA = "agendada"
    REALIZADA = "realizada"
    CANCELADA = "cancelada"

class Aluno(db.Model):
    __tablename__ = 'alunos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    telefone = db.Column(db.String(20))
    endereco = db.Column(db.Text)
    data_nascimento = db.Column(db.Date)
    observacoes = db.Column(db.Text)
    status = db.Column(db.Enum(StatusAluno), default=StatusAluno.ATIVO)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    # Campos adicionais para importação
    valor_hora_aula = db.Column(db.Numeric(10, 2))  # Valor da hora/aula
    frequencia_mensal = db.Column(db.Integer)  # Número de aulas por mês
    
    # Relacionamentos
    aulas = db.relationship('Aula', backref='aluno', lazy=True, cascade='all, delete-orphan')
    contratos = db.relationship('Contrato', backref='aluno', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'observacoes': self.observacoes,
            'status': self.status.value if self.status else None,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'valor_hora_aula': float(self.valor_hora_aula) if self.valor_hora_aula else None,
            'frequencia_mensal': self.frequencia_mensal
        }

class Aula(db.Model):
    __tablename__ = 'aulas'
    
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('alunos.id'), nullable=False)
    data_aula = db.Column(db.DateTime, nullable=False)
    duracao = db.Column(db.Integer, default=60)  # minutos
    conteudo = db.Column(db.Text)
    observacoes = db.Column(db.Text)
    status = db.Column(db.Enum(StatusAula), default=StatusAula.AGENDADA)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'aluno_id': self.aluno_id,
            'aluno_nome': self.aluno.nome if self.aluno else None,
            'data_aula': self.data_aula.isoformat() if self.data_aula else None,
            'duracao': self.duracao,
            'conteudo': self.conteudo,
            'observacoes': self.observacoes,
            'status': self.status.value if self.status else None,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

class Contrato(db.Model):
    __tablename__ = 'contratos'
    
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('alunos.id'), nullable=False)
    nome_arquivo = db.Column(db.String(255), nullable=False)
    caminho_arquivo = db.Column(db.String(500), nullable=False)
    tipo_documento = db.Column(db.String(50))  # contrato, documento, etc
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
    observacoes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'aluno_id': self.aluno_id,
            'aluno_nome': self.aluno.nome if self.aluno else None,
            'nome_arquivo': self.nome_arquivo,
            'caminho_arquivo': self.caminho_arquivo,
            'tipo_documento': self.tipo_documento,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None,
            'observacoes': self.observacoes
        }

class ListaEspera(db.Model):
    __tablename__ = 'lista_espera'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    telefone = db.Column(db.String(20))
    observacoes = db.Column(db.Text)
    prioridade = db.Column(db.Integer, default=5)  # 1-10, 10 = maior prioridade
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='aguardando')  # aguardando, contatado, convertido
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'observacoes': self.observacoes,
            'prioridade': self.prioridade,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'status': self.status
        }

class Relatorio(db.Model):
    __tablename__ = 'relatorios'
    
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('alunos.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    periodo_inicio = db.Column(db.Date)
    periodo_fim = db.Column(db.Date)
    conteudo = db.Column(db.Text)  # JSON com dados do relatório
    caminho_pdf = db.Column(db.String(500))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'aluno_id': self.aluno_id,
            'aluno_nome': self.aluno.nome if self.aluno else None,
            'titulo': self.titulo,
            'periodo_inicio': self.periodo_inicio.isoformat() if self.periodo_inicio else None,
            'periodo_fim': self.periodo_fim.isoformat() if self.periodo_fim else None,
            'conteudo': self.conteudo,
            'caminho_pdf': self.caminho_pdf,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }



