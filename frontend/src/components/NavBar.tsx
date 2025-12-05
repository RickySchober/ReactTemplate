/* Navigation bar on the top of most pages to easily navigate between them.
   If user is logged in will display profile dropdown otherwise show sign in.
*/
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
    <div className="z-30 flex w-full items-center justify-between bg-neutral-900 px-4 py-1 text-white shadow-md">
      {/* App Icon / Title */}
      <div
        onClick={() => navigate("/")}
        className="flex cursor-pointer items-center gap-2"
      >
        <h1 className="flex items-center gap-2 text-4xl font-bold text-gray-200">
          <img
            src={icon}
            alt="M"
            className="inline-block h-12 w-12 object-contain"
          />
          <span className="-ml-1 leading-none">TGTrader</span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className="mx-6 w-auto flex-1">
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
          <button
            onClick={() => navigate("/login")}
            className="whitespace-nowrap bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
