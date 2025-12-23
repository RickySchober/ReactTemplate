import { ActiveUser, TradeStatus, trade } from "@/lib/types.js";

export function updateStatus(trade: trade, userA: boolean): trade {
  let users: ActiveUser;
  let status: TradeStatus;
  let updateTrade: trade = trade;
  switch (trade.status) {
    case TradeStatus.PENDING:
      users = userA ? ActiveUser.A : ActiveUser.B;
      updateTrade = {
        ...trade,
        status: TradeStatus.PROPOSE,
        activeUser: users,
      };
      break;
    case TradeStatus.PROPOSE:
      updateTrade = {
        ...trade,
        status: TradeStatus.SHIP,
        activeUser: ActiveUser.NONE,
      };
      break;
    case TradeStatus.SHIP:
      users =
        trade.activeUser == ActiveUser.NONE
          ? userA
            ? ActiveUser.A
            : ActiveUser.B
          : ActiveUser.NONE;
      status = users == ActiveUser.NONE ? TradeStatus.RECEIVE : TradeStatus.SHIP;
      updateTrade = { ...trade, status: status, activeUser: users };
      break;
    case TradeStatus.RECEIVE:
      users =
        trade.activeUser == ActiveUser.NONE
          ? userA
            ? ActiveUser.A
            : ActiveUser.B
          : ActiveUser.NONE;
      status = users == ActiveUser.NONE ? TradeStatus.COMPLETED : TradeStatus.RECEIVE;
      updateTrade = { ...trade, status: status, activeUser: users };
      break;
    case TradeStatus.COMPLETED:
      console.log("Completed");
      break;
    case TradeStatus.CANCELED:
      console.log("Cancelled");
      break;
  }
  return updateTrade;
}
