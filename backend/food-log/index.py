import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

FOOD_DATABASE = {
    "Курица грудка": {"calories": 165, "protein": 31, "fats": 3.6, "carbs": 0},
    "Курица бедро": {"calories": 211, "protein": 26, "fats": 11, "carbs": 0},
    "Говядина постная": {"calories": 250, "protein": 26, "fats": 15, "carbs": 0},
    "Свинина": {"calories": 242, "protein": 27, "fats": 14, "carbs": 0},
    "Индейка": {"calories": 189, "protein": 29, "fats": 7, "carbs": 0},
    "Лосось": {"calories": 208, "protein": 20, "fats": 13, "carbs": 0},
    "Тунец": {"calories": 144, "protein": 23, "fats": 5, "carbs": 0},
    "Треска": {"calories": 82, "protein": 18, "fats": 0.7, "carbs": 0},
    "Креветки": {"calories": 99, "protein": 24, "fats": 0.3, "carbs": 0.2},
    "Яйцо куриное": {"calories": 157, "protein": 13, "fats": 11, "carbs": 1.1},
    "Яичный белок": {"calories": 52, "protein": 11, "fats": 0.2, "carbs": 0.7},
    "Творог 0%": {"calories": 71, "protein": 16, "fats": 0.2, "carbs": 1.3},
    "Творог 5%": {"calories": 121, "protein": 17, "fats": 5, "carbs": 1.8},
    "Творог 9%": {"calories": 159, "protein": 16, "fats": 9, "carbs": 2},
    "Молоко 1.5%": {"calories": 44, "protein": 2.8, "fats": 1.5, "carbs": 4.7},
    "Молоко 3.2%": {"calories": 60, "protein": 2.9, "fats": 3.2, "carbs": 4.7},
    "Кефир 1%": {"calories": 40, "protein": 3, "fats": 1, "carbs": 4},
    "Йогурт натуральный": {"calories": 66, "protein": 5, "fats": 3.2, "carbs": 3.5},
    "Греческий йогурт": {"calories": 97, "protein": 9, "fats": 5, "carbs": 4},
    "Сыр моцарелла": {"calories": 280, "protein": 28, "fats": 17, "carbs": 3},
    "Сыр чеддер": {"calories": 402, "protein": 25, "fats": 33, "carbs": 1.3},
    "Сыр фета": {"calories": 264, "protein": 14, "fats": 21, "carbs": 4},
    "Рис белый": {"calories": 130, "protein": 2.7, "fats": 0.3, "carbs": 28},
    "Рис бурый": {"calories": 111, "protein": 2.6, "fats": 0.9, "carbs": 23},
    "Гречка": {"calories": 123, "protein": 4.5, "fats": 1.2, "carbs": 25},
    "Овсянка": {"calories": 68, "protein": 2.4, "fats": 1.4, "carbs": 12},
    "Макароны": {"calories": 158, "protein": 5.8, "fats": 0.9, "carbs": 31},
    "Хлеб белый": {"calories": 265, "protein": 8, "fats": 3, "carbs": 49},
    "Хлеб ржаной": {"calories": 259, "protein": 8, "fats": 1, "carbs": 49},
    "Хлеб цельнозерновой": {"calories": 247, "protein": 13, "fats": 4, "carbs": 41},
    "Батон": {"calories": 260, "protein": 7.5, "fats": 2.9, "carbs": 51},
    "Картофель": {"calories": 77, "protein": 2, "fats": 0.1, "carbs": 17},
    "Батат": {"calories": 86, "protein": 1.6, "fats": 0.1, "carbs": 20},
    "Киноа": {"calories": 120, "protein": 4.4, "fats": 1.9, "carbs": 21},
    "Булгур": {"calories": 83, "protein": 3, "fats": 0.2, "carbs": 19},
    "Банан": {"calories": 89, "protein": 1.1, "fats": 0.3, "carbs": 23},
    "Яблоко": {"calories": 52, "protein": 0.3, "fats": 0.2, "carbs": 14},
    "Апельсин": {"calories": 47, "protein": 0.9, "fats": 0.1, "carbs": 12},
    "Груша": {"calories": 57, "protein": 0.4, "fats": 0.1, "carbs": 15},
    "Виноград": {"calories": 69, "protein": 0.7, "fats": 0.2, "carbs": 18},
    "Клубника": {"calories": 32, "protein": 0.7, "fats": 0.3, "carbs": 8},
    "Черника": {"calories": 57, "protein": 0.7, "fats": 0.3, "carbs": 14},
    "Малина": {"calories": 52, "protein": 1.2, "fats": 0.7, "carbs": 12},
    "Арбуз": {"calories": 30, "protein": 0.6, "fats": 0.2, "carbs": 8},
    "Дыня": {"calories": 34, "protein": 0.8, "fats": 0.2, "carbs": 8},
    "Авокадо": {"calories": 160, "protein": 2, "fats": 15, "carbs": 9},
    "Киви": {"calories": 61, "protein": 1.1, "fats": 0.5, "carbs": 15},
    "Манго": {"calories": 60, "protein": 0.8, "fats": 0.4, "carbs": 15},
    "Ананас": {"calories": 50, "protein": 0.5, "fats": 0.1, "carbs": 13},
    "Персик": {"calories": 39, "protein": 0.9, "fats": 0.3, "carbs": 10},
    "Абрикос": {"calories": 48, "protein": 1.4, "fats": 0.4, "carbs": 11},
    "Брокколи": {"calories": 34, "protein": 2.8, "fats": 0.4, "carbs": 7},
    "Цветная капуста": {"calories": 25, "protein": 1.9, "fats": 0.3, "carbs": 5},
    "Капуста белокочанная": {"calories": 25, "protein": 1.3, "fats": 0.1, "carbs": 6},
    "Морковь": {"calories": 41, "protein": 0.9, "fats": 0.2, "carbs": 10},
    "Огурец": {"calories": 15, "protein": 0.7, "fats": 0.1, "carbs": 3.6},
    "Помидор": {"calories": 18, "protein": 0.9, "fats": 0.2, "carbs": 3.9},
    "Перец болгарский": {"calories": 27, "protein": 1, "fats": 0.3, "carbs": 6},
    "Салат листовой": {"calories": 15, "protein": 1.4, "fats": 0.2, "carbs": 3},
    "Шпинат": {"calories": 23, "protein": 2.9, "fats": 0.4, "carbs": 3.6},
    "Кабачок": {"calories": 17, "protein": 0.6, "fats": 0.3, "carbs": 4.6},
    "Баклажан": {"calories": 25, "protein": 1.2, "fats": 0.1, "carbs": 5.9},
    "Лук репчатый": {"calories": 40, "protein": 1.1, "fats": 0.1, "carbs": 10},
    "Чеснок": {"calories": 149, "protein": 6.5, "fats": 0.5, "carbs": 33},
    "Свекла": {"calories": 43, "protein": 1.6, "fats": 0.2, "carbs": 10},
    "Тыква": {"calories": 26, "protein": 1, "fats": 0.1, "carbs": 6.5},
    "Спаржа": {"calories": 20, "protein": 2.2, "fats": 0.1, "carbs": 3.9},
    "Орехи грецкие": {"calories": 654, "protein": 15, "fats": 65, "carbs": 14},
    "Миндаль": {"calories": 579, "protein": 21, "fats": 50, "carbs": 22},
    "Кешью": {"calories": 553, "protein": 18, "fats": 44, "carbs": 30},
    "Арахис": {"calories": 567, "protein": 26, "fats": 49, "carbs": 16},
    "Фундук": {"calories": 628, "protein": 15, "fats": 61, "carbs": 17},
    "Семена подсолнечника": {"calories": 584, "protein": 21, "fats": 52, "carbs": 20},
    "Семена тыквы": {"calories": 559, "protein": 30, "fats": 49, "carbs": 11},
    "Семена льна": {"calories": 534, "protein": 18, "fats": 42, "carbs": 29},
    "Семена чиа": {"calories": 486, "protein": 17, "fats": 31, "carbs": 42},
    "Арахисовая паста": {"calories": 588, "protein": 25, "fats": 50, "carbs": 20},
    "Оливковое масло": {"calories": 884, "protein": 0, "fats": 100, "carbs": 0},
    "Подсолнечное масло": {"calories": 884, "protein": 0, "fats": 100, "carbs": 0},
    "Сливочное масло": {"calories": 717, "protein": 0.8, "fats": 81, "carbs": 0.8},
    "Кокосовое масло": {"calories": 862, "protein": 0, "fats": 100, "carbs": 0},
    "Мед": {"calories": 304, "protein": 0.3, "fats": 0, "carbs": 82},
    "Сахар": {"calories": 387, "protein": 0, "fats": 0, "carbs": 100},
    "Темный шоколад": {"calories": 546, "protein": 6, "fats": 31, "carbs": 63},
    "Молочный шоколад": {"calories": 535, "protein": 8, "fats": 30, "carbs": 59},
    "Протеиновый батончик": {"calories": 350, "protein": 20, "fats": 10, "carbs": 40},
    "Протеиновый порошок": {"calories": 400, "protein": 80, "fats": 5, "carbs": 10},
    "Чай без сахара": {"calories": 1, "protein": 0, "fats": 0, "carbs": 0.3},
    "Кофе черный": {"calories": 2, "protein": 0.1, "fats": 0, "carbs": 0.5},
    "Сок апельсиновый": {"calories": 45, "protein": 0.7, "fats": 0.2, "carbs": 10},
    "Кола": {"calories": 42, "protein": 0, "fats": 0, "carbs": 10.6},
    "Пицца пепперони": {"calories": 298, "protein": 12, "fats": 13, "carbs": 33},
    "Бургер": {"calories": 295, "protein": 17, "fats": 14, "carbs": 24},
    "Картофель фри": {"calories": 312, "protein": 3.4, "fats": 15, "carbs": 41},
    "Круассан": {"calories": 406, "protein": 8, "fats": 21, "carbs": 46},
    "Донат": {"calories": 452, "protein": 5, "fats": 25, "carbs": 51},
    "Мороженое": {"calories": 207, "protein": 3.5, "fats": 11, "carbs": 24},
    "Пельмени": {"calories": 275, "protein": 12, "fats": 15, "carbs": 23},
    "Блины": {"calories": 227, "protein": 6, "fats": 10, "carbs": 28},
    "Сырники": {"calories": 220, "protein": 15, "fats": 10, "carbs": 18},
    "Борщ": {"calories": 49, "protein": 1.6, "fats": 2.2, "carbs": 6.7},
}

def handler(event: dict, context) -> dict:
    """API для работы с дневником питания и базой продуктов"""
    
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
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'get_logs')
            
            if action == 'search_food':
                query = params.get('query', '').lower()
                results = []
                
                for food_name, nutrition in FOOD_DATABASE.items():
                    if query in food_name.lower():
                        results.append({
                            'name': food_name,
                            'calories': nutrition['calories'],
                            'protein': nutrition['protein'],
                            'fats': nutrition['fats'],
                            'carbs': nutrition['carbs']
                        })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'foods': results[:20]}),
                    'isBase64Encoded': False
                }
            
            elif action == 'get_goals':
                user_id = params.get('user_id')
                
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT calories_goal, protein_goal, fats_goal, carbs_goal FROM user_nutrition_goals WHERE user_id = %s",
                    (user_id,)
                )
                goals = cursor.fetchone()
                
                if not goals:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'goals': None}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'goals': dict(goals)}),
                    'isBase64Encoded': False
                }
            
            else:
                user_id = params.get('user_id')
                date = params.get('date')
                
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                if date:
                    cursor.execute(
                        "SELECT id, food_name, grams, calories, protein, fats, carbs, created_at FROM food_log WHERE user_id = %s AND date = %s ORDER BY created_at DESC",
                        (user_id, date)
                    )
                else:
                    cursor.execute(
                        "SELECT id, date, food_name, grams, calories, protein, fats, carbs, created_at FROM food_log WHERE user_id = %s ORDER BY date DESC, created_at DESC LIMIT 100",
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
            action = body.get('action', 'add_food')
            
            if action == 'set_goals':
                user_id = body.get('user_id')
                calories_goal = body.get('calories_goal')
                protein_goal = body.get('protein_goal')
                fats_goal = body.get('fats_goal')
                carbs_goal = body.get('carbs_goal')
                
                if not all([user_id, calories_goal, protein_goal, fats_goal, carbs_goal]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Все поля обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """
                    INSERT INTO user_nutrition_goals (user_id, calories_goal, protein_goal, fats_goal, carbs_goal)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (user_id) DO UPDATE SET
                        calories_goal = EXCLUDED.calories_goal,
                        protein_goal = EXCLUDED.protein_goal,
                        fats_goal = EXCLUDED.fats_goal,
                        carbs_goal = EXCLUDED.carbs_goal,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    (user_id, calories_goal, protein_goal, fats_goal, carbs_goal)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            else:
                user_id = body.get('user_id')
                date = body.get('date', datetime.now().strftime('%Y-%m-%d'))
                food_name = body.get('food_name', '')
                grams = body.get('grams', 100)
                
                if not user_id or not food_name:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id и food_name обязательны'}),
                        'isBase64Encoded': False
                    }
                
                food_data = FOOD_DATABASE.get(food_name)
                if not food_data:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Продукт не найден в базе'}),
                        'isBase64Encoded': False
                    }
                
                multiplier = grams / 100
                calories = round(food_data['calories'] * multiplier, 1)
                protein = round(food_data['protein'] * multiplier, 1)
                fats = round(food_data['fats'] * multiplier, 1)
                carbs = round(food_data['carbs'] * multiplier, 1)
                
                cursor.execute(
                    "INSERT INTO food_log (user_id, date, food_name, grams, calories, protein, fats, carbs) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (user_id, date, food_name, grams, calories, protein, fats, carbs)
                )
                log_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': log_id}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            log_id = body.get('id')
            
            if not log_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("DELETE FROM food_log WHERE id = %s", (log_id,))
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
