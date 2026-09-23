import sqlite3
from pathlib import Path


DB_PATH = Path("/app/data/arbitrage.db")


def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    return connection


def column_exists(connection, table_name, column_name):
    row = connection.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()

    return any(column["name"] == column_name for column in row)


def add_column_if_missing(
    connection,
    table_name,
    column_name,
    column_definition
):
    if not column_exists(connection, table_name, column_name):
        connection.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name} {column_definition}
            """
        )


def init_db():
    connection = get_connection()

    try:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                call_key TEXT NOT NULL UNIQUE,

                project_key TEXT NOT NULL,
                project_name TEXT NOT NULL,

                timestamp TEXT,

                incoming_phone TEXT,
                internal_phone TEXT,

                wait_duration TEXT,
                call_duration TEXT,

                object_name TEXT,
                object_type TEXT,

                campaign_tariff TEXT,
                client_tariff TEXT,

                original_revenue INTEGER NOT NULL DEFAULT 0,
                current_revenue INTEGER NOT NULL DEFAULT 0,

                dispute_status TEXT NOT NULL DEFAULT 'none',

                developer_comment TEXT,

                dispute_created_at TEXT,
                dispute_updated_at TEXT,

                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Поля для информации об арбитраже,
        # которую возвращает Яндекс API.
        add_column_if_missing(
            connection,
            "calls",
            "yandex_complaint_status",
            "TEXT"
        )

        add_column_if_missing(
            connection,
            "calls",
            "yandex_refund_amount",
            "INTEGER DEFAULT 0"
        )

        # Информация о включении звонка
        # в Excel-выгрузку для менеджера Яндекса.
        add_column_if_missing(
            connection,
            "calls",
            "dispute_exported_at",
            "TEXT"
        )

        add_column_if_missing(
            connection,
            "calls",
            "dispute_batch_id",
            "TEXT"
        )

        connection.commit()

    finally:
        connection.close()
