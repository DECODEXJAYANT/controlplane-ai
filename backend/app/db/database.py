import sqlite3
from pathlib import Path


DATABASE_PATH = (
    Path(__file__).resolve().parents[2] / "controlplane.db"
)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database() -> None:
    connection = get_connection()

    try:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                application TEXT NOT NULL,
                response TEXT NOT NULL,
                analysis TEXT NOT NULL,
                risk TEXT NOT NULL,
                consequence TEXT NOT NULL,
                decision TEXT NOT NULL
            )
            """
        )

        connection.commit()

    finally:
        connection.close()