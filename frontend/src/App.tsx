import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { registerSlowPopupSetter, register404 } from "./api/client.js";

import NotFoundPage from "@/pages/404Page.js";
import LandingPage from "@/pages/LandingPage.js";
import LoginPage from "@/pages/LoginPage.js";
import ProfilePage from "@/pages/ProfilePage/ProfilePage.js";
import SearchPage from "@/pages/SearchPage.js";
import SettingsPage from "@/pages/SettingsPage.js";
import TradeLog from "@/pages/TradeLogPage.js";
import TradePage from "@/pages/TradePage/TradePage.js";


export default function App() {
  const [showSlowPopup, setShowSlowPopup] = useState(false);
  const [show404, setShow404] = useState(false);
  // Allow Axios to control the popup
  registerSlowPopupSetter(setShowSlowPopup as () => boolean);
  register404(setShow404 as () => boolean);
  const location = useLocation();

  useEffect(() => {
    setShow404(false);
  }, [location.pathname]);

  return (
    <>
      {showSlowPopup && (
        <div className="z-9999 fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-xl bg-slate-900 p-16 text-center shadow-xl">
            <p className="text-2xl font-medium">Request is taking longer than expected.</p>
            <p className="text-2xl font-medium">Server may be booting up please be patient.</p>
          </div>
        </div>
      )}
      {show404 && (
        <div className="z-90 fixed mt-20 flex h-full w-full flex-col items-center justify-center gap-8 bg-slate-900">
          <p className="text-6xl font-medium">404 Page Not Found</p>
          <p className="text-2xl font-medium">Invalid url, trade, or card ID</p>
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
