import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import CardList from "../components/CardList";
import NavBar from "../components/NavBar";
import SortDropdown from "../components/SortDropdown";
import Backsplash from "../components/Backsplash";
import bgArt from "../assets/Treasure-Cruise-MtG-Art.jpg";
import * as React from "react";
import { card } from "../../types";

const SearchPage: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [myID, setMyID] = useState<number>(0);
  const [results, setResults] = useState<card[]>([]);
  const [sortOption, setSortOption] = useState<string>("dateSort");
  const [ascending, setAscending] = useState<boolean>(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchUserId = async () => {
        try {
            const response = await api.get('/auth/me');
            setMyID(response.data.id);
        } catch (error) {
            console.error("Failed to fetch user ID", error);
        }
    };

    fetchUserId();
    const q = searchParams.get("q") || "";
      if (q && q.length > 0) {
        setSearch(q);
        // run search using current filters
        handleSearch({ name: q });
      }
  }, [searchParams]);

  async function handleSearch(card) {
    try {
      const name = typeof card === "string" ? card : card?.name;
      const res = await api.get(`/cards/search/`, {
        params: { name: name },
      });
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
    setSearch(card.name);
  }
  // Begin a trade with the owner of the selected card
  async function beginTrade(card: card) {
    const me = await api.get('auth/me')
    const myID = me.data.id;
    const traderID = card.owner_id;
    navigate("/trade", {
      state: {
        myID,
        traderID,
        traderOffer: [card],
      },
    });
  }
  // Navigate to user profile on card owner select
  function handleSelectCard(card) {
    console.log("Selected card:", card);
    navigate(`/user/${card.owner_id}`);
  }

  const sortedResults = [...results]
  .filter((card) => card.owner_id !== myID)
  .sort((a, b) => {
    const dir = ascending ? 1 : -1;
    switch (sortOption) {
      case "price":
        return (a.price - b.price) * dir;
      case "dateSort":
        return (a.id - b.id) * dir;
      case "nameSort":
        a.name.localeCompare(b.name) * dir;
      case "setName":
        return a.set_name.localeCompare(b.set_name) * dir;
      default:
        return a.name.localeCompare(b.name) * dir;
    }
  });
  return (
    <>
      <NavBar
        search={search}
        setSearch={setSearch}
        onSelect={handleSearch}
        placeholder="Search for a card..."
      />
      <Backsplash bgArt={bgArt} heroHeight={1000}>
        {/* ─── FILTER BAR ──────────────────────────── */}
        <section className="flex justify-start items-center gap-3 m-2.5">
          <SortDropdown
            sortField={sortOption}
            setSortField={setSortOption}
            ascending={ascending}
            setAscending={setAscending}
          />
        </section>

        {/* ─── RESULTS ─────────────────────────────── */}
        <div>
          {results.length > 0 ? (
            <CardList 
              cards={sortedResults} 
              children={(card) => (
                <button className="bg-blue-400 hover:bg-blue-500 mb-2 text-lg px-4 py-2" onClick={() => beginTrade(card)}>
                  Begin Trade
                </button>
              )} />
          ) : (
            <p>No results yet. Try searching for a card name.</p>
          )}
        </div>
      </Backsplash>
    </>
  );
};
export default SearchPage;
