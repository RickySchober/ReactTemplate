from app.trades import trades
from app.auth import auth
from fastapi import FastAPI
from app.cards import cards
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
import os

app = FastAPI(title="MTG Trader API")

NETLIFY_URL = os.getenv("NETLIFY_URL", "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        NETLIFY_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(cards.router)
app.include_router(auth.router)
app.include_router(trades.router)

