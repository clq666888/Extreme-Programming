import sqlite3

DB_NAME = "contacts.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    # 主表
    c.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            is_favorite BOOLEAN DEFAULT FALSE
        )
    ''')

    # 详情表
    c.execute('''
        CREATE TABLE IF NOT EXISTS contact_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            value TEXT NOT NULL,
            FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
        )
    ''')

    # 自动迁移旧 phone 字段（只执行一次）
    c.execute("PRAGMA table_info(contacts)")
    columns = [col[1] for col in c.fetchall()]
    if 'phone' in columns:
        print("正在自动迁移旧 phone 字段...")
        c.execute("SELECT id, phone FROM contacts WHERE phone IS NOT NULL AND phone != ''")
        for row in c.fetchall():
            c.execute("SELECT COUNT(*) FROM contact_details WHERE contact_id=? AND type='phone' AND value=?",
                     (row['id'], row['phone']))
            if c.fetchone()[0] == 0:
                c.execute("INSERT INTO contact_details (contact_id, type, value) VALUES (?, 'phone', ?)",
                         (row['id'], row['phone']))
        try:
            c.execute("ALTER TABLE contacts DROP COLUMN phone")
        except:
            pass  # 旧版 SQLite 不支持 DROP

    conn.commit()
    conn.close()
    print("数据库初始化完成")