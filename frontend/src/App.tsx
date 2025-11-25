import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import TradePage from "./pages/TradePage";
import TradeLog from "./pages/TradeLogPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import * as React from "react";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/trade/:tradeID?" element={<TradePage />} />
      <Route path="/tradelog" element={<TradeLog />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
