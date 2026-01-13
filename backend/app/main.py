from app.trades import trades
from app.auth import auth
from fastapi import FastAPI, Depends, HTTPException
from app.cards import cards
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from app.database import get_session, init_db
from app.auth.models import User
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
def on_startup():
    init_db()

app.include_router(cards.router)
app.include_router(auth.router)
app.include_router(trades.router)

@app.get("/users/{user_id}")
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "username": user.username, "email": user.email}