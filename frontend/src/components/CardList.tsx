import CardItem from "./CardItem";
import * as React from "react";
import { card, TradeItem } from "../../types";

function isTradeItem(item: card | TradeItem): item is TradeItem { // Helper to check type
  return (item as TradeItem).card !== undefined && (item as TradeItem).quantity !== undefined;
}

interface CardListProps {
  cards: card[] | TradeItem[]; // Accept either card or TradeItem array
  onSelect?: (card: card) => void;
  modQuant?: (card: card, amount: number) => void;
  maxQuant?: number;
  children?: (card: card) => React.ReactNode;
}

const CardList: React.FC<CardListProps> = ({
  cards,
  onSelect,
  modQuant,
  maxQuant,
  children
}) => {
  if (!cards || !cards.length) return <p></p>;
  function handleClick(card: card) {
    onSelect?.(card);
  }
  return (
    <div className="@container">
    <div className= "grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-2 onSelect:cursor-pointer">
      {cards.map((item: card | TradeItem) => {
          if (isTradeItem(item)) {
            let maxQuant = item.card.quantity;
            let cardData = item.card;
            cardData = {...cardData, quantity: item.quantity}
            return (
              <div key={cardData.id} onClick={() => handleClick(cardData)}>
                <CardItem
                  card={cardData}
                  modQuant={modQuant}
                  maxQuant={maxQuant}
                  children={children?.(cardData)}
                />
              </div>
            )
          } else {
            let cardData = item
            return (
              <div key={cardData.id} onClick={() => handleClick(cardData)}>
                <CardItem
                  card={cardData}
                  modQuant={modQuant}
                  children={children?.(cardData)}
                />
              </div>
            )
          }
         })}
    </div>
    </div>
  );
};
export default CardList;
