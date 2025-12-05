/* Search page to show all listing of a card from other users.
   This page is redirected to when using the search bar in NavBar.
*/
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import CardList from "../components/CardList";
import NavBar from "../components/NavBar.js";
import SortDropdown from "../components/SortDropdown.js";
import Backsplash from "../components/Backsplash.js";
import bgArt from "../assets/Treasure_Cruise.jpg";
import * as React from "react";
import { card } from "../../types.js";

const SearchPage: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [myID, setMyID] = useState<number>(0);
  const [results, setResults] = useState<card[]>([]);
  const [sortOption, setSortOption] = useState<string>("dateSort");
  const [ascending, setAscending] = useState<boolean>(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await api.get("/auth/me");
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

  async function handleSearch(card: card) {
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
    const me = await api.get("auth/me");
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

  const sortedResults = [...results]
    .filter((card) => card.owner_id !== myID)
    .filter((card) => card.intent == "have")
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
        <section className="m-2.5 flex items-center justify-start gap-3">
          <SortDropdown
            sortField={sortOption}
            setSortField={setSortOption}
            ascending={ascending}
            setAscending={setAscending}
          />
        </section>

        {/* ─── RESULTS ─────────────────────────────── */}
        <div>
          {sortedResults.length > 0 ? (
            <CardList
              cards={sortedResults}
              children={(card: card) => (
                <button
                  className="mb-2 bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500"
                  onClick={() => {
                    token ? beginTrade(card) : navigate("/login");
                  }}
                >
                  Begin Trade
                </button>
              )}
            />
          ) : (
            <p className="ml-6 text-xl">
              No trades posted. Try searching for a different card name.
            </p>
          )}
        </div>
      </Backsplash>
    </>
  );
};
export default SearchPage;
