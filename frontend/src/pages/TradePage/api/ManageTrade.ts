import { NewTradeInfo } from "../TradePage.js";

import { api } from "@/api/client.js";
import { TradeStatus, ActiveUser, TradeItem, trade, card, TradePayload } from "@/lib/types.js";
import { createTradePayload } from "@/lib/utils.js";

// If new trade being created read in arguments and create trade object
export async function initializeTrade(newTradeInfo: NewTradeInfo): Promise<trade> {
  const a_user = await api.get("/auth/user/" + newTradeInfo.myID);
  const b_user = await api.get("/auth/user/" + newTradeInfo.traderID);
  const cards = newTradeInfo.traderOffer;
  const trade_items: TradeItem[] = [];
  cards.forEach((card: card) =>
    trade_items.push({
      id: "",
      card: card,
      quantity: 1,
    })
  );
  const trade: trade = {
    id: "",
    status: TradeStatus.PENDING,
    activeUser: ActiveUser.NONE,
    a_user: a_user.data,
    b_user: b_user.data,
    trade_items: trade_items,
  };
  return trade;
}
export async function postTrade(trade: trade, tradeID: string | undefined) {
  const tradePayload: TradePayload = createTradePayload(trade);
  if (tradeID && (await api.get("/trades/" + tradeID))) {
    console.log("trade found patching");
    await api.patch("/trades/" + tradeID, tradePayload);
  } else if (trade.status !== TradeStatus.CANCELED) {
    //Do not post trade if its immediately canceled
    console.log("trade not found creating new one");
    await api.post("/trades/", tradePayload);
  }
}
// Fetch both users' cards and the trade details.
// Validate that all cards in trade still exist and are owned by the correct users.
export async function fetchTrade(tradeID: string): Promise<trade> {
  console.log("fetching trade");
  const tradeResponse = await api.get("/trades/" + tradeID);
  console.log(tradeResponse.data);
  return tradeResponse.data;
}

export async function closeTrade(trade: trade, userA: boolean): Promise<trade> {
  const users = userA ? ActiveUser.A : ActiveUser.B;
  const updateTrade = {
    ...trade,
    status: TradeStatus.CANCELED,
    activeUser: users,
  };
  await postTrade(updateTrade, trade.id);
  return updateTrade;
}
