function CardItem({ card }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      textAlign: "center",
    }}>
      <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
      <h4>{card.name}</h4>
      <p>{card.set_name}</p>
      <p>${card.price.toFixed(2)}</p>
    </div>
  );
}

export default CardItem;
