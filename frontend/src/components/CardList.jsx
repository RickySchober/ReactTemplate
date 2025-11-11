import CardItem from "./CardItem";
export default function CardList({ cards, onSelect }) {
  if (!cards || !cards.length) return <p>No cards found.</p>;
  function handleClick(card){
    onSelect?.(card);
  }
  return (
    

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px",
        alignItems: "start",
      }}>
      {cards.map((card) => (
        <div key={card.id} onClick={() => handleClick(card)}>
          <CardItem card={card} />
        </div>
      ))}
    </div>
  );
}
