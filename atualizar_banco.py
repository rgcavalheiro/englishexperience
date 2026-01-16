"""
Script para atualizar o banco de dados com os novos campos
"""
from app import app
from database import db
from sqlalchemy import text

def atualizar_banco():
    """Adiciona os novos campos ao banco de dados se não existirem"""
    with app.app_context():
        try:
            # Verificar se as colunas já existem na tabela alunos
            result = db.session.execute(text("PRAGMA table_info(alunos)"))
            colunas_alunos = [row[1] for row in result]
            
            # Adicionar valor_hora_aula se não existir
            if 'valor_hora_aula' not in colunas_alunos:
                print("Adicionando coluna 'valor_hora_aula'...")
                db.session.execute(text("ALTER TABLE alunos ADD COLUMN valor_hora_aula NUMERIC(10, 2)"))
                db.session.commit()
                print("✓ Coluna 'valor_hora_aula' adicionada")
            else:
                print("Coluna 'valor_hora_aula' já existe")
            
            # Adicionar frequencia_mensal se não existir
            if 'frequencia_mensal' not in colunas_alunos:
                print("Adicionando coluna 'frequencia_mensal'...")
                db.session.execute(text("ALTER TABLE alunos ADD COLUMN frequencia_mensal INTEGER"))
                db.session.commit()
                print("✓ Coluna 'frequencia_mensal' adicionada")
            else:
                print("Coluna 'frequencia_mensal' já existe")
            
            # Verificar se a coluna google_event_id existe na tabela aulas
            result = db.session.execute(text("PRAGMA table_info(aulas)"))
            colunas_aulas = [row[1] for row in result]
            
            if 'google_event_id' not in colunas_aulas:
                print("Adicionando coluna 'google_event_id'...")
                db.session.execute(text("ALTER TABLE aulas ADD COLUMN google_event_id VARCHAR(255)"))
                db.session.commit()
                print("✓ Coluna 'google_event_id' adicionada")
            else:
                print("Coluna 'google_event_id' já existe")
            
            # Verificar se a coluna grupo_aula_id existe na tabela aulas
            result = db.session.execute(text("PRAGMA table_info(aulas)"))
            colunas_aulas = [row[1] for row in result]
            
            if 'grupo_aula_id' not in colunas_aulas:
                print("Adicionando coluna 'grupo_aula_id'...")
                db.session.execute(text("ALTER TABLE aulas ADD COLUMN grupo_aula_id VARCHAR(100)"))
                db.session.commit()
                print("✓ Coluna 'grupo_aula_id' adicionada")
            else:
                print("Coluna 'grupo_aula_id' já existe")
            
            # Criar tabela google_calendar_tokens se não existir
            try:
                db.session.execute(text("SELECT 1 FROM google_calendar_tokens LIMIT 1"))
                print("Tabela 'google_calendar_tokens' já existe")
            except:
                print("Criando tabela 'google_calendar_tokens'...")
                db.create_all()
                print("✓ Tabela 'google_calendar_tokens' criada")
            
            print("\nBanco de dados atualizado com sucesso!")
            
        except Exception as e:
            print(f"Erro ao atualizar banco: {e}")
            db.session.rollback()

if __name__ == "__main__":
    atualizar_banco()


