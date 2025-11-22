import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

interface AnimatedDropDownProps{
  options: [{name: string, onClick: () => void}];
}

const AnimatedDropDown: React.FC<AnimatedDropDownProps>= ({
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOnClickOutside(() => setIsOpen(false)); // Use the custom hook

  const toggleMenu = () => setIsOpen(!isOpen);
  return (
    <div className="relative z-30 inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium bg-blue-400 text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          Profile
        </button>
      </div>

      <div
        // Use standard Tailwind transition classes for smooth animation
        className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 scale-y-100 visible max-h-screen'
            : 'opacity-0 scale-y-95 invisible max-h-0' // Animate max-height and opacity
        } overflow-hidden`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        <div className="py-1" role="none">
          {options.map((option) => (
            <a
              key={option.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                option.onClick();
                setIsOpen(false); // Close menu after selection
              }}
              className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              {option.name}
            </a>
          ))}
        </div>
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

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Reload only if ref or handler changes

  return ref;
}
