import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "campeonato.db"


def init_db():
    with db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS matches (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                match_day   INTEGER NOT NULL UNIQUE,
                date        TEXT NOT NULL,
                opponent_id TEXT NOT NULL,
                cam_goals   INTEGER NOT NULL,
                opp_goals   INTEGER NOT NULL,
                result      TEXT NOT NULL CHECK(result IN ('W','D','L')),
                points      INTEGER NOT NULL,
                answers     TEXT NOT NULL DEFAULT '[]',
                created_at  TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_match_day ON matches(match_day)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_date ON matches(date)")


@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
