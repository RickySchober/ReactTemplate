/* Search page to show all listing of a card from other users.
   This page is redirected to when using the search bar in NavBar.
*/
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "@/api/client.js";
import Backsplash from "@/components/Backsplash.js";
import Button from "@/components/Button.js";
import CardList from "@/components/CardList.js";
import NavBar from "@/components/NavBar.js";
import SortDropdown from "@/components/SortDropdown.js";
import { SEARCH_DEFAULT_BG } from "@/lib/constants.js";
import { card, SortOption } from "@/lib/types.js";
import { sortCards } from "@/lib/utils.js";

const SearchPage: React.FC = () => {
  const [myID, setMyID] = useState<string>("");
  const [results, setResults] = useState<card[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DATE_ADDED);
  const [ascending, setAscending] = useState<boolean>(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    console.log(q);
    if (q && q.length > 0) {
      handleSearch({ name: q });
    }
  }, [searchParams]);

  async function fetchUserId() {
    try {
      const response = await api.get("/auth/me");
      setMyID(response.data.id);
    } catch (error) {
      console.error("Failed to fetch user ID", error);
    }
  }

  async function handleSearch(card: card | { name: string }) {
    const name = typeof card === "string" ? card : card?.name;
    try {
      const res = await api.get(`/cards/search/`, {
        params: { name: name },
      });
      console.log(res.data);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
    console.log(name);
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
  const notMyCards = (card: card) => card.owner_id !== myID;
  const sortedResults = sortCards(results, sortOption, ascending, "have", [notMyCards]);
  return (
    <>
      <NavBar onSelect={handleSearch} />
      <Backsplash bgArt={SEARCH_DEFAULT_BG}>
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
                <Button onClick={() => (token ? beginTrade(card) : navigate("/login"))}>
                  Begin Trade
                </Button>
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
