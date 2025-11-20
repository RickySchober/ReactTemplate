import { useState, useEffect } from "react";
import api from "../api/client";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as React from "react";
import NavBar from "../components/NavBar";
import { ActiveUser, card, trade, TradeStatus, TradeItem, User, TradePayload, TradeItemPayload } from "../../types";
import CardList from "../components/CardList";
import Backsplash from "../components/Backsplash";
import SortDropdown from "../components/SortDropdown";
import bgArt from "../assets/Dragons-of-Tarkir-Gudul-Lurker-MtG.jpg";
import ToggleSwitch from "../components/ToggleSwitch";
import TradePanel from "./TradePanel";

const EmptyUser: User = {
  id: 0,
  username: 'Loading...',
};

// Define the default trade object
const DefaultTrade: trade = {
  id: 0,
  status: TradeStatus.PROPOSED, // or some default status
  activeUser: ActiveUser.NONE,
  a_user: EmptyUser,
  b_user: EmptyUser,
  trade_items: [],
};
const TradePage: React.FC = () => {
  //Read in parameters
  const { tradeID } = useParams();
  const location = useLocation();
  const isExistingTrade = Boolean(tradeID);
  const newTradeInfo = location.state || {};
  //Main trade object
  const [trade, setTrade] = useState<trade>(DefaultTrade);
  //Both users collection
  const [myCards, setMyCards] = useState<card[]>([]);
  const [traderCards, setTraderCards] = useState<card[]>([]);
  //UI utilities
  const [sortOption, setSortOption] = useState<string>("dateSort");
  const [ascending, setAscending] = useState<boolean>(true);
  const [autoMatch, setAutoMatch] = useState<boolean>(false);
  const [searchRedirect, setSearchRedirect] = useState<string>("");
  const [userA, setUserA] = useState<boolean>(false);
  const [viewMyCards, setViewMyCards] = useState<boolean>(false);
  const [viewTraderCards, setViewTraderCards] = useState<boolean>(false);

  useEffect(() => {
    console.log(isExistingTrade)
    if (isExistingTrade) {
      fetchTrade();
    } else {
      initializeTrade();
    }
  }, []);
  useEffect(() => {
    if (trade?.a_user && trade.b_user) {
        refreshCollection();
    }
}, [trade?.a_user, trade?.b_user]); 
  /* If new trade being created read in arguments and create trade object
  */
  async function initializeTrade(){
    console.log(newTradeInfo)
    let a_user = await api.get("/auth/user/"+newTradeInfo.myID)
    let b_user = await api.get("/auth/user/"+newTradeInfo.traderID)
    let cards = newTradeInfo.traderOffer
    let trade_items: TradeItem[] = []
    cards.forEach((card: card)=>(
        trade_items.push({
            card: card,
            quantity: 1,
        })
    ))
    let trade: trade = {
        status: TradeStatus.PROPOSED,
        activeUser: ActiveUser.A,
        a_user: a_user.data,
        b_user: b_user.data,
        trade_items: trade_items,
    }
    setTrade(trade)
    console.log(trade)
    refreshCollection()
  }
  /* Fetch both users' cards and the trade details.
       Validate that all cards in trade still exist and are owned by the correct users.
    */
  async function fetchTrade() {
    console.log("fetching trade")
    const tradeResponse = await api.get("/trades/" + tradeID);
    console.log(tradeResponse.data)
    setTrade(tradeResponse.data)
    console.log(trade)
  }
  /* Fetch collection of both users to view and add other cards
  */
  async function refreshCollection() {
    if(trade){
        const me = await api.get("/auth/me/")
        let isUserA = trade?.a_user.id==me.data.id ? true : false
        setUserA(isUserA)
        const my = await api.get("/cards/user/" + (isUserA ? trade?.a_user.id : trade?.b_user.id));
        const trader = await api.get("/cards/user/" + (!isUserA ? trade?.a_user.id : trade?.b_user.id));
        setMyCards(my.data);
        setTraderCards(trader.data);
    }
  }
  // Sorted list of user's cards
  const sortMyCards = [...myCards]
    .filter((card) => card.intent === "have") //Only show haves
    .filter((card) =>
      autoMatch
        ? true
        : traderCards
            .filter(
              (
                //Only matches on automatch
                card
              ) => card.intent === "want"
            )
            .includes(card)
    )
    .filter((card) => trade ? !trade.trade_items.some(item => item.card.id === card.id) : false) //Exclude cards in offer already
    .sort((a, b) => {
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
  // Sorted list of trade partners cards
  const sortTraderCards = [...traderCards]
    .filter((card) => card.intent === "have") //Only show haves
    .filter((card) =>
      autoMatch
        ? true
        : myCards
            .filter(
              (
                //Only matches on automatch
                card
              ) => card.intent === "want"
            )
            .includes(card)
    )
    .filter((card) => trade ? !trade.trade_items.some(item => item.card.id === card.id) : false) //Exclude cards in offer already
    .sort((a, b) => {
      const dir = ascending ? 1 : -1;
      switch (sortOption) {
        case "price":
          return (a.price - b.price) * dir;
        case "dateSort":
          return (a.id - b.id) * dir;
        case "nameSort":
          a.name.localeCompare(b.name) * dir;
        case "setName":
          return a.set_name.localeCompare(b.set_name) * dir;
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  const aTradeItems: TradeItem[] =
    trade?.trade_items
    ?.filter((item) => item.card?.owner_id === trade?.a_user?.id) ?? [];

  const bTradeItems: TradeItem[] =
    trade?.trade_items
    ?.filter((item) => item.card?.owner_id === trade?.b_user?.id) ?? [];

  const aOfferPrice = aTradeItems.reduce((sum, item) => {
    return sum + item.card.price
  }, 0);
  const bOfferPrice = aTradeItems.reduce((sum, item) => {
    return sum + item.card.price
  }, 0);

  async function postTrade() {
    if(tradeID && await api.get("/trades/" + tradeID)){
        console.log("trade found")
    }
    else if(trade){
        console.log("trade not found creating new one")
        let tradeItemsPayload: TradeItemPayload[] = []
        trade?.trade_items.forEach(item =>
            tradeItemsPayload.push({card_id: item.card.id, quantity: item.quantity})
        )
        let tradePayload: TradePayload = {
            a_user_id: trade.a_user.id,
            b_user_id: trade.b_user.id,
            status: trade.status,
            activeUser: trade.activeUser,
            trade_items: tradeItemsPayload
        }               
        const res = await api.post("/trades/", tradePayload);
    }
  }
  
  function handleSelectCard(card: card) {}
  // Moves card from user's collection to their trade offer
  function addCardToTrade(card: card) {
    let newTradeItem: TradeItem = {quantity: 1, card: card}
    trade?.trade_items.push(newTradeItem)
  }
  // This function updates the quantity of a card in either offer
  function updateAmount(card: card, amount: number) {
    let index: number = trade.indexOf(card);
    array[index].quantity = amount;
    if (array[index].quantity <= 0) {
      array.splice(index, 1);
    }
    setArray([...array]);
  }

    const currentUserPanelProps = {
    title: "My Cards",
    offerPrice: userA ? aOfferPrice : bOfferPrice,
    tradeItems: userA ? aTradeItems : bTradeItems,
    isUserACurrentUser: true, // It is always the current user's panel
    onAddCardsClick: () => setViewMyCards(true), // Or setViewTraderCards(true) if B
    onProposeClick: () => postTrade(),
    updateAmount: updateAmount,
  };

  // Define props for the Trader's Panel
  const traderPanelProps = {
    title: "Trader Cards",
    offerPrice: userA ? bOfferPrice : aOfferPrice,
    tradeItems: userA ? bTradeItems : aTradeItems,
    isUserACurrentUser: false, // It is never the current user's panel
    onAddCardsClick: () => setViewTraderCards(true), // This button will be hidden by TradePanel logic
    onProposeClick: () => setViewTraderCards(true), // Example action
    updateAmount: updateAmount,
  };

  return (
    <div className="position-relative z-20">
      <NavBar
        search={searchRedirect}
        setSearch={setSearchRedirect}
        onSelect={handleSelectCard}
        placeholder="Search for a card..."
      />
      {!viewMyCards && !viewTraderCards && (
        <div className="flex gap-6 w-full">
            <TradePanel {...currentUserPanelProps} />
            <TradePanel {...traderPanelProps} />
        </div>
      )}
      {/* Popupp window to add cards from my collection */}
      <div
        className={`
                ${viewMyCards ? "absolute" : "fixed"} inset-0 z-30 flex flex-col
                transition-transform duration-350 ease-out
                ${viewMyCards ? "translate-y-0" : "translate-y-full"}
            `}
      >
        <Backsplash heroHeight={1000} bgArt={bgArt}>
          <div className="flex justify-start items-center gap-3">
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
            <button
              onClick={() => {
                setViewTraderCards(false);
                setViewMyCards(false);
              }}
            >
              close
            </button>
          </div>
          <div className="mt-4">
            <CardList
              cards={sortMyCards}
              children={(card) => (
                <button onClick={() => addCardToTrade(card)}>
                  Add to Offer
                </button>
              )}
            />
          </div>
        </Backsplash>
      </div>
      {/* Popupp window to add cards from other trader's collection */}
      <div
        className={`
                ${viewTraderCards ? "absolute" : "fixed"} inset-0 z-30 flex flex-col
                transition-transform duration-350 ease-out
                ${viewTraderCards ? "translate-y-0" : "translate-y-full"}
            `}
      >
        <Backsplash heroHeight={1000} bgArt={bgArt}>
          <div className="flex justify-start items-center gap-3">
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
            <button
              onClick={() => {
                setViewTraderCards(false);
                setViewMyCards(false);
              }}
            >
              close
            </button>
          </div>
          <div className="mt-4">
            <CardList
              cards={sortTraderCards}
              children={(card) => (
                <button onClick={() => addCardToTrade(card)}>
                  Add to Offer
                </button>
              )}
            />
          </div>
        </Backsplash>
      </div>
    </div>
  );
};
export default TradePage;
