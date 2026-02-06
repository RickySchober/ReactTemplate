import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { card, SortOption, trade, TradeItemWrite, TradeWrite, User } from "./types.js";

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
    .filter((card) => !card.locked)
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

export function createTradePayload(trade: trade): TradeWrite {
  const tradeItemsPayload: TradeItemWrite[] = [];
  trade?.trade_items.forEach((item) =>
    tradeItemsPayload.push({
      card_id: item.card.id!,
      quantity: item.quantity,
    })
  );
  const tradePayload: TradeWrite = {
    a_user_id: trade.a_user.id!,
    b_user_id: trade.b_user.id!,
    status: trade.status,
    activeUser: trade.activeUser,
    trade_items: tradeItemsPayload,
  };
  return tradePayload;
}

export function haveViewedTrade(trade: trade, user: User): boolean {
  const d1 = new Date(trade.last_updated!);
  const d2 = new Date(trade.b_viewed!);

  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const diffSeconds = diffMs / 1000;

  console.log("difference in time (seconds):", diffSeconds);
  if (trade.a_user.id === user.id) {
    console.log("Checking a_viewed");
    return trade.a_viewed! >= trade.last_updated!;
  } else if (trade.b_user.id === user.id) {
    console.log("Checking b_viewed");
    return trade.b_viewed! >= trade.last_updated!;
  }
  return false;
}
