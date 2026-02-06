import React, { createContext, useState } from "react";

import api from "@/api/client.js";
import { trade, User } from "@/lib/types.js";
import { haveViewedTrade } from "@/lib/utils.js";

export const TradeContext = createContext({
  trades: [] as trade[],
  fetchTrades: async () => {},
  tradeNotification: 0,
});

export default function TradeProvider({ children }) {
  const [trades, setTrades] = useState<trade[]>([]);
  const [user, setUser] = useState<User>({ id: "", username: "" });

  const fetchTrades = async () => {
    try {
      const meResponse = await api.get("/auth/me/");
      const currentUserId = meResponse.data.id;
      setUser({ id: meResponse.data.id, username: meResponse.data.username });

      const tradesResponse = await api.get(`/trades/user/${currentUserId}`);
      setTrades(tradesResponse.data);
      console.log(tradesResponse.data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  };

  const tradeNotification = trades.filter((t) => !haveViewedTrade(t, user)).length;

  return (
    <TradeContext.Provider value={{ trades, fetchTrades, tradeNotification }}>
      {children}
    </TradeContext.Provider>
  );
}
