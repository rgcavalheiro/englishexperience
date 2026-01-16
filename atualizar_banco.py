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
            # Verificar se as colunas já existem
            result = db.session.execute(text("PRAGMA table_info(alunos)"))
            colunas = [row[1] for row in result]
            
            # Adicionar valor_hora_aula se não existir
            if 'valor_hora_aula' not in colunas:
                print("Adicionando coluna 'valor_hora_aula'...")
                db.session.execute(text("ALTER TABLE alunos ADD COLUMN valor_hora_aula NUMERIC(10, 2)"))
                db.session.commit()
                print("✓ Coluna 'valor_hora_aula' adicionada")
            else:
                print("Coluna 'valor_hora_aula' já existe")
            
            # Adicionar frequencia_mensal se não existir
            if 'frequencia_mensal' not in colunas:
                print("Adicionando coluna 'frequencia_mensal'...")
                db.session.execute(text("ALTER TABLE alunos ADD COLUMN frequencia_mensal INTEGER"))
                db.session.commit()
                print("✓ Coluna 'frequencia_mensal' adicionada")
            else:
                print("Coluna 'frequencia_mensal' já existe")
            
            print("\nBanco de dados atualizado com sucesso!")
            
        except Exception as e:
            print(f"Erro ao atualizar banco: {e}")
            db.session.rollback()

if __name__ == "__main__":
    atualizar_banco()


