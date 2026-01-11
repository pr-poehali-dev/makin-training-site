-- Таблица для записей дневника питания
CREATE TABLE IF NOT EXISTS food_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    grams NUMERIC(10,2) NOT NULL,
    calories NUMERIC(10,2) NOT NULL,
    protein NUMERIC(10,2) NOT NULL,
    fats NUMERIC(10,2) NOT NULL,
    carbs NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON food_log(user_id, date);

-- Таблица для дневных норм пользователя
CREATE TABLE IF NOT EXISTS user_nutrition_goals (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    calories_goal NUMERIC(10,2) NOT NULL,
    protein_goal NUMERIC(10,2) NOT NULL,
    fats_goal NUMERIC(10,2) NOT NULL,
    carbs_goal NUMERIC(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);