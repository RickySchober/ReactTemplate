/* Creates a grid layout to display a lsit of cards dynamically adjusting
rows to best fit cards. Accepts either cards or TradeItems adjusting 
quantity values as necessary. 
*/
import CardItem from "./CardItem.js";
import * as React from "react";
import { card, TradeItem } from "../../types.js";

function isTradeItem(item: card | TradeItem): item is TradeItem {
  // Helper to check type
  return (
    (item as TradeItem).card !== undefined &&
    (item as TradeItem).quantity !== undefined
  );
}

interface CardListProps {
  cards: card[] | TradeItem[]; // Accept either card or TradeItem array
  onSelect?: (card: card) => void;
  modQuant?: (card: card, amount: number) => void;
  children?: (card: card) => React.ReactNode;
}

const CardList: React.FC<CardListProps> = ({
  cards,
  onSelect,
  modQuant,
  children,
}) => {
  if (!cards || !cards.length) return <p></p>;
  function handleClick(card: card) {
    onSelect?.(card);
  }
  return (
    <div className="@container">
      <div className="onSelect:cursor-pointer grid grid-cols-1 gap-2 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {cards.map((item: card | TradeItem) => {
          if (isTradeItem(item)) {
            //If elements are trade items set card quantity to maxQuant
            let maxQuant = item.card.quantity;
            let cardData = item.card;
            cardData = { ...cardData, quantity: item.quantity };
            return (
              <div key={cardData.id} onClick={() => handleClick(cardData)}>
                <CardItem
                  card={cardData}
                  modQuant={modQuant}
                  maxQuant={maxQuant}
                  children={children?.(cardData)}
                />
              </div>
            );
          } else {
            let cardData = item;
            return (
              <div key={cardData.id} onClick={() => handleClick(cardData)}>
                <CardItem
                  card={cardData}
                  modQuant={modQuant}
                  children={children?.(cardData)}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
export default CardList;
