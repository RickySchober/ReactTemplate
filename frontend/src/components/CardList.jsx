import CardItem from "./CardItem";
export default function CardList({ cards }) {
  if (!cards || !cards.length) return <p>No cards found.</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px",
        alignItems: "start",
      }}>
      {cards.map((card) => (
        <div key={card.id}>
            <CardItem card={card} />
        </div>
      ))}
    </div>
  );
}
