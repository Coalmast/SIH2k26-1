from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os

# Connect to the local Supabase PostgreSQL database
# Default local Supabase DB URL: postgresql+asyncpg://postgres:postgres@localhost:54322/postgres
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:54322/postgres")

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session