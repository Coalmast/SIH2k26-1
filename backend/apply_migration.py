import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@127.0.0.1:54322/postgres")

async def run_migration():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        from sqlalchemy import text
        # Add columns
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;"))
            print("Added column expo_push_token to users table.")
        except Exception as e:
            print(f"Error adding column expo_push_token: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS keycloak_subject VARCHAR;"))
            print("Added column keycloak_subject to users table.")
        except Exception as e:
            print(f"Error adding column keycloak_subject: {e}")
        
        # Enable Realtime
        try:
            await conn.execute(text("ALTER PUBLICATION supabase_realtime ADD TABLE alerts;"))
            print("Enabled Realtime on alerts table.")
        except Exception as e:
            print(f"Error enabling Realtime: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
