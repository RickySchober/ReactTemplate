import { useState, useEffect } from "react";
import api from "../api/client";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as React from "react";
import NavBar from "../components/NavBar";
import { ActiveUser, trade, TradeCard, TradeItem } from "../../types";
import CardList from "../components/CardList";
import Backsplash from "../components/Backsplash";
import SortDropdown from "../components/SortDropdown";
import bgArt from "../assets/Dragons-of-Tarkir-Gudul-Lurker-MtG.jpg";
import ToggleSwitch from "../components/ToggleSwitch";


const TradeLog: React.FC = () => {
    const [trades, setTrades] = useState<trade[]>([])
    const [myID, setMyID] = useState()
    const navigate = useNavigate();
    useEffect(() => {
        fetchLogs()
      }, []);

    async function fetchLogs() {
        try {
            const meResponse = await api.get("/auth/me/");
            const currentUserId = meResponse.data.id; // Store the ID in a local variable

            // Optional: Update the state with the ID if needed elsewhere in the component
            setMyID(currentUserId); 
            console.log("Fetched User ID:", currentUserId);

            // Use the local variable (currentUserId) for the second API call
            const tradesResponse = await api.get("/trades/user/" + currentUserId);
            
            console.log("Trades Response:", tradesResponse.data);
            setTrades(tradesResponse.data);
            
        } catch (error) {
            console.error("Error fetching data:", error);
            // You should also handle errors gracefully in the UI
        }
    }
        return(
        <>
        <button onClick={()=>fetchLogs} >reload</button>
        {trades.map((trade) =>(
            <>
            <button onClick={() => navigate(`/trade/${trade.id}`)} >Go to trade {trade.id}</button>
            {trade.trade_items.map((item) => (
                <h3>{item.card.name}</h3>
            ))}
            </>
        ))}
        </>   
    );
}
export default TradeLog;
