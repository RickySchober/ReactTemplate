import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import TradePage from "./pages/TradePage";
import TradeLog from "./pages/TradeLogPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import * as React from "react";
import { useState } from "react";
import { registerSlowPopupSetter } from "./api/client";

export default function App() {
  const [showSlowPopup, setShowSlowPopup] = useState(false);

  // Allow Axios to control the popup
  registerSlowPopupSetter(setShowSlowPopup);
  return (
    <>
    {showSlowPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm
                        flex items-center justify-center z-9999">
          <div className="bg-slate-900 p-16 rounded-xl shadow-xl text-center">
            <p className="font-medium text-2xl">Request is taking longer than expected.</p>
            <p className="font-medium text-2xl">Server may be booting up please be patient.</p>
          </div>
        </div>
      )}
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/trade/:tradeID?" element={<TradePage />} />
      <Route path="/tradelog" element={<TradeLog />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
    </>
  );
}
