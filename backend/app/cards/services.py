from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.cards.models import Card
from app.trades.models import TradeItem, TradeOffer, TradeStatus, ActiveUser

#Removes card from any PENDING or PROPOSED trades
async def remove_from_trades(card: Card, session: AsyncSession):
    result = await session.exec(
        select(TradeItem)
        .join(TradeOffer)
        .where(
            TradeItem.card_id == card.id,
            TradeOffer.status.in_([TradeStatus.PENDING, TradeStatus.PROPOSE])
        )
    )
    draft_items = result.all()
    for item in draft_items:
        await session.delete(item)
        trade = await session.get(TradeOffer, item.trade_id)
        trade.status = TradeStatus.PENDING
        trade.activeUser = ActiveUser.NONE
        session.add(trade)

#Modifies card quantity from any PENDING or PROPOSED trades ensuring it does not exceed new quantity
async def modify_trade_quantity(card: Card, max_quantity: int, session: AsyncSession):
    result = await session.exec(
        select(TradeItem)
        .join(TradeOffer)
        .where(
            TradeItem.card_id == card.id,
            TradeOffer.status.in_([TradeStatus.PENDING, TradeStatus.PROPOSE])
        )
    )
    draft_items = result.all()
    for item in draft_items:
        if item.quantity > max_quantity:
            item.quantity = max_quantity
            session.add(item)
            trade = await session.get(TradeOffer, item.trade_id)
            trade.status = TradeStatus.PENDING
            trade.activeUser = ActiveUser.NONE
            session.add(trade)
