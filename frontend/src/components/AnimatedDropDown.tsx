/* Dropdown menu for selecting from list such as profile button
 */
import * as React from "react";
import { useState, useRef, useEffect } from "react";

interface AnimatedDropDownProps {
  options: { name: string; onClick: () => void }[];
}

const AnimatedDropDown: React.FC<AnimatedDropDownProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOnClickOutside(() => setIsOpen(false)); // Use the custom hook

  const toggleMenu = () => setIsOpen(!isOpen);
  return (
    <div className="z-99 relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-blue-400 px-4 py-2 text-lg font-medium shadow-sm hover:bg-blue-500 focus:outline-none"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Profile
      </button>

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
        {options.map((option) => (
          <a
            key={option.name}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              option.onClick();
              setIsOpen(false); // Close menu after selection
            }}
            className="block px-4 py-3 text-lg text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            role="menuitem"
          >
            {option.name}
          </a>
        ))}
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
