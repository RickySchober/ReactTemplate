/* User profile page is not complete and currently inacessible 
   but in the future will display other users collections.
*/
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import CardList from "../components/CardList";
import * as React from "react";
import { card } from "../../types";

const UserProfilePage: React.FC = () => {
  const { id } = useParams<number>();
  const [cards, setCards] = useState<card[]>([]);
  const [username, setUsername] = useState<string>("");

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
};
export default UserProfilePage;
