from pathlib import Path
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import declarative_base, sessionmaker

    DB_DIR = Path(__file__).resolve().parent
    DB_PATH = DB_DIR / "transport_ai.db"
    DATABASE_URL = f"sqlite:///{DB_PATH}"

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    HAS_SQLALCHEMY = True
except ModuleNotFoundError:
    HAS_SQLALCHEMY = False
    engine = None
    SessionLocal = None
    Base = object


def get_db():
    """Dependency for FastAPI route handlers."""
    if not SessionLocal:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables on application startup."""
    if not HAS_SQLALCHEMY:
        print("[Database] Deferred database initialization (SQLAlchemy not installed)")
        return
    try:
        try:
            from Backend.database import models  # noqa: F401
        except ModuleNotFoundError:
            try:
                from backend.database import models  # noqa: F401
            except ModuleNotFoundError:
                from database import models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        print(f"[Database] SQLite database initialized at: {DB_PATH}")
    except Exception as e:
        print(f"[Database] Initialization deferred ({e})")
