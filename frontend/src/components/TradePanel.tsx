// src/components/TradePanel.tsx
import * as React from 'react';
import CardList from '../components/CardList'
import { card, TradeItem } from '../../types'; 

interface TradePanelProps {
  title: string;
  offerPrice: number;
  tradeItems: TradeItem[];
  isUserACurrentUser: boolean;
  onAddCardsClick: () => void;
  onProposeClick: () => void;
  updateAmount: (card: card, amount: number) => void;
}

const TradePanel: React.FC<TradePanelProps> = ({
  title,
  offerPrice,
  tradeItems,
  isUserACurrentUser,
  onAddCardsClick,
  onProposeClick,
  updateAmount,
}) => {
  return (
    <div className="w-1/2 p-4 m-4 bg-neutral-900 rounded-2xl shadow-lg">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">{title}</h2>
          <p className="text-gray-300 mb-4">Total Value: ${offerPrice}</p>
        </div>
        <div className="flex justify-between">
            <button
              onClick={onAddCardsClick}
              className="mb-4 mx-2 rounded-lg"
            >
              Add Cards
            </button>
          <button
            onClick={onProposeClick}
            className="mb-4 mx-2 rounded-lg"
          >
            Proposing
          </button>
        </div>
      </div>
      <div
        className={`${tradeItems.length === 0 ? "" : "bg-neutral-800"} 
          rounded-xl p-4
        `}
      >
        <CardList cards={tradeItems.map(item => item.card)} modQuant={updateAmount} />
      </div>
    </div>
  );
};

export default TradePanel;
/*
{/* A Trader's Cards 
          <div className="w-1/2 p-4 m-4 bg-neutral-900 rounded-2xl shadow-lg">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  My Cards
                </h2>
                <p className="text-gray-300 mb-4">
                  Total Value: ${aOfferPrice}
                </p>
              </div>
             <div className="flex justify-between">
              <button
                onClick={() => setViewMyCards(true)}
                className="mb-4 mx-2 rounded-lg"
              >
                Add Cards
              </button>
              <button
                onClick={() => postTrade()}
                className="mb-4 mx-2 rounded-lg"
              >
                Proposing
              </button>
              </div>
            </div>
            <div
              className={`${aTradeItems.length === 0 ? "" : "bg-neutral-800"} 
                rounded-xl p-4
                `}
            >
              <CardList cards={aTradeItems} modQuant={updateAmount} />
            </div>
          </div>

          <div className="w-1/2 p-4 m-4 bg-neutral-900 rounded-2xl shadow-lg">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                 Trader Cards
                </h2>
                <p className="text-gray-300 mb-4">
                  Total Value: ${bOfferPrice}
                </p>
              </div>
             <div className="flex justify-between">
              <button
                onClick={() => setViewTraderCards(true)}
                className="mb-4 mx-2 rounded-lg"
              >
                Add Cards
              </button>
              <button
                onClick={() => setViewTraderCards(true)}
                className="mb-4 mx-2 rounded-lg"
              >
                Proposing
              </button>
              </div>
            </div>
            <div
              className={`${bTradeItems.length === 0 ? "" : "bg-neutral-800"} 
                rounded-xl p-4
                `}
            >
              <CardList cards={bTradeItems} modQuant={updateAmount} />
            </div>
          </div>*/