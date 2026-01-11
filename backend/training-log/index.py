import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для работы с дневником тренировок"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT id, date, program_id, exercise_name, sets, reps, weight, notes, created_at FROM training_log WHERE user_id = %s ORDER BY date DESC, created_at DESC",
                (user_id,)
            )
            logs = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'logs': [dict(log) for log in logs]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            date = body.get('date', datetime.now().strftime('%Y-%m-%d'))
            program_id = body.get('program_id')
            exercise_name = body.get('exercise_name', '')
            sets = body.get('sets')
            reps = body.get('reps')
            weight = body.get('weight')
            notes = body.get('notes', '')
            
            if not user_id or not exercise_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id и exercise_name обязательны'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "INSERT INTO training_log (user_id, date, program_id, exercise_name, sets, reps, weight, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (user_id, date, program_id, exercise_name, sets, reps, weight, notes)
            )
            log_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': log_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            log_id = body.get('id')
            
            if not log_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id обязателен'}),
                    'isBase64Encoded': False
                }
            
            update_fields = []
            update_values = []
            
            for field in ['date', 'program_id', 'exercise_name', 'sets', 'reps', 'weight', 'notes']:
                if field in body:
                    update_fields.append(f"{field} = %s")
                    update_values.append(body[field])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нет полей для обновления'}),
                    'isBase64Encoded': False
                }
            
            update_values.append(log_id)
            cursor.execute(
                f"UPDATE training_log SET {', '.join(update_fields)} WHERE id = %s",
                update_values
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }