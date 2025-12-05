/* Basic landing page with explanation of site.
 */
import * as React from "react";
import NavBar from "../components/NavBar.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const [searchRedirect, setSearchRedirect] = useState<string>("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f1720] text-white">
      <NavBar
        search={searchRedirect}
        setSearch={setSearchRedirect}
        placeholder="Search for a card..."
      />
      {/* Title Section */}
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">
          Trade Magic The Gathering Cards Worldwide
        </h1>
        <p className="max-w-2xl text-lg text-white/80">
          MTGTrader makes it easy to safely trade Magic The Gathering cards with
          players across the globe. Post your collection, browse offers, and
          trade with confidence.
        </p>
        <button
          onClick={
            token ? () => navigate("/profile") : () => navigate("/login")
          }
          className="mt-4 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600"
        >
          Get Started
        </button>
      </section>

      {/* Concept Explanation */}
      <section className="bg-[#111318] px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <h2 className="text-3xl font-bold text-blue-400">How It Works</h2>
          <p className="text-lg text-white/80">
            MTGTrader connects collectors and players from around the world.
            Create an account, list the cards in your collections as haves, and
            cards your looking to aquire as wants. Search the site for cards you
            want and initiate a trade with another user. Add additional cards
            from eachother's collection and propose a trade you think is fair.
            Once both traders accept the trade begin shipment to eachothers
            mailing address. Track shipments, confirm delivery, and complete
            trades all from within the platform.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-white/60">
        {new Date().getFullYear()} MTGTrader. All Rights Reserved.
      </footer>
    </div>
  );
};
export default LandingPage;
