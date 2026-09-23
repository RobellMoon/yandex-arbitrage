import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/var/www/yandex-arbitrage/data/arbitrage.db")

conn = sqlite3.connect(DB_PATH)

cursor = conn.execute("""
    DELETE FROM calls
    WHERE timestamp < datetime('now', '-2 months')
""")

deleted = cursor.rowcount

conn.commit()
conn.close()

print(f"Удалено записей: {deleted}")
