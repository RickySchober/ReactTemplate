import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import CardList from "../components/CardList";
import NavBar from "../components/NavBar";

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [results, setResults] = useState([]);

  const navigate = useNavigate();
 function handleSelectCard(card) {
    console.log("Selected card:", card);
    navigate(`/user/${card.owner_id}`);
}

  async function handleSearch(card) {
    try {
      const res = await api.get(`/cards/search`, {
        params: { name: card.name, set: setFilter, rarity: rarityFilter },
      });
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
    //setSearch(card.name);
  }
  return (
    <>
      <NavBar  
      search={search}
      setSearch={setSearch}
      onSelect={handleSearch}
      placeholder="Search for a card..."
      />
      {/* ─── FILTER BAR ──────────────────────────── */}
      <section className="flex flex-wrap gap-3 items-center px-6 py-3 bg-white shadow-sm mt-1">
        <select
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Sets</option>
          <option value="Dominaria">Dominaria</option>
          <option value="Modern Horizons 3">Modern Horizons 3</option>
          <option value="Phyrexia">Phyrexia</option>
        </select>

        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="mythic">Mythic</option>
        </select>
      </section>

      {/* ─── RESULTS ─────────────────────────────── */}
      <main className="flex-1 px-6 py-4 w-full">
        {results.length > 0 ? (
          <CardList cards={results} onSelect={handleSelectCard}/>
        ) : (
          <p className="text-gray-500 text-center mt-8">
            No results yet. Try searching for a card name.
          </p>
        )}
      </main>
    </>
  );
}
