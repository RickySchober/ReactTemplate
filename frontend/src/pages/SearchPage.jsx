import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import CardList from "../components/CardList";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [setFilter, setSetFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  async function handleSearch(e) {
    e.preventDefault();
    try {
      const res = await api.get(`/cards/search`, {
        params: { name: query, set: setFilter, rarity: rarityFilter },
      });
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
    <div /* ─── NAVBAR ──────────────────────────────── */
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        {/* App Icon / Title */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/favicon.svg" alt="App Icon" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">MTGTrader</h1>
        </div>

        {/* Search Bar */}
        <SearchCard
            value={search}
            onChange={setSearch}
            onSelect={handleSelectCard}
            placeholder="Search Card..."
            />

        {/* Auth & Profile Buttons */}
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
          {token ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="text-gray-700 font-medium hover:text-blue-600"
              >
                Profile
              </button>
              <button
                onClick={handleSignOut}
                className="text-red-600 font-medium hover:text-red-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          )}
        </div>
    </div>
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
      <main className="flex-1 px-6 py-4">
        {results.length > 0 ? (
          <CardList cards={results} />
        ) : (
          <p className="text-gray-500 text-center mt-8">
            No results yet. Try searching for a card name.
          </p>
        )}
      </main>
    </div>
  );
}
