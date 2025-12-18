import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { card, SortOption } from "./types.js";

// Credit to ByteGrad https://www.youtube.com/watch?v=5r25Y9Vg2P4
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to sort and filter cards based on the provided options. Additional filters can be applied using the `filters` parameter.
export function sortCards(
  cards: card[],
  sortOption: SortOption,
  ascending: boolean,
  intent?: "have" | "want",
  filters?: Array<(card: card) => boolean>
): card[] {
  const sortedCards = [...cards]
    .filter((card) => (intent === undefined ? true : card.intent === intent))
    .sort((a, b) => {
      const dir = ascending ? 1 : -1;
      switch (sortOption) {
        case "price":
          return (a.price - b.price) * dir;
        case "date_added":
          return (
            (new Date(a.date_added ?? Date.now()).getTime() -
              new Date(b.date_added ?? Date.now()).getTime()) *
            dir
          );
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "set_name":
          return a.set_name.localeCompare(b.set_name) * dir;
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  if (filters && filters.length > 0) {
    return sortedCards.filter((c) => filters.every((fn) => fn(c)));
  }
  return sortedCards;
}
