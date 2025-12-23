/* Creates a grid layout to display a lsit of cards dynamically adjusting
rows to best fit cards. Accepts either cards or TradeItems adjusting 
quantity values as necessary. 
*/
import CardItem from "./CardItem.js";
import React from "react";
import { card, TradeItem } from "@/lib/types.js";

function isTradeItem(item: card | TradeItem): item is TradeItem {
  // Helper to check type
  return (item as TradeItem).card !== undefined && (item as TradeItem).quantity !== undefined;
}

interface CardListProps {
  cards: card[] | TradeItem[]; // Accept either card or TradeItem array
  modQuant?: (card: card, amount: number) => void;
  children?: (card: card) => React.ReactNode;
}

const CardList: React.FC<CardListProps> = ({ cards, modQuant, children }) => {
  if (!cards || !cards.length) return <p></p>;
  return (
    <div className="@container">
      <div className="onSelect:cursor-pointer mt-4 grid grid-cols-1 gap-2 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {cards.map((item: card | TradeItem) => {
          if (isTradeItem(item)) {
            //If elements are trade items set card quantity to maxQuant
            let maxQuant = item.card.quantity;
            let cardData = item.card;
            cardData = { ...cardData, quantity: item.quantity };
            return (
              <CardItem
                card={cardData}
                modQuant={modQuant}
                maxQuant={maxQuant}
                children={children?.(cardData)}
              />
            );
          } else {
            let cardData = item;
            return <CardItem card={cardData} modQuant={modQuant} children={children?.(cardData)} />;
          }
        })}
      </div>
    </div>
  );
};
export default CardList;
