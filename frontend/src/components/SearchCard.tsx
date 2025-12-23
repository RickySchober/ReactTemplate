/* Search card component is the search bar which calls Scryfall (MTGDatabase)
 api to provide card autocomplete information.
*/
import { useState, useEffect, useRef, useCallback } from "react";
import Timeout = NodeJS.Timeout;
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { card, ScryfallCard } from "@/lib/types.js";

interface SearchCardProps {
  onSelect?: (card: card) => void; // callback triggered when a card is selected
  placeholder?: string;
  minChars?: number;
  maxResults?: number;
  debounceMs?: number;
}

const SearchCard: React.FC<SearchCardProps> = ({
  onSelect,
  placeholder = "Search for a card...",
  minChars = 3,
  maxResults = 8,
  debounceMs = 250,
}) => {
  const [search, setSearch] = useState<string>("");
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Show loading symbol when calling scryfall api
  const [activeIndex, setActiveIndex] = useState<number>(-1); //Index of cards being hovered -1 when none
  const abortRef = useRef<AbortController>(null); //Signal to abort scyrfall api call
  const debounceRef = useRef<Timeout>(null); //Timer to abort slow api response
  const containerRef = useRef<HTMLDivElement | null>(null); //used for closing box when clicking out
  const [suppressOpen, setSuppressOpen] = useState<boolean>(true); //Suppress search to avoid extra searching
  const [suppressMouse, setSuppressMouse] = useState<boolean>(false); //Suppress mouse scrolling when using keyboard
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setSuppressOpen(false), 250); //Remove initial suppression
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
  useEffect(() => {
    if (activeIndex >= 0 && suggestionRefs.current[activeIndex]) {
      suggestionRefs.current[activeIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    triggerSearch();
  }, [search]);

  function handleSearchSelection(card: card) {
    if (typeof onSelect === "function") {
      console.log("Calling onSelect from SearchCard");
      return onSelect(card);
    }
    if (location.pathname === "/search") {
      setSearch?.(card?.name || "");
      console.log("Already on search page");
      return;
    }
    const q = encodeURIComponent(card?.name || "");
    navigate(`/search?q=${q}`);
  }

  const triggerSearch = useCallback(() => {
    if (suppressOpen || !search || search.length < minChars) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);

      axios
        .get(`https://api.scryfall.com/cards/search`, {
          params: { q: search, unique: "prints" },
          signal: abortRef.current.signal,
        })
        .then((res) => {
          setSuggestions((res.data?.data || []).slice(0, maxResults));
        })
        .catch((err) => {
          if (!axios.isCancel(err)) console.error("Scryfall error", err);
        })
        .finally(() => {
          setLoading(false);
          abortRef.current = null;
        });
    }, debounceMs);
  }, [search, suppressOpen, minChars, maxResults, debounceMs]);

  function handleInput(e) {
    setSearch?.(e.target.value);
    setActiveIndex(-1);
  }
  // When a card is selected from the suggestions convert it to local card type and call onSelect
  function handleSelect(card: ScryfallCard) {
    const { id, ...rest } = card;
    let convertedCard: card = {
      ...rest,
      price: card.prices?.usd || 0,
      image_url: card.image_uris?.png || "",
      intent: "have",
      quantity: 1,
    };
    setSuppressOpen(true);
    setSearch?.(convertedCard.name);
    handleSearchSelection?.(convertedCard);

    setSuggestions([]);
    setActiveIndex(-1);

    setTimeout(() => setSuppressOpen(false), 250);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setSuppressMouse(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      setSuppressMouse(true);
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
  // Generate a print description based on Scryfall card data
  function makePrintDescription(scryfallCard: ScryfallCard): string {
    const parts: string[] = [];
    if (scryfallCard.border_color === "borderless") parts.push("Borderless");
    if (scryfallCard.promo) parts.push("Promo");
    if (scryfallCard.variation) parts.push("Variant");
    if (Array.isArray(scryfallCard.frame_effects)) {
      if (
        scryfallCard.frame_effects.includes("extendedart") ||
        scryfallCard.frame_effects.includes("extended art")
      ) {
        parts.push("Extended Art");
      }
      if (scryfallCard.frame_effects.includes("etched")) parts.push("Etched Foil");
    }
    if (scryfallCard.foil === true) parts.push("Foil");
    else if (scryfallCard.nonfoil === true) parts.push("Nonfoil");

    return parts.join(" · ");
  }
  function checkMouseEnter(index: number) {
    if (suppressMouse) {
      setSuppressMouse(false);
    } else if (index < suggestions.length && index >= 0) {
      setActiveIndex(index);
    } else {
      setActiveIndex(-1);
    }
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
    <div ref={containerRef} className="relative w-[70%] p-2.5">
      <input
        value={search}
        onChange={handleInput}
        onClick={triggerSearch}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        className="w-[99%] rounded-md border border-gray-300 p-2 text-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading && <div className="absolute right-2 top-2 text-xl">⏳</div>}

      {suggestions.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 max-h-[800px] overflow-y-auto border border-gray-300 bg-white"
        >
          {suggestions.map((s, idx) => {
            const cardName = s.name || s.card_faces?.[0]?.name || "Unknown";
            const setName = s.set_name || s.set || "";
            const img = s.image_uris?.small || s.card_faces?.[0]?.image_uris?.small || "";
            const printing = makePrintDescription(s);
            const isActive = idx === activeIndex;

            return (
              <div
                ref={(el) => {
                  suggestionRefs.current[idx] = el;
                }}
                key={s.id}
                role="option"
                aria-selected={isActive}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => checkMouseEnter(idx)}
                className={`flex cursor-pointer gap-2 border-b border-gray-200 p-2 ${isActive ? "bg-blue-50" : "bg-transparent"} `}
              >
                {img && (
                  <img
                    src={img}
                    alt={cardName}
                    className="h-[180px] w-[120px] rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="text-4xl font-semibold italic text-gray-700">{cardName}</div>

                  <div className="text-xl font-semibold italic text-gray-700">{setName}</div>

                  <div className="text-xl font-semibold italic text-gray-700">{printing}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default SearchCard;
