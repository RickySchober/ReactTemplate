/* Navigation bar on the top of most pages to easily navigate between them.
   If user is logged in will display profile dropdown otherwise show sign in.
*/
import React from "react";
import { useNavigate } from "react-router-dom";

import icon from "/favicon.png";
import AnimatedDropDown from "./AnimatedDropDown.js";
import Button from "./Button.js";
import SearchCard from "./SearchCard.js";

import { card } from "@/lib/types.js";

interface NavBarProps {
  onSelect?: (card: card) => void; // Callback when a card is selected from search.
}

const NavBar: React.FC<NavBarProps> = ({ onSelect }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  function handleSignOut() {
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <div className="z-30 flex w-full items-center justify-between bg-neutral-900 px-4 py-1 text-white shadow-md">
      {/* App Icon / Title */}
      <div onClick={() => navigate("/")} className="flex cursor-pointer items-center gap-2">
        <h1 className="flex items-center gap-2 text-4xl font-bold text-gray-200">
          <img src={icon} alt="M" className="inline-block h-12 w-12 object-contain" />
          <span className="-ml-1 leading-none">TGTrader</span>
        </h1>
      </div>

      <div className="mx-6 w-auto flex-1">
        <SearchCard onSelect={onSelect} />
      </div>

      {/* Auth Buttons */}
      {token ? (
        <>
          <AnimatedDropDown
            options={[
              { name: "Profile", onClick: () => navigate("/profile") },
              { name: "Settings", onClick: () => navigate("/settings") },
              { name: "Trade Log", onClick: () => navigate("/tradelog") },
              { name: "Sign Out", onClick: handleSignOut },
            ]}
          />
        </>
      ) : (
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      )}
    </div>
  );
};

export default NavBar;
