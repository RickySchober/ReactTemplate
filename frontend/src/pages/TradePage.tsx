/* Trade page displays all relevant information regarding a trade,
   including current offer, user info, user collections, status, and user actions.
*/
import { useState, useEffect } from "react";
import api from "../api/client";
import { useParams, useLocation } from "react-router-dom";
import * as React from "react";
import NavBar from "../components/NavBar";
import {
  ActiveUser,
  card,
  trade,
  TradeStatus,
  TradeItem,
  User,
  TradePayload,
  TradeItemPayload,
} from "../../types";
import CardList from "../components/CardList";
import Backsplash from "../components/Backsplash";
import StatusBar from "../components/StatusBar";
import SortDropdown from "../components/SortDropdown";
import bgArt from "../assets/Gudul_Lurker.jpg";
import MultiTutorialPopup from "../components/TutorialPopup";
import ToggleSwitch from "../components/ToggleSwitch";
import TradePanel from "../components/TradePanel";

const EmptyUser: User = {
  id: 0,
  username: "Loading...",
};

// Define the default trade object
const DefaultTrade: trade = {
  id: 0,
  status: TradeStatus.PENDING,
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
  const [autoMatch, setAutoMatch] = useState<boolean>(true);
  const [searchRedirect, setSearchRedirect] = useState<string>("");
  const [userA, setUserA] = useState<boolean>(false);
  const [viewMyCards, setViewMyCards] = useState<boolean>(false);
  const [viewTraderCards, setViewTraderCards] = useState<boolean>(false);
  const [showTutor, setShowTutor] = useState<boolean>(false);

  useEffect(() => {
    console.log(isExistingTrade);
    const disabled = localStorage.getItem("disableTradeTutorial");
    console.log(disabled);
    if (!disabled) {
      setShowTutor(true);
    }
    if (isExistingTrade) {
      fetchTrade();
    } else {
      initializeTrade();
    }
  }, []);
  const tutorialSteps = [
    {
      image: "/tutorials/start_trade.jpg",
      title: "Welcome to Trading",
      body: `Welcome to the trade interface were you negotiate with another user to settle on a mutually beneficial trade. This
      process goes through 5 phases tracked by the progress bar at the top. The first phase is pending were you add cards from eachothers
      collection and propose an initial trade. You may cancel a trade during this phase with the close button.`,
    },
    {
      image: "/tutorials/view_collection.jpg",
      title: "Adding from Collection",
      body: `When viewing cards from either players collection you may add them to the trade with the button below each card. The AUTO MATCH
      toggle only shows cards that the other user has in their wants. Using automatch to add cards will often result in more successful trades 
      as the other user has already indicated they want that card. Once done, select close to return to the trade window.`,
    },
    {
      image: "/tutorials/trader_status.jpg",
      title: "After Initial Proposal",
      body: `After you have proposed an initial trade the other user will review it and either accept, propose a new offer or cancel the trade.
      You can also modify and repropose the offer before they review the trade. Either users status during a trade is listed on their trade panel.`,
    },
    {
      image: "/tutorials/ship_trade.jpg",
      title: "Shipping the Trade",
      body: `Once both users have agreed on a trade the next phase of shipping begins. You will recieve a notification with the other users mailing address
      and must begin the process of shipping your cards. Once both users ship their cards the receive phase begins.`,
    },
    {
      image: "/tutorials/receive_trade.jpg",
      title: "Receiving the Trade",
      body: `On confirming you have received all the cards as listed you should mark the trade as received. Once both players receive their cards the trade is complete!`,
    },
  ];
  // On assigning trade users fetch their collections
  useEffect(() => {
    if (trade?.a_user && trade.b_user) {
      refreshCollection();
    }
  }, [trade?.a_user, trade?.b_user]);

  /* If new trade being created read in arguments and create trade object
   */
  async function initializeTrade() {
    console.log(newTradeInfo);
    let a_user = await api.get("/auth/user/" + newTradeInfo.myID);
    let b_user = await api.get("/auth/user/" + newTradeInfo.traderID);
    let cards = newTradeInfo.traderOffer;
    let trade_items: TradeItem[] = [];
    cards.forEach((card: card) =>
      trade_items.push({
        card: card,
        quantity: 1,
      })
    );
    let trade: trade = {
      status: TradeStatus.PENDING,
      activeUser: ActiveUser.NONE,
      a_user: a_user.data,
      b_user: b_user.data,
      trade_items: trade_items,
    };
    setTrade(trade);
    console.log(trade);
    refreshCollection();
  }
  /* Fetch both users' cards and the trade details.
       Validate that all cards in trade still exist and are owned by the correct users.
    */
  async function fetchTrade() {
    console.log("fetching trade");
    const tradeResponse = await api.get("/trades/" + tradeID);
    console.log(tradeResponse.data);
    setTrade(tradeResponse.data);
  }
  /* Fetch collection of both users to view and add other cards
   */
  async function refreshCollection() {
    if (trade) {
      const me = await api.get("/auth/me/");
      let isUserA = trade?.a_user.id == me.data.id ? true : false;
      setUserA(isUserA);
      const my = await api.get(
        "/cards/user/" + (isUserA ? trade?.a_user.id : trade?.b_user.id)
      );
      const trader = await api.get(
        "/cards/user/" + (!isUserA ? trade?.a_user.id : trade?.b_user.id)
      );
      setMyCards(my.data);
      setTraderCards(trader.data);
    }
  }
  async function closeTrade() {
    let users = userA ? ActiveUser.A : ActiveUser.B;
    let updateTrade = {
      ...trade,
      status: TradeStatus.CANCELED,
      activeUser: users,
    };
    await postTrade(updateTrade);
    setTrade(updateTrade);
  }
  async function updateStatus() {
    let users: ActiveUser;
    let status: TradeStatus;
    let updateTrade: trade;
    switch (trade.status) {
      case TradeStatus.PENDING:
        users = userA ? ActiveUser.A : ActiveUser.B;
        updateTrade = {
          ...trade,
          status: TradeStatus.PROPOSE,
          activeUser: users,
        };
        await postTrade(updateTrade);
        setTrade(updateTrade);
        break;
      case TradeStatus.PROPOSE:
        updateTrade = {
          ...trade,
          status: TradeStatus.SHIP,
          activeUser: ActiveUser.NONE,
        };
        await postTrade(updateTrade);
        setTrade(updateTrade);
        break;
      case TradeStatus.SHIP:
        users =
          trade.activeUser == ActiveUser.NONE
            ? userA
              ? ActiveUser.A
              : ActiveUser.B
            : ActiveUser.NONE;
        status =
          users == ActiveUser.NONE ? TradeStatus.RECEIVE : TradeStatus.SHIP;
        updateTrade = { ...trade, status: status, activeUser: users };
        await postTrade(updateTrade);
        setTrade(updateTrade);
        break;
      case TradeStatus.RECEIVE:
        users =
          trade.activeUser == ActiveUser.NONE
            ? userA
              ? ActiveUser.A
              : ActiveUser.B
            : ActiveUser.NONE;
        status =
          users == ActiveUser.NONE
            ? TradeStatus.COMPLETED
            : TradeStatus.RECEIVE;
        updateTrade = { ...trade, status: status, activeUser: users };
        await postTrade(updateTrade);
        console.log(updateTrade);
        console.log(userA);
        setTrade(updateTrade);
        break;
      case TradeStatus.COMPLETED:
        console.log("Completed");
        break;
      case TradeStatus.CANCELED:
        console.log("Cancelled");
        break;
      default:
        console.log("Unknown status");
        break;
    }
  }
  /* Posts a new trade to database
   */
  async function postTrade(trade: trade) {
    console.log(trade);
    let tradeItemsPayload: TradeItemPayload[] = [];
    trade?.trade_items.forEach((item) =>
      tradeItemsPayload.push({
        card_id: item.card.id ?? 0,
        quantity: item.quantity,
      })
    );
    let tradePayload: TradePayload = {
      a_user_id: trade.a_user.id,
      b_user_id: trade.b_user.id,
      status: trade.status,
      activeUser: trade.activeUser,
      trade_items: tradeItemsPayload,
    };
    if (tradeID && (await api.get("/trades/" + tradeID))) {
      console.log("trade found patching");
      const res = await api.patch("/trades/" + tradeID, tradePayload);
    } else if (trade.status !== TradeStatus.CANCELED) {
      //Do not post trade if its immediately canceled
      console.log("trade not found creating new one");
      const res = await api.post("/trades/", tradePayload);
    }
  }
  function handleSelectCard(card: card) {}
  // Moves card from user's collection to their trade offer
  function addCardToTrade(card: card) {
    let newTradeItem: TradeItem = { quantity: 1, card: card };
    setTrade({
      ...trade,
      status: TradeStatus.PENDING,
      activeUser: ActiveUser.NONE,
      trade_items: [...trade.trade_items, newTradeItem],
    });
  }
  // This function updates the quantity of a card in either offer removing if 0
  function updateAmount(card: card, amount: number) {
    let index: number = trade.trade_items.findIndex(
      (item: TradeItem) => item.card.id == card.id
    );
    if (index === -1) {
      console.warn("Trade item not found for update.");
      return;
    }
    const updatedTradeItems = trade.trade_items.map((item, ind) => {
      if (ind === index) {
        return { ...item, quantity: amount };
      }
      return item;
    });
    setTrade({
      ...trade,
      status: TradeStatus.PENDING,
      activeUser: ActiveUser.NONE,
      trade_items: updatedTradeItems.filter((item) => item.quantity > 0),
    });
  }
  // Sorted list of user's cards
  const sortMyCards = [...myCards]
    .filter((card) => card.intent === "have") //Only show haves
    .filter((card) =>
      autoMatch
        ? true
        : traderCards.some(
            (traderCard: card) =>
              traderCard.intent === "want" && traderCard.name === card.name
          )
    )
    .filter((card) =>
      trade
        ? !trade.trade_items.some((item: TradeItem) => item.card.id === card.id)
        : false
    ) //Exclude cards in offer already
    .sort((a, b) => {
      const dir = ascending ? 1 : -1;
      switch (sortOption) {
        case "price":
          return (a.price - b.price) * dir;
        case "dateSort":
          return (
            (new Date(a.date_added ?? Date.now()).getTime() -
              new Date(b.date_added ?? Date.now()).getTime()) *
            dir
          );
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
        : myCards.some(
            (myCard: card) =>
              myCard.intent === "want" && myCard.name === card.name
          )
    )
    .filter((card) =>
      trade
        ? !trade.trade_items.some((item: TradeItem) => item.card.id === card.id)
        : false
    ) //Exclude cards in offer already
    .sort((a, b) => {
      const dir = ascending ? 1 : -1;
      switch (sortOption) {
        case "price":
          return (a.price - b.price) * dir;
        case "dateSort":
          return (
            (new Date(a.date_added ?? Date.now()).getTime() -
              new Date(b.date_added ?? Date.now()).getTime()) *
            dir
          );
        case "nameSort":
          a.name.localeCompare(b.name) * dir;
        case "setName":
          return a.set_name.localeCompare(b.set_name) * dir;
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });

  const currentUserPanelProps = {
    trade: trade,
    userA: userA, // Pass whether current user is a_user
    close: closeTrade,
    onAddCardsClick: () => setViewMyCards(true),
    onProposeClick: () => updateStatus(),
    updateAmount: updateAmount,
  };

  // Define props for the Trader's Panel
  const traderPanelProps = {
    trade: trade,
    userA: !userA,
    onAddCardsClick: () => setViewTraderCards(true),
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
      {showTutor && (
        <MultiTutorialPopup
          pages={tutorialSteps}
          onClose={() => setShowTutor(false)}
          onDisable={() => {
            localStorage.setItem("disableTradeTutorial", "true");
            setShowTutor(false);
          }}
        />
      )}
      {!viewMyCards && !viewTraderCards && (
        <div className="mt-5">
          <StatusBar status={trade.status} />
          <div className="flex gap-6 w-full">
            <TradePanel {...currentUserPanelProps} />
            <TradePanel {...traderPanelProps} />
          </div>
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
              className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
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
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
                  onClick={() => addCardToTrade(card)}
                >
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
                ${viewTraderCards ? "absolute" : "fixed"} inset-0 flex flex-col
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
              className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
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
              children={(card: card) => (
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-lg py-2 px-4"
                  onClick={() => addCardToTrade(card)}
                >
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
