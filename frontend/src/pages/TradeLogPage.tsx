/* Tradelog page displays the entire trade history of the user 
   with a short summary of each trade allowing easy navigate to trades.
*/
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/api/client.js";
import NavBar from "@/components/NavBar.js";
import { TradeStatus, trade, TradeItem } from "@/lib/types.js";

const TradeLogPage: React.FC = () => {
  const [trades, setTrades] = useState<trade[]>([]);
  const [myID, setMyID] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const meResponse = await api.get("/auth/me/");
      const currentUserId = meResponse.data.id;
      setMyID(currentUserId);

      const tradesResponse = await api.get(`/trades/user/${currentUserId}`);
      setTrades(tradesResponse.data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  }

  function calculateTotal(items: TradeItem[]) {
    return items.reduce((sum, ti) => sum + (ti.card?.price ?? 0) * ti.quantity, 0);
  }

  function getOtherUser(trade: trade) {
    return trade.a_user?.id === myID ? trade.b_user : trade.a_user;
  }

  function statusColor(status: TradeStatus) {
    switch (status) {
      case TradeStatus.COMPLETED:
        return "text-green-400";
      case TradeStatus.CANCELED:
        return "text-red-400";
      case TradeStatus.SHIP:
      case TradeStatus.RECEIVE:
        return "text-yellow-400";
      case TradeStatus.PROPOSE:
        return "text-blue-400";
      default:
        return "text-gray-300";
    }
  }

  return (
    <>
      <NavBar />
      <div className="mx-auto max-w-5xl p-6 text-white">
        <h1 className="mb-6 text-3xl font-bold">Trade Log:</h1>

        <div className="space-y-4">
          {trades.map((trade: trade) => {
            const myItems = trade.trade_items.filter((ti) => ti.card?.owner_id === myID);
            const theirItems = trade.trade_items.filter((ti) => ti.card?.owner_id !== myID);

            const myTotal = calculateTotal(myItems);
            const theirTotal = calculateTotal(theirItems);
            const otherUser = getOtherUser(trade);

            return (
              <div
                key={trade.id}
                onClick={() => navigate(`/trade/${trade.id}`)}
                className="cursor-pointer rounded border border-gray-700 bg-[#111318] p-4 transition hover:bg-[#1a1d22]"
              >
                {/* Header Row */}
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-baseline justify-between gap-7">
                    <h2 className="text-xl font-semibold">Trade #{trade.id}</h2>
                    {/* User Info */}
                    <p className="mb-2 text-xl text-gray-300">
                      Trading with:{" "}
                      <span className="font-semibold text-white">{otherUser?.username}</span>
                    </p>
                  </div>
                  <span className={`font-bold ${statusColor(trade.status)}`}>
                    {trade.status.toUpperCase()}
                  </span>
                </div>

                {/* Totals */}
                <div className="mb-1 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Your Value</p>
                    <p className="text-lg font-bold text-blue-400">${myTotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Their Value</p>
                    <p className="text-lg font-bold text-green-400">${theirTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* Card preview thumbnails */}
                <div className="mt-4 flex justify-between gap-3">
                  {/* Your cards */}
                  <div className="flex gap-2">
                    {myItems.slice(0, 4).map((ti) => (
                      <img
                        key={ti.id}
                        src={ti.card?.image_url}
                        alt={ti.card?.name}
                        className="h-12 w-8 rounded-sm border border-gray-700 object-cover"
                      />
                    ))}
                  </div>

                  {/* Their cards */}
                  <div className="flex gap-2">
                    {theirItems.slice(0, 4).map((ti) => (
                      <img
                        key={ti.id}
                        src={ti.card?.image_url}
                        alt={ti.card?.name}
                        className="h-12 w-8 rounded-sm border border-gray-700 object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {trades.length === 0 && (
            <p className="mt-6 text-center text-gray-400">No trades found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TradeLogPage;
