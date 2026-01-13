import React from "react";
import { useState } from "react";

import Backsplash from "@/components/Backsplash.js";
import Button from "@/components/Button.js";
import CardList from "@/components/CardList.js";
import SortDropdown from "@/components/SortDropdown.js";
import ToggleSwitch from "@/components/ToggleSwitch.js";
import { TRADE_DEFAULT_BG } from "@/lib/constants.js";
import { card, trade, TradeItem, TradeStatus, ActiveUser, SortOption } from "@/lib/types.js";
import { sortCards } from "@/lib/utils.js";

interface TradeCollectionProps {
  viewPopup: boolean;
  trade: trade | null;
  setTrade: React.Dispatch<React.SetStateAction<trade>>;
  cards: card[];
  otherUserCards: card[];
  closePopup: () => void;
}

const TradeCollection: React.FC<TradeCollectionProps> = ({
  viewPopup,
  trade,
  setTrade,
  cards,
  otherUserCards,
  closePopup,
}) => {
  const [autoMatch, setAutoMatch] = useState(false);
  const [sortOption, setSortOption] = useState(SortOption.NAME);
  const [ascending, setAscending] = useState(true);

  // Only show cards that the other user wants if autoMatch is on
  function filterAutoMatch(): (card: card) => boolean {
    return autoMatch
      ? () => true
      : (card: card) =>
          otherUserCards.some(
            (otherCard: card) => otherCard.intent === "want" && otherCard.name === card.name
          );
  }
  //Only show cards that are not already in the trade
  const tradeFilter = (card: card) =>
    trade ? !trade.trade_items.some((item) => item.card.id === card.id) : true;
  const sortedCards = sortCards(cards, sortOption, ascending, "have", [
    tradeFilter,
    filterAutoMatch(),
  ]);
  // Moves card from user's collection to their trade offer
  function addCardToTrade(card: card) {
    const newTradeItem: TradeItem = { id: "", quantity: 1, card: card };
    setTrade((prev) => ({
      ...prev,
      status: TradeStatus.PENDING,
      activeUser: ActiveUser.NONE,
      trade_items: [...prev.trade_items, newTradeItem],
    }));
  }
  return (
    <div
      className={` ${viewPopup ? "absolute" : "fixed"} duration-350 inset-0 flex flex-col transition-transform ease-out ${viewPopup ? "translate-y-0" : "translate-y-full"} `}
    >
      <Backsplash bgArt={TRADE_DEFAULT_BG}>
        <div className="flex items-center justify-start gap-3">
          <SortDropdown
            sortField={sortOption}
            setSortField={setSortOption}
            ascending={ascending}
            setAscending={setAscending}
          />
          <ToggleSwitch
            value={autoMatch}
            onChange={setAutoMatch}
            leftLabel="Auto Match"
            rightLabel=""
            id="auto-match-toggle"
          />
          <Button
            onClick={() => {
              closePopup();
            }}
          >
            Close
          </Button>
        </div>
        <CardList
          cards={sortedCards}
          children={(card: card) => (
            <Button onClick={() => addCardToTrade(card)}>Add to Offer</Button>
          )}
        />
      </Backsplash>
    </div>
  );
};
export default TradeCollection;
