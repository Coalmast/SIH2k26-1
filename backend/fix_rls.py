import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def fix():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:54322/postgres')
    async with engine.begin() as conn:
        print("Creating missing RLS policy for inspections...")
        await conn.execute(text("CREATE POLICY insp_authenticated ON inspections FOR ALL USING ((select auth.role()) = 'authenticated');"))
        print("Policy created successfully!")

if __name__ == "__main__":
    asyncio.run(fix())
