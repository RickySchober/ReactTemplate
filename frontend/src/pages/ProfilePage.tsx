import { useState, useEffect } from "react";
import api from "../api/client";
import CardList from "../components/CardList";
import SearchCard from "../components/SearchCard";
import SortDropdown from "../components/SortDropdown";
import NavBar from "../components/NavBar";
import ToggleSwitch from "../components/ToggleSwitch";
import Backsplash from "../components/Backsplash";
import bgArt from "../assets/Gudul_Lurker.jpg";
import * as React from "react";
import { card, UserProfile } from "../../types";

const ProfilePage: React.FC = () => {
  const [cards, setCards] = useState<card[]>([]);
  const [add, setAdd] = useState<boolean>(false); // toggle state between viewing and adding cards
  const [haves, setHaves] = useState<boolean>(false); // toggle state between wants and haves
  const [recentAdded, setRecentAdded] = useState<card[]>([]); // track recently added cards during add session
  const [bgArt, setBgArt] = useState<string>("");
  //UI utilities
  const [searchRedirect, setSearchRedirect] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [showListInput, setShowListInput] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [ascending, setAscending] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [listText, setListText] = useState<string>("");

  useEffect(() => {
    fetchMyCards();
  }, []);

  async function fetchMyCards() {
    const me = await api.get("/auth/me");
    const myData = me.data;
    let artUrl =
      "/backsplashes/" + (myData.settings?.backsplash ?? "Gudul_Lurker.jpg");
    setBgArt(artUrl);
    const res = await api.get("/auth/my_cards");
    setCards(res.data);
  }

  async function addFromSearch(card) {
    let payload: card = {
      name: card.name,
      set_name: card.set_name || card.set || "",
      rarity: card.rarity || "",
      price: card.prices?.usd ? parseFloat(card.prices.usd) : 0,
      image_url:
        card.image_uris?.normal ||
        card.card_faces?.[0]?.image_uris?.normal ||
        "",
      quantity: 1,
      intent: haves ? "have" : "want",
    };
    console.log(payload);
    try {
      const res = await api.post("/cards/", payload);
      await fetchMyCards();
      if (res) {
        setRecentAdded((s) => [res.data, ...s]);
      }
      setSearch("");
    } catch (err) {
      alert("Failed to add card");
      return null;
    }
    setSearch(card.name);
  }
  async function updateRecent() {
    let updateRecent: card[] = [] 
    for (let i = 0; i < recentAdded.length; i++) {
      for(let j = 0; j < cards.length; j++) {
        if(cards[j].id==recentAdded[i].id){
          updateRecent.push(cards[j])
        }
      }
    }
    setRecentAdded([...updateRecent]);
  }
  async function modifyQuantity(card: card, quantity: number) {
    try {
      await api.patch(`/cards/${card.id}`, { quantity });
      card.quantity = quantity;
      // Call both functions to update card array
      await fetchMyCards();
      await updateRecent();
    } catch (err) {
      console.error("Failed to modify quantity", err);
    }
  }
  const heroHeight = 1000; // px - the background image area height
  const sortedCards = [...cards]
    .filter((card) => card.intent === (haves ? "have" : "want"))
    .sort((a, b) => {
      const dir = ascending ? 1 : -1;
      switch (sortOption) {
        case "price":
          return (a.price - b.price) * dir;
        case "dateSort":
          return a.id - b.id * dir;
        case "nameSort":
          a.name.localeCompare(b.name) * dir;
        case "setName":
          return a.set_name.localeCompare(b.set_name) * dir;
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  return (
    <div className="position-relative">
      <div>
        <NavBar
          search={searchRedirect}
          setSearch={setSearchRedirect}
          placeholder="Search for a card..."
        />
      </div>

      <Backsplash heroHeight={heroHeight} bgArt={bgArt}>
        <div className="flex justify-start items-center gap-3">
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
            <button
              className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
              onClick={() => {
                setShowListInput((s) => false);
                setShowSearch((s) => true);
              }}
            >
              Add by Search
            </button>
          )}
          {add && (
            <button
              className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
              onClick={() => {
                setShowListInput((s) => true);
                setShowSearch((s) => false);
              }}
            >
              Add by List
            </button>
          )}
          {/* Later feature add && <button>Add by Photo</button>*/}
        </div>
        {showSearch && add && (
          <SearchCard
            value={search}
            onChange={setSearch}
            onSelect={addFromSearch}
            placeholder="Search for a card to add..."
          />
        )}
        {showListInput && add && (
          <div className="mt-4">
            <div className="mb-1.5 text-2xl font-semibold">
              Paste list (one card per line):
            </div>
            <textarea
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              placeholder={`Example:\n1 Lightning Bolt (STA) \n1x Artist's Talent (BLB)`}
              rows={8}
              className="w-3/5 p-2.5 text-base rounded-md border border-gray-700 bg-transparent text-white"
            />
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
                onClick={async (e) => {
                  e.preventDefault();
                  await parseAndAddList();
                }}
              >
                Parse & Add
              </button>
              <button
                className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
                onClick={() => {
                  setListText("");
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
        {add && recentAdded.length > 0 && (
          <div className="mt-4">
            <CardList cards={recentAdded} modQuant={modifyQuantity} />
          </div>
        )}
        {!add && (sortedCards.length > 0 ? (
          <div className="mt-4">
            <CardList cards={sortedCards} modQuant={modifyQuantity} />
          </div>
        ) : (
          <div className="text-xl mt-3">No cards in collection select add.</div>
        ))}
      </Backsplash>
    </div>
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

    // helper to parse lines of the exact required format:
    // Quantity, name, set identifier in parentheses. Lines without quantity or without a set are ignored.
    // Examples accepted: "1x Umara Wizard (ZNR)", "2 Lightning Bolt (M21)"; trailing text after the ) is ignored.
    function parseLine(
      line: string
    ): { qty: number; name: string; setId: string } | null {
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

    const newlyAdded: card[] = [];
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
          if (!res.ok)
            throw new Error(`Scryfall lookup failed for ${name} (${setId})`);
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
          image_url:
            card.image_uris?.normal ||
            card.card_faces?.[0]?.image_uris?.normal ||
            "",
          quantity: qty,
          intent: haves ? "have" : "want",
        };

        try {
          const res: card = await api.post("/cards/", payload);
          if (res) newlyAdded.push(res);
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
    if (newlyAdded.length) {
      setRecentAdded((s) => [...newlyAdded, ...s]);
    }

    await fetchMyCards();
    setListText("");
    alert(`Added ${added} cards. ${failed ? `${failed} failed.` : ""}`);
  }
};
export default ProfilePage;
