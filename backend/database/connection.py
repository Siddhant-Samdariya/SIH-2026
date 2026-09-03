from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database path: Backend/database/transport_ai.db
DB_DIR = Path(__file__).resolve().parent
DB_PATH = DB_DIR / "transport_ai.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Thread-safe SQLite engine with WAL mode for fast concurrent reads
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for FastAPI route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables on application startup."""
    from Backend.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print(f"[Database] SQLite database initialized at: {DB_PATH}")
