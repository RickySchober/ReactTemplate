/* Profile to view modify and add cards from collection. Collection
  is sortable and cards can be added using search bar or pasting a
  decklist into a textbox. In either case scryfall api is called to 
  validate cards.
*/
import { useState, useEffect } from "react";
import React from "react";

import ProfileCollection from "./components/ProfileCollection.js";

import api from "@/api/client.js";
import Backsplash from "@/components/Backsplash.js";
import MultiTutorialPopup from "@/components/TutorialPopup.js";
import { PROFILE_TUTORIAL_STEPS } from "@/lib/constants.js";
import { card } from "@/lib/types.js";

const ProfilePage: React.FC = () => {
  const [cards, setCards] = useState<card[]>([]);
  const [bgArt, setBgArt] = useState<string>("");

  useEffect(() => {
    fetchMyProfile();
  }, []);

  async function fetchMyProfile() {
    const me = await api.get("/auth/me");
    const myData = me.data;
    const artUrl = "/backsplashes/" + (myData.settings?.backsplash ?? "Gudul_Lurker.jpg");
    setBgArt(artUrl);
    const res = await api.get("/auth/my_cards");
    setCards(res.data);
    console.log(res.data);
  }
  async function refreshCards() {
    const res = await api.get("/auth/my_cards");
    setCards(res.data);
  }
  return (
    <>
      <MultiTutorialPopup pages={PROFILE_TUTORIAL_STEPS} keyName="profile-tutorial" />
      <Backsplash bgArt={bgArt}>
        <ProfileCollection cards={cards} refreshCards={refreshCards} />
      </Backsplash>
    </>
  );
};
export default ProfilePage;
