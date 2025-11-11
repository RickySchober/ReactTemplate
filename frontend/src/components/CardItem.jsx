function CardItem({ card }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      textAlign: "center",
    }}>
      <img src={card.image_url} alt={card.name} style={{ width: "100%" }} />
      <h4>{card.name}</h4>
      <p style={{ margin: 0, fontSize: 14, color: '#555' }}>{card.set_name}</p>
      {card.print_description && (
        <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#888' }}>{card.print_description}</p>
      )}
      <p style={{ margin: '6px 0 0 0' }}>{card.owner}</p>
      <p style={{ margin: '6px 0 0 0' }}>${Number(card.price || 0).toFixed(2)}</p>
    </div>
  );
}

export default CardItem;
