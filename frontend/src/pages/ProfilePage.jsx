import { useState, useEffect } from "react";
import api from "../api/client";
import CardList from "../components/CardList";
import SearchCard from "../components/SearchCard";

export default function ProfilePage() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    set_name: "",
    rarity: "",
    price: "",
    image_url: ""
  });
  async function fetchMyCards() {
    const res = await api.get("/auth/me");
    setCards(res.data);
  }

  async function addCard(e) {
    e.preventDefault();
    try {
      await api.post("/cards/", form);
      fetchMyCards();
    } catch (err) {
      alert("Failed to add card");
    }
  }

  useEffect(() => {
    fetchMyCards();
  }, []);
 // Called when an autocomplete suggestion is chosen
  function handleSelectCard(card) {
    setForm({
      name: card.name,
      set_name: card.set_name || card.set,
      rarity: card.rarity || "",
      price: card.prices?.usd ? parseFloat(card.prices.usd) : 0,
      image_url: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ""
    });
    // keep the search text in sync with selected card name
    setSearch(card.name);
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Collection</h2>
      <SearchCard
        value={search}
        onChange={setSearch}
        onSelect={handleSelectCard}
        placeholder="Search Card..."
      />
      <button onClick={addCard} className="bg-blue-600 text-white rounded p-2 mb-4">
        Add Card
      </button>
      <CardList cards={cards} />
    </div>
  );
}
