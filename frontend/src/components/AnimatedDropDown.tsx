/* Dropdown menu for selecting from list such as profile button
 */
import React from "react";
import { useState, useRef, useEffect, useContext } from "react";

import Button from "./Button.js";

import { TradeContext } from "@/context/TradeProvider.js";
interface AnimatedDropDownProps {
  options: { name: string; onClick: () => void }[];
}

const AnimatedDropDown: React.FC<AnimatedDropDownProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOnClickOutside(() => setIsOpen(false)); // Use the custom hook
  const toggleMenu = () => setIsOpen(!isOpen);
  const { tradeNotification, fetchTrades } = useContext(TradeContext);
  const numberOfNotifs = tradeNotification > 99 ? "99+" : tradeNotification;

  useEffect(() => {
    fetchTrades(); // load once on mount
  }, []);

  return (
    <div className="z-99 relative inline-block text-left" ref={dropdownRef}>
      <Button
        type="button"
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-blue-400 px-4 py-2 text-lg font-medium shadow-sm hover:bg-blue-500 focus:outline-none"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Profile
      </Button>
      {tradeNotification > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border-2 border-gray-900 bg-red-500 px-1 text-sm font-bold leading-none text-white">
          {numberOfNotifs}
        </span>
      )}

      <div
        className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-out ${
          isOpen
            ? "visible max-h-screen scale-y-100 opacity-100"
            : "invisible max-h-0 scale-y-95 opacity-0" // Animate max-height and opacity
        } overflow-hidden`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        {options.map((option) => {
          const isTradeLog = option.name.toLowerCase() === "trade log";
          if (isTradeLog) console.log("Trade Notification Count:", tradeNotification);
          return (
            <a
              key={option.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                option.onClick();
                setIsOpen(false);
              }}
              className="relative block px-4 py-3 text-lg text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                {option.name}

                {isTradeLog && tradeNotification > 0 && (
                  <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border-2 border-gray-900 bg-red-500 px-1 text-sm font-bold leading-none text-white">
                    {numberOfNotifs}
                  </span>
                )}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedDropDown;

export function useOnClickOutside(handler: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendant elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Reload only if ref or handler changes

  return ref;
}
