"""
Módulo para integração com Google Calendar
"""
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
from datetime import datetime, timedelta
import json
import os

def get_google_credentials(config, token_record=None):
    """Obtém credenciais do Google a partir do token salvo"""
    if not token_record or not token_record.token:
        return None
    
    try:
        token_data = json.loads(token_record.token)
        creds = Credentials(
            token=token_data.get('token'),
            refresh_token=token_record.refresh_token,
            token_uri=token_record.token_uri or 'https://oauth2.googleapis.com/token',
            client_id=token_record.client_id or config.GOOGLE_CLIENT_ID,
            client_secret=token_record.client_secret or config.GOOGLE_CLIENT_SECRET,
            scopes=config.GOOGLE_SCOPES
        )
        
        # Verificar se precisa atualizar
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
        
        return creds
    except Exception as e:
        print(f"Erro ao obter credenciais: {e}")
        return None

def create_google_calendar_event(creds, aula, aluno_nome):
    """Cria um evento no Google Calendar"""
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # Calcular data de término
        data_inicio = aula.data_aula
        data_fim = data_inicio + timedelta(minutes=aula.duracao)
        
        # Criar evento
        event = {
            'summary': f'Aula - {aluno_nome}',
            'description': f'Conteúdo: {aula.conteudo or "Sem conteúdo específico"}\nObservações: {aula.observacoes or "Nenhuma"}',
            'start': {
                'dateTime': data_inicio.isoformat(),
                'timeZone': 'America/Sao_Paulo',
            },
            'end': {
                'dateTime': data_fim.isoformat(),
                'timeZone': 'America/Sao_Paulo',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 1 dia antes
                    {'method': 'popup', 'minutes': 60},  # 1 hora antes
                ],
            },
        }
        
        event = service.events().insert(calendarId='primary', body=event).execute()
        return event.get('id')
        
    except HttpError as error:
        print(f'Erro ao criar evento no Google Calendar: {error}')
        return None
    except Exception as e:
        print(f'Erro inesperado: {e}')
        return None

def update_google_calendar_event(creds, event_id, aula, aluno_nome):
    """Atualiza um evento no Google Calendar"""
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # Buscar evento existente
        event = service.events().get(calendarId='primary', eventId=event_id).execute()
        
        # Calcular data de término
        data_inicio = aula.data_aula
        data_fim = data_inicio + timedelta(minutes=aula.duracao)
        
        # Atualizar evento
        event['summary'] = f'Aula - {aluno_nome}'
        event['description'] = f'Conteúdo: {aula.conteudo or "Sem conteúdo específico"}\nObservações: {aula.observacoes or "Nenhuma"}'
        event['start'] = {
            'dateTime': data_inicio.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        }
        event['end'] = {
            'dateTime': data_fim.isoformat(),
            'timeZone': 'America/Sao_Paulo',
        }
        
        # Atualizar status baseado no status da aula
        if aula.status.value == 'cancelada':
            event['status'] = 'cancelled'
        elif aula.status.value == 'realizada':
            event['colorId'] = '10'  # Verde
        
        updated_event = service.events().update(calendarId='primary', eventId=event_id, body=event).execute()
        return updated_event.get('id')
        
    except HttpError as error:
        print(f'Erro ao atualizar evento no Google Calendar: {error}')
        return None
    except Exception as e:
        print(f'Erro inesperado: {e}')
        return None

def delete_google_calendar_event(creds, event_id):
    """Deleta um evento no Google Calendar"""
    try:
        service = build('calendar', 'v3', credentials=creds)
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        return True
    except HttpError as error:
        print(f'Erro ao deletar evento no Google Calendar: {error}')
        return False
    except Exception as e:
        print(f'Erro inesperado: {e}')
        return False

