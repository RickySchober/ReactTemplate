from fastapi import Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database import get_session
from app.auth.models import User
from sqlmodel import select
from app.trades.schemas import TradeOfferWrite

async def validate_trade_users(
    data: TradeOfferWrite,
    session: AsyncSession = Depends(get_session),
) -> tuple[User, User]:
    stmt = select(User).where(User.id.in_([data.a_user_id, data.b_user_id]))
    result = await session.exec(stmt)
    users = result.all()

    if len(users) != 2:
        raise HTTPException(
            status_code=400,
            detail="One or more users do not exist",
        )
    if data.a_user_id == data.b_user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot create trade with yourself",
        )
    user_map = {user.id: user for user in users}
    return user_map[data.a_user_id], user_map[data.b_user_id]

async def validate_trade_participant(
        trade: TradeOfferWrite,
        user: User,
    ) -> User:
    if user.id != trade.a_user_id and user.id != trade.b_user_id:
        raise HTTPException(
            status_code=403,
            detail="User is not a participant in this trade",
        )
    return user
