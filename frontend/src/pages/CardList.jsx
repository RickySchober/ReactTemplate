import { useEffect, useState } from "react";
import axios from "axios";
import CardItem from "../components/CardItem";
import SearchCard from "../components/SearchCard";

function CardList() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/cards/")
      .then(res => setCards(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>All Cards</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 200px)", gap: 20 }}>
        {cards.map(card => <CardItem key={card.id} card={card} />)}
      </div>
    </div>
  );
}

export default CardList;
