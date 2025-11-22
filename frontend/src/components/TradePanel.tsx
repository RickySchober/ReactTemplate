// src/components/TradePanel.tsx
import * as React from "react";
import CardList from "../components/CardList";
import { card, TradeItem, trade, TradeStatus, ActiveUser } from "../../types";

interface TradePanelProps {
  trade: trade;
  userA: boolean; // True if panel is for userA flase for userB
  close?: () => void; 
  onAddCardsClick: () => void;
  onProposeClick?: () => void;
  updateAmount: (card: card, amount: number) => void;
}

const TradePanel: React.FC<TradePanelProps> = ({
  trade,
  userA,
  close,
  onAddCardsClick,
  onProposeClick,
  updateAmount,
}) => {

  const userID: number = userA ? trade.a_user.id : trade.b_user.id;
  const myOffer: TradeItem[] = trade.trade_items.filter(
    (item) => item.card.owner_id === userID
  );
  const offerPrice: string = myOffer
    .reduce((sum, item) => {
      return sum + item.card.price*item.quantity;
    }, 0)
    .toFixed(2);
  const active =
   !(trade.activeUser == ActiveUser.NONE) && (userA && trade.activeUser == "a" || !userA && trade.activeUser == "b");

  function getStatusMessage(status: TradeStatus): string {
    switch (status) {
      case TradeStatus.PENDING:
        return close ? "Propose Trade" : "";
      case TradeStatus.PROPOSE:
        return active ? "Proposed Trade" : (close ? "Accept" : "Reviewing Trade");
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
  function printStatus(){
    console.log(active) 
    onProposeClick()
  }
  return (
    <div className="w-1/2 p-4 m-4 bg-neutral-900 rounded-2xl shadow-lg">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">{userA ? trade.a_user.username : trade.b_user.username}</h2>
          <p className="text-gray-300 mb-4">Total Value: ${offerPrice}</p>
        </div>
        <div className="flex justify-between">
          { (trade.status==TradeStatus.PROPOSE || trade.status==TradeStatus.PENDING) &&
          <button onClick={onAddCardsClick} className="bg-blue-400 px-4 my-3.5 mx-2 text-lg">
            Add Cards
          </button>}
          <h1>Status:</h1>
          { getStatusMessage(trade.status).length!==0 &&
            <button
            disabled={active}
            onClick={printStatus}
            className={`
              px-4 my-3.5 mx-2 text-lg
              font-semibold 
              transition-colors duration-150 ease-in-out
              ${
                active
                  ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }
          `}>
            {getStatusMessage(trade.status)}
          </button>}
          {(close && (trade.status == TradeStatus.PENDING || trade.status == TradeStatus.PROPOSE)) 
          &&<button className="bg-red-600 hover:bg-red-700 px-4 my-3.5 mx-2 text-lg" onClick={close}>
            Close
          </button>
          }
        </div>
      </div>
      <div
        className={`${myOffer.length === 0 ? "" : "bg-neutral-800"} 
          rounded-xl p-4
        `}
      >
        {(trade.status == TradeStatus.PENDING || trade.status == TradeStatus.PROPOSE) &&
          <CardList
          cards={myOffer}
          modQuant={updateAmount}
          />
        }
        {!(trade.status == TradeStatus.PENDING || trade.status == TradeStatus.PROPOSE) &&
          <CardList
          cards={myOffer}
        />
        }
      </div>
    </div>
  );
};

export default TradePanel;