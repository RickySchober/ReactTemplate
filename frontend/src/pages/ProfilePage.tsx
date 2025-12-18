/* Profile to view modify and add cards from collection. Collection
  is sortable and cards can be added using search bar or pasting a
  decklist into a textbox. In either case scryfall api is called to 
  validate cards.
*/
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import CardList from "../components/CardList.js";
import SearchCard from "../components/SearchCard.js";
import SortDropdown from "../components/SortDropdown.js";
import NavBar from "../components/NavBar.js";
import ToggleSwitch from "../components/ToggleSwitch.js";
import Backsplash from "../components/Backsplash.js";
import MultiTutorialPopup from "../components/TutorialPopup.js";
import Button from "../components/Button.js";
import * as React from "react";
import { card, SortOption } from "../lib/types.js";
import { sortCards } from "../lib/utils.js";
import { profileTutorialSteps } from "../lib/constants.js";
import { useLocalStorageState } from "../lib/hooks.js";

const ProfilePage: React.FC = () => {
  const [cards, setCards] = useState<card[]>([]);
  const [add, setAdd] = useState<boolean>(false); // toggle state between viewing and adding cards
  const [haves, setHaves] = useState<boolean>(false); // toggle state between wants and haves
  const [bgArt, setBgArt] = useState<string>("");
  //UI utilities
  const [showListInput, setShowListInput] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DATE_ADDED);
  const [ascending, setAscending] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [listText, setListText] = useState<string>("");

  useEffect(() => {
    fetchMyCards();
  }, []);

  async function fetchMyCards() {
    const me = await api.get("/auth/me");
    const myData = me.data;
    let artUrl = "/backsplashes/" + (myData.settings?.backsplash ?? "Gudul_Lurker.jpg");
    setBgArt(artUrl);
    const res = await api.get("/auth/my_cards");

    setCards(res.data);
  }

  async function addFromSearch(card: card) {
    console.log(card);
    try {
      const res = await api.post("/cards/", card);
      const cards = await api.get("/auth/my_cards");
      setCards(cards.data);
    } catch (err) {
      alert("Failed to add card");
      return null;
    }
  }
  //Modifies quantity of a card removing it if 0
  async function modifyQuantity(card: card, quantity: number) {
    try {
      await api.patch(`/cards/${card.id}`, { quantity });
      await fetchMyCards();
    } catch (err) {
      console.error("Failed to modify quantity", err);
    }
  }
  const sortedCards = sortCards(cards, sortOption, ascending, haves ? "have" : "want");
  const FIVE_MIN = 60 * 5 * 1000; // ms
  function isRecent(card: card): boolean {
    const cardDate = new Date(card.date_added ?? Date.now()).getTime();
    const now = Date.now();
    return now - cardDate <= FIVE_MIN;
  }
  //List of cards added in last 5 minutes
  const sortedRecent = sortCards(cards, sortOption, ascending, haves ? "have" : "want", [isRecent]);

  return (
    <>
      <NavBar />
      <MultiTutorialPopup pages={profileTutorialSteps} keyName="profile-tutorial" />
      <Backsplash bgArt={bgArt}>
        <ProfileControls
          haves={haves}
          setHaves={setHaves}
          add={add}
          setAdd={setAdd}
          sortOption={sortOption}
          setSortOption={setSortOption}
          ascending={ascending}
          setAscending={setAscending}
          setShowSearch={setShowSearch}
          setShowListInput={setShowListInput}
        />
        {showSearch && add && (
          <SearchCard onSelect={addFromSearch} placeholder="Search for a card to add..." />
        )}
        {showListInput && add && (
          <div className="mt-4">
            <div className="mb-1.5 text-2xl font-semibold">Paste list (one card per line):</div>
            <textarea
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              placeholder={`Example:\n1 Lightning Bolt (STA) \n1x Artist's Talent (BLB)`}
              rows={8}
              className="w-3/5 rounded-md border border-gray-700 bg-transparent p-2.5 text-base text-white"
            />
            <div className="mt-2 flex gap-2">
              <Button
                onClick={async () => {
                  await parseAndAddList();
                }}
              >
                Parse & Add
              </Button>
              <Button onClick={() => setListText("")}>Clear</Button>
            </div>
          </div>
        )}
        {add && sortedRecent.length > 0 && (
          <div className="ml-4 text-3xl font-bold">Recently Added Cards:</div>
        )}
        {add && sortedRecent.length > 0 && (
          <CardList cards={sortedRecent} modQuant={modifyQuantity} />
        )}
        {!add && sortedCards.length > 0 ? (
          <ProfileCollection
            sortedCards={sortedCards}
            modifyQuantity={modifyQuantity}
            haves={haves}
          />
        ) : (
          <div className="mt-3 text-xl">No cards in collection select add.</div>
        )}
      </Backsplash>
    </>
  );

  async function parseAndAddList() {
    if (!listText.trim()) {
      alert("Empty textbox.");
      return;
    }

    const lines = listText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) {
      alert("No card lines found.");
      return;
    }

    /* helper to parse lines of the exact required format:
     Quantity, name, set identifier in parentheses. Lines without quantity or without a set are ignored.
    Examples accepted: "1x Umara Wizard (ZNR)", "2 Lightning Bolt (M21)"; trailing text after the ) is ignored.
    */
    function parseLine(line: string): { qty: number; name: string; setId: string } | null {
      const m = line.match(/^\s*(\d+)\s*x?\s+(.+?)\s*\(([^)]+)\)/i);
      if (!m) return null; // ignore lines that don't match the required format
      const qty = parseInt(m[1], 10);
      const name = m[2].trim();
      const setId = m[3].trim();
      return { qty, name, setId };
    }

    let added: number = 0;
    let failed: number = 0;
    let ignored: number = 0;

    for (const raw of lines) {
      const parsed = parseLine(raw);
      if (!parsed) {
        ignored += 1;
        continue;
      }
      const { qty, name, setId } = parsed;
      try {
        // Try Scryfall named endpoint with exact name + set code first (best chance for exact edition match)
        const setCode = encodeURIComponent(setId.toLowerCase());
        const exactUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
          name
        )}&set=${setCode}`;
        let res = await fetch(exactUrl);
        let card;
        if (!res.ok) {
          // fallback: fuzzy by name and set
          const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
            `${name} set:${setId}`
          )}`;
          res = await fetch(fuzzyUrl);
          if (!res.ok) throw new Error(`Scryfall lookup failed for ${name} (${setId})`);
          const searchResult = await res.json();
          if (!searchResult.data || searchResult.data.length === 0)
            throw new Error(`No results for ${name} (${setId})`);
          card = searchResult.data[0];
        } else {
          card = await res.json();
        }

        const payload = {
          name: card.name,
          set_name: card.set_name || card.set || "",
          rarity: card.rarity || "",
          price: card.prices?.usd ? parseFloat(card.prices.usd) : 0,
          image_url: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "",
          quantity: qty,
          intent: haves ? "have" : "want",
        };

        try {
          const res: card = await api.post("/cards/", payload);
          added += 1;
        } catch (err) {
          console.error("Failed to add line:", raw, err);
          failed += 1;
        }
      } catch (err) {
        console.error("Failed to add line:", raw, err);
        failed += 1;
      }
    }

    await fetchMyCards();
    setListText("");
    alert(`Added ${added} cards. ${failed ? `${failed} failed.` : ""}`);
  }
};
export default ProfilePage;

const ProfileControls: React.FC<{
  haves: boolean;
  setHaves: (haves: boolean) => void;
  add: boolean;
  setAdd: (add: boolean) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  ascending: boolean;
  setAscending: (asc: boolean) => void;
  setShowSearch: (show: boolean) => void;
  setShowListInput: (show: boolean) => void;
}> = ({
  haves,
  setHaves,
  add,
  setAdd,
  sortOption,
  setSortOption,
  ascending,
  setAscending,
  setShowSearch,
  setShowListInput,
}) => {
  return (
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
            setShowListInput(false);
            setShowSearch(true);
          }}
        >
          Add by Search
        </Button>
      )}
      {add && (
        <Button
          onClick={() => {
            setShowListInput(true);
            setShowSearch(false);
          }}
        >
          Add by List
        </Button>
      )}
      {/* Later feature add && <button>Add by Photo</button>*/}
    </div>
  );
};

const ProfileCollection: React.FC<{
  sortedCards: card[];
  modifyQuantity: (card: card, quantity: number) => void;
  haves: boolean;
}> = ({ sortedCards, modifyQuantity, haves }) => {
  const navigate = useNavigate();
  function handleSearchSelection(card: card) {
    const q = encodeURIComponent(card?.name || "");
    navigate(`/search?q=${q}`);
  }
  return sortedCards.length > 0 ? (
    <CardList
      cards={sortedCards}
      modQuant={modifyQuantity}
      children={(card: card) =>
        haves ? <></> : <Button onClick={() => handleSearchSelection(card)}>Trade for Card</Button>
      }
    />
  ) : (
    <div className="mt-3 text-xl">No cards in collection select add.</div>
  );
};
