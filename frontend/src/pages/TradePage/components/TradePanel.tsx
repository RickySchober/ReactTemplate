/* Component to break up trade window. Displays all of users cards offered
   in trade as well as buttons for status and adding cards.
*/
import React from "react";

import Button from "@/components/Button.js";
import CardList from "@/components/CardList.js";
import { card, TradeItem, trade, TradeStatus, ActiveUser } from "@/lib/types.js";

interface TradePanelProps {
  trade: trade;
  setTrade: React.Dispatch<React.SetStateAction<trade>>;
  userA: boolean; // True if panel is for userA false for userB
  close?: () => void; //Close button which only exists for current user's panel
  onAddCardsClick: () => void;
  onProposeClick?: () => void;
}

const TradePanel: React.FC<TradePanelProps> = ({
  trade,
  setTrade,
  userA,
  close,
  onAddCardsClick,
  onProposeClick,
}) => {
  const userID: string = userA ? trade.a_user.id! : trade.b_user.id!;
  const myOffer: TradeItem[] = trade.trade_items.filter(
    (item: TradeItem) => item.card.owner_id === userID
  );
  const offerPrice: string = myOffer
    .reduce((sum, item) => {
      return sum + item.card.price * item.quantity;
    }, 0)
    .toFixed(2);
  //active determines whether the panels user was the last on to submit an action
  const active: boolean =
    !(trade.activeUser == ActiveUser.NONE) &&
    ((userA && trade.activeUser == "a") || (!userA && trade.activeUser == "b"));
  //Return appropriate message based on user and active
  function getStatusMessage(status: TradeStatus): string {
    switch (status) {
      case TradeStatus.PENDING:
        return close ? "Propose Trade" : "";
      case TradeStatus.PROPOSE:
        return active ? "Proposed Trade" : close ? "Accept" : "Reviewing Trade";
      case TradeStatus.SHIP:
        return active ? "Shipped" : "Ship";
      case TradeStatus.RECEIVE:
        return active ? "Received" : "Receive";
      case TradeStatus.COMPLETED:
        return "Completed";
      case TradeStatus.CANCELED:
        return "Canceled";
      default:
        return "Unknown status.";
    }
  }
  function printStatus() {
    console.log(active);
    if (onProposeClick !== undefined) {
      onProposeClick();
    }
  }
  // This function updates the quantity of a card in either offer removing if 0
  function updateAmount(card: card, amount: number) {
    const index: number = trade.trade_items.findIndex((item: TradeItem) => item.card.id == card.id);
    if (index === -1) {
      console.warn("Trade item not found for update.");
      return;
    }
    const updatedTradeItems = trade.trade_items.map((item, ind) => {
      if (ind === index) {
        return { ...item, quantity: amount };
      }
      return item;
    });
    setTrade((prev) => ({
      ...prev,
      status: TradeStatus.PENDING,
      activeUser: ActiveUser.NONE,
      trade_items: updatedTradeItems.filter((item) => item.quantity > 0),
    }));
  }
  return (
    <div className="m-4 w-1/2 rounded-2xl bg-neutral-900 p-4 shadow-lg">
      <div className="flex flex-wrap justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-semibold text-white">
            {userA ? trade.a_user.username : trade.b_user.username}
          </h2>
          <p className="mb-4 text-gray-300">Total Value: ${offerPrice}</p>
        </div>
        <div className="flex flex-wrap items-baseline justify-between">
          {(trade.status == TradeStatus.PROPOSE || //Can only modify trade in these phases
            trade.status == TradeStatus.PENDING) && (
            <Button onClick={onAddCardsClick}>View Collection</Button>
          )}
          {getStatusMessage(trade.status).length > 0 && (
            <h1 className="pl-2 text-2xl font-medium">Status:</h1>
          )}
          {getStatusMessage(trade.status).length !== 0 && (
            <Button
              disabled={active || !close}
              onClick={printStatus}
              className={`mx-2 px-4 py-2 text-lg font-semibold transition-colors duration-150 ease-in-out ${
                active
                  ? "cursor-not-allowed bg-gray-400 text-gray-700"
                  : close
                    ? "cursor-pointer bg-blue-400 text-white hover:bg-blue-500"
                    : "cursor-not-allowed bg-gray-400 text-gray-700"
              } `}
            >
              {getStatusMessage(trade.status)}
            </Button>
          )}
          {close &&
            (trade.status == TradeStatus.PENDING || //Can only modify trade in these phases
              trade.status == TradeStatus.PROPOSE) && (
              <Button className="mx-2 bg-red-600 hover:bg-red-700" onClick={close}>
                Close
              </Button>
            )}
        </div>
      </div>
      <div className={`${myOffer.length === 0 ? "" : "bg-neutral-800"} rounded-xl p-4`}>
        {(trade.status == TradeStatus.PENDING || //Can only modify trade in these phases
          trade.status == TradeStatus.PROPOSE) && (
          <CardList cards={myOffer} modQuant={updateAmount} />
        )}
        {!(trade.status == TradeStatus.PENDING || trade.status == TradeStatus.PROPOSE) && (
          <CardList cards={myOffer} />
        )}
      </div>
    </div>
  );
};

export default TradePanel;
