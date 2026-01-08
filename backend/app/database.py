import os
import aiosqlite
from typing import AsyncGenerator

DATABASE_PATH = os.getenv("DATABASE_PATH", "/data/app.db")

if not os.path.exists(os.path.dirname(DATABASE_PATH)) and DATABASE_PATH.startswith("/data"):
    DATABASE_PATH = "app.db"

async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                city TEXT,
                purchase_volume TEXT,
                role TEXT NOT NULL DEFAULT 'buyer',
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add new columns if they don't exist (for existing databases)
        try:
            await db.execute("ALTER TABLE users ADD COLUMN city TEXT")
        except:
            pass
        try:
            await db.execute("ALTER TABLE users ADD COLUMN purchase_volume TEXT")
        except:
            pass
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                unit TEXT NOT NULL DEFAULT 'kg',
                category_id INTEGER,
                image_url TEXT,
                image_url_2 TEXT,
                stock REAL DEFAULT 0,
                min_order REAL DEFAULT 1,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                discount_percent REAL NOT NULL,
                product_id INTEGER,
                category_id INTEGER,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                total REAL NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity REAL NOT NULL,
                price REAL NOT NULL,
                discount REAL DEFAULT 0,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        """)
        
        await db.commit()
        
        cursor = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
        row = await cursor.fetchone()
        if row['count'] == 0:
            import bcrypt
            admin_password = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
            await db.execute(
                "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
                ("admin@tutti.com", admin_password, "Administrador", "admin")
            )
            await db.commit()
        
        cursor = await db.execute("SELECT COUNT(*) as count FROM categories")
        row = await cursor.fetchone()
        if row['count'] == 0:
            initial_categories = [
                ("Frutas", "Frutas frescas de la mejor calidad", ""),
                ("Verduras", "Verduras frescas y saludables", ""),
                ("Pulpas", "Pulpas de frutas naturales", ""),
                ("Otros", "Otros productos disponibles", "")
            ]
            for name, description, image_url in initial_categories:
                await db.execute(
                    "INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)",
                    (name, description, image_url)
                )
            await db.commit()
