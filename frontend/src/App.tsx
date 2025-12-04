import { Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import TradePage from "./pages/TradePage";
import TradeLog from "./pages/TradeLogPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/404Page";
import * as React from "react";
import { useState, useEffect } from "react";
import { registerSlowPopupSetter, register404 } from "./api/client";


export default function App() {
  const [showSlowPopup, setShowSlowPopup] = useState(false);
  const [show404, setShow404] = useState(false);  
  // Allow Axios to control the popup
  registerSlowPopupSetter(setShowSlowPopup);
  register404(setShow404);
  const location = useLocation();

  useEffect(() => {
    setShow404(false);
  }, [location.pathname]);
  
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
      {show404 && (
        <div className="fixed mt-20 w-full h-full bg-slate-900
                        flex flex-col gap-8 items-center justify-center z-90">
            <p className="font-medium text-6xl">404 Page Not Found</p>
            <p className="font-medium text-2xl">Invalid url, trade, or card ID</p>
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
