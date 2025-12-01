/* Profile to view modify and add cards from collection. Collection
  is sortable and cards can be added using search bar or pasting a
  decklist into a textbox. In either case scryfall api is called to 
  validate cards.
*/
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import CardList from "../components/CardList";
import SearchCard from "../components/SearchCard";
import SortDropdown from "../components/SortDropdown";
import NavBar from "../components/NavBar";
import ToggleSwitch from "../components/ToggleSwitch";
import Backsplash from "../components/Backsplash";
import MultiTutorialPopup from "../components/TutorialPopup";
import * as React from "react";
import { card } from "../../types";

const ProfilePage: React.FC = () => {
  const [cards, setCards] = useState<card[]>([]);
  const [add, setAdd] = useState<boolean>(false); // toggle state between viewing and adding cards
  const [haves, setHaves] = useState<boolean>(false); // toggle state between wants and haves
  const [bgArt, setBgArt] = useState<string>("");
  //UI utilities
  const [searchRedirect, setSearchRedirect] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [showListInput, setShowListInput] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [ascending, setAscending] = useState<boolean>(true);
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [listText, setListText] = useState<string>("");
  const [showTutor, setShowTutor] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const disabled = localStorage.getItem("disableProfileTutorial");
    console.log(disabled);
    if (!disabled) {
      setShowTutor(true);
    }
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
  const tutorialSteps = [
    {
      image: "/tutorials/wants_haves_tutorial.jpg",
      title: "Wants & Haves",
      body: `Welcome to your profile page. This is where you list cards in your collection
      that you own as HAVES and list cards you want to aquire as WANTS. Click the toggle to switch
      between these two.`,
    },
    {
      image: "/tutorials/view_sort_tutorial.jpg",
      title: "View Your Collection",
      body: `You can view the cards you've added to your WANTS and HAVES in view mode and sort
      them based on different parameters using the sort dropdown.`,
    },
    {
      image: "/tutorials/add_tutorial.jpg",
      title: "Adding to Your Profile",
      body: `To add to your profile click the toggle to select add mode. You can either add
      cards by searching there name or paste in a decklist from a Magic the Gathering deckbuilding website.
      Cards that you have recently added will appear below.`,
    },
    {
      image: "/tutorials/begin_trade_tutorial.jpg",
      title: "Begin a Trade",
      body: `Once you have added a few cards to your profile you can begin a trade. Either search
      for a card name in the search bar above or click the Trade for Card button on cards in your WANT list.`,
    },
  ];

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
    } catch (err) {
      alert("Failed to add card");
      return null;
    }
    setSearch(card.name);
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
  function handleSearchSelection(card: card) {
    const q = encodeURIComponent(card?.name || "");
    navigate(`/search?q=${q}`);
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
          return (
            (new Date(a.date_added ?? Date.now()).getTime() -
              new Date(b.date_added ?? Date.now()).getTime()) *
            dir
          );
        case "nameSort":
          return a.name.localeCompare(b.name) * dir;
        case "setName":
          return a.set_name.localeCompare(b.set_name) * dir;
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  const FIVE_MIN = 60 * 5 * 1000; // ms
  //List of cards added in last 5 minutes
  const sortedRecent = cards
    .filter((card: card) => {
      console.log(card.date_added);
      const cardDate = new Date(card.date_added ?? Date.now()).getTime();
      console.log(cardDate);
      const now = Date.now();
      console.log(now);
      console.log(now - cardDate <= FIVE_MIN);
      return now - cardDate <= FIVE_MIN;
    })
    .filter((card: card) => card.intent === (haves ? "have" : "want"));

  return (
    <div className="position-relative">
      <div>
        <NavBar
          search={searchRedirect}
          setSearch={setSearchRedirect}
          placeholder="Search for a card..."
        />
      </div>
      {showTutor && (
        <MultiTutorialPopup
          pages={tutorialSteps}
          onClose={() => setShowTutor(false)}
          onDisable={() => {
            localStorage.setItem("disableProfileTutorial", "true");
            setShowTutor(false);
          }}
        />
      )}
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
        {add && sortedRecent.length > 0 && (
          <div className="text-3xl ml-4 font-bold">Recently Added Cards:</div>
        )}
        {add && sortedRecent.length > 0 && (
          <div className="mt-4">
            <CardList cards={sortedRecent} modQuant={modifyQuantity} />
          </div>
        )}
        {!add &&
          (sortedCards.length > 0 ? (
            <div className="mt-4">
              <CardList
                cards={sortedCards}
                modQuant={modifyQuantity}
                children={(card: card) =>
                  haves ? (
                    <></>
                  ) : (
                    <button
                      className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4 mb-2"
                      onClick={() => handleSearchSelection(card)}
                    >
                      Trade for Card
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <div className="text-xl mt-3">
              No cards in collection select add.
            </div>
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

    /* helper to parse lines of the exact required format:
     Quantity, name, set identifier in parentheses. Lines without quantity or without a set are ignored.
    Examples accepted: "1x Umara Wizard (ZNR)", "2 Lightning Bolt (M21)"; trailing text after the ) is ignored.
    */
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
