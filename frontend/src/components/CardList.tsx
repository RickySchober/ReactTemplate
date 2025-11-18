import CardItem from "./CardItem";
import * as React from "react";
import { card } from "../../types";

interface CardListProps {
  cards: card[];
  onSelect?: (card: card) => void;
  triggerUpdate?: () => void;
  modJuant?: (card: card, amount: number) => void;
  children?: (card: card) => React.ReactNode;
}

const CardList: React.FC<CardListProps> = ({
  cards,
  onSelect,
  triggerUpdate,
  modJuant,
  children
}) => {
  if (!cards || !cards.length) return <p>No cards found.</p>;
  function handleClick(card: card) {
    onSelect?.(card);
  }
  return (
    <div className="@container">
    <div className= "grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-2 onSelect:cursor-pointer">
      {cards.map((card) => (
        <div key={card.id} onClick={() => handleClick(card)}>
          <CardItem
            card={card}
            triggerUpdate={triggerUpdate}
            modJuant={modJuant}
            children={children?.(card)}
          />
        </div>
      ))}
    </div>
    </div>
  );
};
export default CardList;
