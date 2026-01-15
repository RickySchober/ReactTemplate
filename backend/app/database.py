import os
from sqlmodel import SQLModel, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlmodel.ext.asyncio.session import AsyncSession


DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres+asyncpg://"):
        DATABASE_URL = DATABASE_URL.replace("postgres+asyncpg://", "postgresql+asyncpg://", 1)

    engine = AsyncEngine(create_engine(
        DATABASE_URL,
        echo=False,            
    ))
else:
    DATABASE_URL = "sqlite+aiosqlite:///./cards.db"
    engine = AsyncEngine(create_engine(
        DATABASE_URL,
        echo=True,              
        connect_args={"check_same_thread": False},
    ))

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:
    Session = sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )
    async with Session() as session:
        yield session
