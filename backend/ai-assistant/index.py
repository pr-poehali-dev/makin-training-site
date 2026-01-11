import json
import os
from openai import OpenAI

def handler(event: dict, context) -> dict:
    """AI-помощник для ответов на вопросы о тренировках и питании"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        question = body.get('question', '').strip()
        
        if not question:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Вопрос не может быть пустым'}),
                'isBase64Encoded': False
            }
        
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'API ключ OpenAI не настроен'}),
                'isBase64Encoded': False
            }
        
        client = OpenAI(api_key=api_key)
        
        system_prompt = """Ты — профессиональный тренер Дмитрий Макин, специализирующийся на силовых тренировках, баскетболе и спортивном питании. 

Твоя задача:
- Давать экспертные советы по тренировкам, технике упражнений и восстановлению
- Помогать с планированием питания и расчётом макронутриентов
- Отвечать на вопросы о баскетбольной технике и тактике
- Мотивировать и поддерживать учеников

Отвечай дружелюбно, профессионально и по существу. Если вопрос не связан с тренировками или спортом, вежливо напомни, что ты специализируешься именно в этих областях."""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'answer': answer}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
