import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function SearchCard({
  value,            // controlled search string
  onChange,         // setter: (newValue) => void
  onSelect,         // callback: (card) => void
  placeholder = "Search for a card...",
  minChars = 3,
  maxResults = 8,
  debounceMs = 250,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // clean up on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!value || value.length < minChars) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // cancel previous request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);

      axios
        .get(`https://api.scryfall.com/cards/search`, {
          params: { q: value, unique: "prints" },
          signal: abortRef.current.signal,
        })
        .then((res) => {
          setSuggestions((res.data?.data || []).slice(0, maxResults));
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            console.error("Scryfall error", err);
          }
        })
        .finally(() => {
          setLoading(false);
          abortRef.current = null;
        });
    }, debounceMs);
  }, [value, minChars, maxResults, debounceMs]);

  function handleInput(e) {
    onChange?.(e.target.value);
    setActiveIndex(-1);
  }

  function handleSelect(card) {
    onChange?.(card.name);
    setSuggestions([]);
    setActiveIndex(-1);
    onSelect?.(card);
  }

  function onKeyDown(e) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }
  function makePrintDescription(scryfallCard) {
    const parts = [];
    if (scryfallCard.border_color === "borderless") parts.push("Borderless");
    if (scryfallCard.promo) parts.push("Promo");
    if (scryfallCard.variation) parts.push("Variant");
    if (Array.isArray(scryfallCard.frame_effects)) {
      if (scryfallCard.frame_effects.includes("extendedart") || scryfallCard.frame_effects.includes("extended art")) {
        parts.push("Extended Art");
      }
      if (scryfallCard.frame_effects.includes("etched")) parts.push("Etched Foil");
    }
    // Some card objects include foil/nonfoil booleans
    if (scryfallCard.foil === true) parts.push("Foil");
    else if (scryfallCard.nonfoil === true) parts.push("Nonfoil");

    return parts.join(" · ");
  }
  // click outside to close suggestions
  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div ref={containerRef} style={{ width: "90%", padding: 16, position: "relative" }}>
      <input
        value={value}
        onChange={handleInput}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        style={{ width: "100%", padding: 8 }}
      />

      {loading && <div style={{ position: "absolute", right: 8, top: 8 }}>⏳</div>}

      {suggestions.length > 0 && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ddd",
            zIndex: 50,
            maxHeight: 800,
            overflowY: "auto",
          }}
        >
          {suggestions.map((s, idx) => {
            const cardName = s.name || s.card_faces?.[0]?.name || "Unknown";
            const setName = s.set_name || s.set || "";
            const img =
              s.image_uris?.small ||
              s.card_faces?.[0]?.image_uris?.small ||
              "";
            const printing = makePrintDescription(s);
            const isActive = idx === activeIndex;

            return (
              <div
                key={s.id}
                role="option"
                aria-selected={isActive}
                onMouseDown={(ev) => {
                  // prevent input blur before click handler runs
                  ev.preventDefault();
                }}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setActiveIndex(idx)}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: 8,
                  cursor: "pointer",
                  background: isActive ? "#f0f6ff" : "transparent",
                  borderBottom: "1px solid #eee",
                }}
              >
                {img && (
                  <img
                    src={img}
                    alt={cardName}
                    style={{ width: 120, height: 180, objectFit: "cover", borderRadius: 4 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 , fontStyle: "italic", fontSize: 35 ,color: "#666" }}>{cardName}</div>
                  <div style={{ fontWeight: 600 , fontSize: 22, fontStyle: "italic", color: "#666" }}>{setName}</div>
                  <div style={{ fontWeight: 600 , fontSize: 22, fontStyle: "italic", color: "#666" }}>{printing}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}