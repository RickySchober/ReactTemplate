import { useNavigate, useLocation } from "react-router-dom";
import SearchCard from "./SearchCard";
import icon from "/favicon.png";
import * as React from "react";
import { card } from "../../types";
import AnimatedDropDown from "./AnimatedDropDown";

interface NavBarProps {
  search: string;
  setSearch?: (value: string) => void;
  onSelect?: (card: card) => void;
  placeholder?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  search,
  setSearch,
  onSelect,
  placeholder,
}) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  function handleSignOut() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function handleSearchSelection(card: card) {
    if (location.pathname === "/search") {
      setSearch?.(card?.name || "");
      if (typeof onSelect === "function") onSelect(card);
      return;
    }
    const q = encodeURIComponent(card?.name || "");
    navigate(`/search?q=${q}`);
  }

  return (
    <div className="flex justify-between items-center w-full px-4 py-1 bg-neutral-900 text-white shadow-md">
      {/* App Icon / Title */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <h1 className="flex items-center gap-2 text-4xl font-bold text-gray-200">
          <img
            src={icon}
            alt="M"
            className="w-12 h-12 object-contain inline-block"
          />
          <span className="-ml-1 leading-none">TGTrader</span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex-1 w-auto mx-6">
        <SearchCard
          value={search}
          onChange={setSearch}
          onSelect={handleSearchSelection}
          placeholder={placeholder}
        />
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        {token ? (
          <>
            <AnimatedDropDown options={[
              {name: "Profile", onClick: ()=>navigate("/profile")},
              {name: "Settings", onClick: ()=>navigate("/profile")},
              {name: "Trades", onClick: ()=>navigate("/profile")},
              {name: "Sign Out", onClick: handleSignOut},
            ]}/>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="whitespace-nowrap hover:text-gray-300 transition"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
