import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import CardList from "../components/CardList";
import NavBar from "../components/NavBar";
import SortDropdown from "../components/SortDropdown";
import Backsplash from "../components/Backsplash";
import bgArt from "../assets/Treasure-Cruise-MtG-Art.jpg";


export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [sortOption, setSortOption] = useState("dateSort");
  const [ascending, setAscending] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sortedResults = [...results].sort((a, b) => {
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
  // Navigate to user profile on card owner select
  function handleSelectCard(card) {
    console.log("Selected card:", card);
    navigate(`/user/${card.owner_id}`);
  }
  // Trigger search when ?q= is present in the URL
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q && q.length > 0) {
      setSearch(q);
      // run search using current filters
      handleSearch({ name: q });
    }
  }, [searchParams]);
  return (
    <>
      <NavBar  
      search={search}
      setSearch={setSearch}
      onSelect={handleSearch}
      placeholder="Search for a card..."
      />
      <Backsplash bgArt={bgArt} heroHeight={1000} >
      {/* ─── FILTER BAR ──────────────────────────── */}
      <section style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 12,
      }}>
        <SortDropdown 
          sortField={sortOption} 
          setSortField={setSortOption} 
          ascending={ascending}
          setAscending={setAscending}
        />
      </section>

      {/* ─── RESULTS ─────────────────────────────── */}
      <main>
        {results.length > 0 ? (
          <CardList cards={sortedResults} onSelect={handleSelectCard}/>
        ) : (
          <p >
            No results yet. Try searching for a card name.
          </p>
        )}
      </main>
      </Backsplash>
    </>
  );
}
