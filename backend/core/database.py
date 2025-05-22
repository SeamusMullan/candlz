import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./candlz_game.db")

# SQLite specific configuration for better performance
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,
            "timeout": 30,
            "isolation_level": None,  # Autocommit mode
        },
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
else:
    # PostgreSQL or other databases
    engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session.
    Used with FastAPI's Depends() function.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """
    Create all database tables.
    Should be called on application startup.
    """
    from .models import Base as ModelsBase
    ModelsBase.metadata.create_all(bind=engine)

def drop_tables():
    """
    Drop all database tables.
    Use with caution - this will delete all data!
    """
    from .models import Base as ModelsBase
    ModelsBase.metadata.drop_all(bind=engine)

def reset_database():
    """
    Drop and recreate all tables.
    Use for development/testing only!
    """
    drop_tables()
    create_tables()

class DatabaseManager:
    """
    Database manager for handling common database operations.
    """
    
    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal
    
    def get_session(self) -> Session:
        """Get a new database session."""
        return self.SessionLocal()
    
    from typing import Optional

    from sqlalchemy import text

    def execute_query(self, query: str, params: Optional[dict] = None) -> list:
        """Execute raw SQL query and return results as list of dicts."""
        with self.get_session() as session:
            result = session.execute(text(query), params or {})
            return [dict(row._mapping) for row in result.fetchall()]
    
    def health_check(self) -> bool:
        """Check if database connection is healthy."""
        try:
            with self.get_session() as session:
                session.execute(text("SELECT 1"))
                return True
        except Exception:
            return False
    
    def get_table_info(self) -> dict:
        """Get information about database tables."""
        try:
            with self.get_session() as session:
                if DATABASE_URL.startswith("sqlite"):
                    # SQLite specific query
                    result = session.execute(
                        text("SELECT name FROM sqlite_master WHERE type='table'")
                    )
                    tables = [row[0] for row in result.fetchall()]
                    
                    table_info = {}
                    for table in tables:
                        count_result = session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        row = count_result.fetchone()
                        count = row[0] if row is not None else 0
                        table_info[table] = {"row_count": count}
                    
                    return table_info
                else:
                    # PostgreSQL or other databases
                    result = session.execute(
                        text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
                    )
                    tables = [row[0] for row in result.fetchall()]
                    
                    table_info = {}
                    for table in tables:
                        count_result = session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        row = count_result.fetchone()
                        count = row[0] if row is not None else 0
                        table_info[table] = {"row_count": count}
                    
                    return table_info
        except Exception as e:
            return {"error": str(e)}

# Global database manager instance
db_manager = DatabaseManager()