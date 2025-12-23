import React from "react";
import { useState } from "react";
import api from "@/api/client.js";
import { card, SortOption } from "@/lib/types.js";
import { RECENT_ADDED_WINDOW } from "@/lib/constants.js";
import { sortCards } from "@/lib/utils.js";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button.js";
import CardList from "@/components/CardList.js";
import ToggleSwitch from "@/components/ToggleSwitch.js";
import SortDropdown from "@/components/SortDropdown.js";
import ProfileAdd from "./ProfileAdd.js";

export type addOption = "list" | "search";

interface ProfileCollectionProps {
  cards: card[];
  refreshCards: () => void;
}

const ProfileCollection: React.FC<ProfileCollectionProps> = ({ cards, refreshCards }) => {
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DATE_ADDED);
  const [ascending, setAscending] = useState<boolean>(true);
  const [haves, setHaves] = useState<boolean>(true);
  const [add, setAdd] = useState<boolean>(false);
  const [addOption, setAddOption] = useState<addOption>("search");

  const sortedCards = sortCards(cards, sortOption, ascending, haves ? "have" : "want");
  function isRecent(card: card): boolean {
    const cardDate = new Date(card.date_added ?? Date.now()).getTime();
    const now = Date.now();
    return now - cardDate <= RECENT_ADDED_WINDOW;
  }
  //List of cards added in last 5 minutes
  const sortedRecent = sortCards(cards, sortOption, ascending, haves ? "have" : "want", [isRecent]);

  function handleSearchSelection(card: card) {
    const q = encodeURIComponent(card?.name || "");
    navigate(`/search?q=${q}`);
  }
  //Modifies quantity of a card removing it if 0
  async function modifyQuantity(card: card, quantity: number) {
    try {
      await api.patch(`/cards/${card.id}`, { quantity });
      refreshCards();
    } catch (err) {
      console.error("Failed to modify quantity", err);
    }
  }
  return (
    <>
      {/*  Control Panel  */}
      <div className="flex items-center justify-start gap-3">
        <ToggleSwitch
          value={haves}
          onChange={setHaves}
          leftLabel="Wants"
          rightLabel="Haves"
          id="profile-type-toggle"
        />
        <ToggleSwitch
          value={add}
          onChange={setAdd}
          leftLabel="View"
          rightLabel="Add"
          id="profile-view-toggle"
        />
        <SortDropdown
          sortField={sortOption}
          setSortField={setSortOption}
          ascending={ascending}
          setAscending={setAscending}
        />

        {add && (
          <Button
            onClick={() => {
              setAddOption("search");
            }}
          >
            Add by Search
          </Button>
        )}
        {add && (
          <Button
            onClick={() => {
              setAddOption("list");
            }}
          >
            Add by List
          </Button>
        )}
      </div>

      {add && (
        <ProfileAdd add={add} haves={haves} addOption={addOption} refreshCards={refreshCards} />
      )}
      {add && sortedRecent.length > 0 && (
        <>
          <div className="ml-4 text-3xl font-bold">Recently Added Cards:</div>
          <CardList cards={sortedRecent} modQuant={modifyQuantity} />
        </>
      )}
      {!add &&
        (sortedCards.length > 0 ? (
          <CardList
            cards={sortedCards}
            modQuant={modifyQuantity}
            children={(card: card) =>
              !haves && <Button onClick={() => handleSearchSelection(card)}>Trade for Card</Button>
            }
          />
        ) : (
          <div className="mt-3 text-xl">No cards in collection select add.</div>
        ))}
    </>
  );
};
export default ProfileCollection;
