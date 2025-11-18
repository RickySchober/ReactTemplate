import { useState, useEffect } from "react";
import api from "../api/client";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as React from "react";
import NavBar from "../components/NavBar";
import { card } from "../../types";
import CardList from "../components/CardList";
import Backsplash from "../components/Backsplash";
import SortDropdown from "../components/SortDropdown";
import bgArt from "../assets/Dragons-of-Tarkir-Gudul-Lurker-MtG.jpg";
import ToggleSwitch from "../components/ToggleSwitch";

const TradePage: React.FC = () => {
    const { tradeID } = useParams();
    const location = useLocation();

    const isExistingTrade = Boolean(tradeID);
    // If creating a new trade, get initial data from location state
    const newTrade = location.state || {};
    const [myID, setMyID] = useState<number | null>(
        isExistingTrade ? null : newTrade.myID ?? null
    );
    const [traderID, setTraderID] = useState<number | null>(
        isExistingTrade ? null : newTrade.traderID ?? null
    );
    const [traderOffer, setTraderOffer] = useState<card[]>(
        isExistingTrade ? [] : newTrade.traderOffer ?? []
    );

    const [myCards, setMyCards] = useState<card[]>([]);
    const [traderCards, setTraderCards] = useState<card[]>([]);
    const [sortOption, setSortOption] = useState<string>("dateSort");
    const [ascending, setAscending] = useState<boolean>(true);
    const [myOffer, setMyOffer] = useState<card[]>([]);
    const [autoMatch, setAutoMatch] = useState<boolean>(false)
    const navigate = useNavigate();
    const [searchRedirect, setSearchRedirect] = useState<string>("");
    const [viewMyCards, setViewMyCards] = useState<boolean>(false);
    const [viewTraderCards, setViewTraderCards] = useState<boolean>(false);

    useEffect(() => {
        if (isExistingTrade) {
        fetchTrade();
        }
        else {
            refreshTrade();
        }
    },[]);

    // Sorted list of user's cards 
    const sortMyCards = [...myCards]
    .filter((card) => card.intent==="have") //Only show haves
    .filter((card) => autoMatch? true : traderCards.filter(( //Only matches on automatch
        card) => card.intent==="want").includes(card)) 
    .filter((card) => !myOffer.includes(card)) //Exclude cards in offer already
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
    .filter((card) => card.intent==="have") //Only show haves
    .filter((card) => autoMatch? true : myCards.filter(( //Only matches on automatch
            card) => card.intent==="want").includes(card)) 
    .filter((card) => !traderOffer.includes(card)) //Exclude cards in offer already
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

    async function refreshTrade() {
        const my = await api.get('cards/user/' + myID)
        const trader = await api.get('cards/user/' + traderID)
        setMyCards(my.data)
        setTraderCards(trader.data)
    }
    /* Fetch both users' cards and the trade details.
       Validate that all cards in trade still exist and are owned by the correct users.
    */
    async function fetchTrade() {
        const my = await api.get('cards/user/' + myID)
        const trader = await api.get('cards/user/' + traderID)
        const trade = await api.get('trades/' + tradeID)
        setMyCards(my.data)
        setTraderCards(trader.data)
    }
    function handleSelectCard(card: card) {
    }
    // Moves card from user's collection to their trade offer
    function addCardToTrade(card: card){
        const [array, setArray] = myCards.includes(card) ? [myOffer, setMyOffer] : [traderOffer, setTraderOffer]
        card.quantity = 1
        setArray([...array, card])
    }
    // This function updates the quantity of a card in either offer
    function updateAmount(card: card, amount: number){
        const [array, setArray] = traderOffer.includes(card) ? [traderOffer, setTraderOffer] : [myOffer, setMyOffer]
        let index: number = array.indexOf(card)
        array[index].quantity = amount
        if(array[index].quantity <= 0){
            array.splice(index, 1);
        }
        setArray([...array])
    }
    return (
    <div className="position-relative z-20">
        <NavBar
          search={searchRedirect}
          setSearch={setSearchRedirect}
          onSelect={handleSelectCard}
          placeholder="Search for a card..."
        />
        {!viewMyCards&&!viewTraderCards && (<div className="flex">
            <div className="w-1/2 p-4">
                <h2 className="text-xl font-bold mb-4">My Cards</h2>
                <button onClick={() => setViewMyCards(true)}>Add Cards</button>
                <CardList 
                cards={myOffer}
                modJuant={updateAmount}
                />
            </div>
            <div className="w-1/2 p-4">
                <h2 className="text-xl font-bold mb-4">Trader's Cards</h2>
                <button className="m-3" onClick={() => setViewTraderCards(true)}>Add Cards</button>
                <CardList 
                cards={traderOffer}
                modJuant={updateAmount}
                />
            </div>
        </div>
        )}
       {viewMyCards && (
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
                <button onClick={()=>{
                    setViewTraderCards(false);
                    setViewMyCards(false);
                    refreshTrade();
                }}>close</button>
            </div>
            <div className="mt-4">
                <CardList
                cards={sortMyCards}
            />
            </div>
        </Backsplash>
        )}
        {viewTraderCards && (
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
                <button onClick={()=>{
                    setViewTraderCards(false);
                    setViewMyCards(false);
                    refreshTrade();
                }}>close</button>
            </div>
            <div className="mt-4">
                <CardList
                cards={sortTraderCards}
                children={(card) =>
                    <button onClick={()=>addCardToTrade(card)}>
                        Add to Offer
                    </button>
                }       
            />
            </div>
        </Backsplash>
        )}
      </div>
    );
}
export default TradePage;