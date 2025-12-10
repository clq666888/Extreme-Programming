import sqlite3

DB_NAME = "contacts.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    # 创建表（如果不存在）
    c.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE
        )
    ''')
    # 添加 is_favorite 字段（如果不存在）
    try:
        c.execute("ALTER TABLE contacts ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE")
    except sqlite3.OperationalError:
        pass  # 字段已存在
    conn.commit()
    conn.close()