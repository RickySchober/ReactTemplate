import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import SearchCard from "./SearchCard";

export default function NavBar ({ search, setSearch, onSelect, placeholder = "Search for a card..." }) {

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    function handleSignOut() {
        localStorage.removeItem("token");
        navigate("/login");
    }
    return (
        <div /* ─── NAVBAR ──────────────────────────────── */
            style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            }}>
        {/* App Icon / Title */}
        <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
        >
            <img src="/favicon.svg" alt="App Icon" className="w-8 h-8" />
            <h1 className="text-xl font-bold text-gray-800">MTGTrader</h1>
        </div>

        {/* Search Bar */}
       <SearchCard
            value={search}
            onChange={setSearch}
            onSelect={onSelect}
            placeholder={placeholder}
        />

        {/* Auth & Profile Buttons */}
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
            {token ? (
            <>
                <button
                onClick={() => navigate("/profile")}
                className="text-gray-700 font-medium hover:text-blue-600"
                >
                Profile
                </button>
                <button
                onClick={handleSignOut}
                className="text-red-600 font-medium hover:text-red-700"
                >
                Sign Out
                </button>
            </>
            ) : (
            <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
                Sign In
            </button>
            )}
        </div>
     </div>);
}