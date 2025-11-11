import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import CardList from "../components/CardList";

export default function UserProfilePage() {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function loadUser() {
      const res = await api.get(`/users/${id}`);
      setUsername(res.data.username);
      const cardsRes = await api.get(`/users/${id}/cards`);
      setCards(cardsRes.data);
    }
    loadUser();
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{username}'s Collection</h2>
      <CardList cards={cards} />
    </div>
  );
}
