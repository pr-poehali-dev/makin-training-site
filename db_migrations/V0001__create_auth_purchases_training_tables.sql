-- Создание таблиц для системы авторизации, покупок, дневника тренировок

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица покупок
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    program_id VARCHAR(50) NOT NULL,
    program_title VARCHAR(255) NOT NULL,
    program_category VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    calculated_data JSONB,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица записей в дневнике тренировок
CREATE TABLE IF NOT EXISTS training_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    program_id VARCHAR(50),
    exercise_name VARCHAR(255) NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_training_log_user_id ON training_log(user_id);
CREATE INDEX IF NOT EXISTS idx_training_log_date ON training_log(date);