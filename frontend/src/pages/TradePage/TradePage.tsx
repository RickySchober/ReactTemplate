/* Trade page displays all relevant information regarding a trade,
   including current offer, user info, user collections, status, and user actions.
*/

import React from "react";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import { initializeTrade, postTrade, fetchTrade, closeTrade } from "./api/ManageTrade.js";
import { updateStatus } from "./api/UpdateStatus.js";
import TradeCollection from "./components/TradeCollection.js";
import TradePanel from "./components/TradePanel.js";

import api from "@/api/client.js";
import NavBar from "@/components/NavBar.js";
import StatusBar from "@/components/StatusBar.js";
import MultiTutorialPopup from "@/components/TutorialPopup.js";
import { TRADE_TUTORIAL_STEPS } from "@/lib/constants.js";
import { ActiveUser, card, trade, TradeStatus, User } from "@/lib/types.js";

const EmptyUser: User = {
  id: "",
  username: "Loading...",
};
// Define the default trade object when creating new trade
const DefaultTrade: trade = {
  id: "",
  status: TradeStatus.PENDING,
  activeUser: ActiveUser.NONE,
  a_user: EmptyUser,
  b_user: EmptyUser,
  trade_items: [],
};
export interface NewTradeInfo {
  myID: number;
  traderID: number;
  traderOffer: card[];
}
type collectionView = "myCards" | "traderCards" | "none";
const TradePage: React.FC = () => {
  //Read in parameters
  const { tradeID } = useParams();
  const location = useLocation();
  const newTradeInfo = (location.state as NewTradeInfo) ?? undefined;
  //Main trade object
  const [trade, setTrade] = useState<trade>(DefaultTrade);
  //Both users collection
  const [myCards, setMyCards] = useState<card[]>([]);
  const [traderCards, setTraderCards] = useState<card[]>([]);
  //UI utilities
  const [userA, setUserA] = useState<boolean>(false);
  const [viewCollection, setCollectionView] = useState<collectionView>("none");

  useEffect(() => {
    openTrade();
  }, []);
  // On assigning trade users fetch their collections
  useEffect(() => {
    if (trade.a_user.username !== "Loading..." && trade.b_user.username !== "Loading...") {
      refreshCollection();
    }
  }, [trade.a_user, trade.b_user]);

  async function openTrade() {
    if (tradeID) {
      setTrade(await fetchTrade(tradeID));
    } else {
      setTrade(await initializeTrade(newTradeInfo));
    }
  }

  // Fetch collection of both users to view and add other cards
  async function refreshCollection() {
    if (trade) {
      const me = await api.get("/auth/me");
      const isUserA = trade?.a_user.id == me.data.id ? true : false;
      setUserA(isUserA);
      const my = await api.get("/cards/user/" + (isUserA ? trade?.a_user.id : trade?.b_user.id));
      const trader = await api.get(
        "/cards/user/" + (!isUserA ? trade?.a_user.id : trade?.b_user.id)
      );
      setMyCards(my.data);
      setTraderCards(trader.data);
    }
  }
  async function updateTrade() {
    const updatedTrade = updateStatus(trade, userA);
    await postTrade(updatedTrade, tradeID);
  }
  async function removeTrade() {
    postTrade(await closeTrade(trade, userA), tradeID);
  }
  return (
    <>
      <NavBar />
      <MultiTutorialPopup pages={TRADE_TUTORIAL_STEPS} keyName="trade-tutorial" />
      {viewCollection === "none" && (
        <div className="mt-5">
          <StatusBar status={trade.status} />
          <div className="flex w-full gap-6">
            <TradePanel
              trade={trade}
              setTrade={setTrade}
              userA={userA}
              close={() => removeTrade}
              onAddCardsClick={() => setCollectionView("myCards")}
              onProposeClick={() => updateTrade}
            />
            <TradePanel
              trade={trade}
              setTrade={setTrade}
              userA={!userA}
              onAddCardsClick={() => setCollectionView("traderCards")}
            />
          </div>
        </div>
      )}
      <TradeCollection
        viewPopup={viewCollection === "myCards"}
        trade={trade}
        setTrade={setTrade}
        cards={myCards}
        otherUserCards={traderCards}
        closePopup={() => setCollectionView("none")}
      />
      <TradeCollection
        viewPopup={viewCollection === "traderCards"}
        trade={trade}
        setTrade={setTrade}
        cards={traderCards}
        otherUserCards={myCards}
        closePopup={() => setCollectionView("none")}
      />
    </>
  );
};
export default TradePage;
