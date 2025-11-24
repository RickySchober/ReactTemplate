import * as React from "react";
import NavBar from "../components/NavBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const [searchRedirect,setSearchRedirect] = useState<string>("")
    const navigate = useNavigate()
    const token = localStorage.getItem("token");
  return (
    <div className="min-h-screen w-full bg-[#0f1720] text-white flex flex-col">
        <NavBar
          search={searchRedirect}
          setSearch={setSearchRedirect}
          placeholder="Search for a card..."
        />
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6 gap-6">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">
          Trade Magic The Gathering Cards Worldwide
        </h1>
        <p className="text-lg max-w-2xl text-white/80">
          MTGTrader makes it easy to safely trade Magic The Gathering cards with
          players across the globe. Post your collection, browse offers,
          and trade with confidence.
        </p>
        <button onClick={(token ? ()=>navigate("/profile") : ()=>navigate("/login")) } className="mt-4 px-6 py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all">
          Get Started
        </button>
      </section>

      {/* Concept Explanation */}
      <section className="bg-[#111318] py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-blue-400">How It Works</h2>
          <p className="text-white/80 text-lg">
            MTGTrader connects collectors and players from around the world.
            Create an account, list the cards in your collections as haves, and cards
            your looking to aquire as wants. Search the site for cards you want and initiate a trade 
            with another user. Add additional cards from eachother's collection and propose a trade
            you think is fair. Once both traders accept the trade begin shipment to eachothers mailing address.
            Track shipments, confirm delivery, and complete trades all from within the platform.
          </p>
        </div>
      </section>

      {/* Video Placeholder */}
      <section className="py-16 px-6 bg-[#0b0d10] flex flex-col items-center gap-4">
        <h2 className="text-3xl font-bold text-blue-400">Watch How It Works</h2>
        <div className="w-full max-w-3xl aspect-video bg-black/40 border border-white/10 rounded-lg flex items-center justify-center text-white/40 text-xl">
          Video Placeholder
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-white/60 text-sm">
        {new Date().getFullYear()} MTGTrader. All Rights Reserved.
      </footer>
    </div>
  );
}
