from fastapi import FastAPI, Depends, HTTPException
from .database import init_db
from .routes import cards, auth
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from .database import get_session
from .models import User
app = FastAPI(title="MTG Trader API")

app.add_middleware(
    CORSMiddleware,
    # allow both common dev ports and local network during development
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
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

@app.get("/")
def root():
    return {"message": "Welcome to MTG Trader API (SQLModel)"}

@app.get("/users/{user_id}")
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "username": user.username, "email": user.email}