/* Component for displaying cards. Is designed to be adaptable to 
   different card interfaces allowing you to pass in child components.
*/
import * as React from "react";
import { card } from "../lib/types.js";
import Button from "./Button.js";

interface CardItemProps {
  card: card;
  modQuant?: (card: card, amount: number) => void; //Displays quantity buttons if defined
  maxQuant?: number; //Limits quantity if defined
  children?: React.ReactNode; //Adds additional elements to bottom
}

const CardItem: React.FC<CardItemProps> = ({ card, modQuant, maxQuant, children }) => {
  return (
    <div className="flex flex-col items-center rounded-md border border-gray-300 bg-neutral-900 @container">
      {/* Card image */}
      <img src={card.image_url} alt={card.name} className="w-full" />

      {/* Card info row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-white @md:gap-3 @lg:gap-4">
        {/* Quantity controls */}
        {modQuant && (
          <div className="flex items-center gap-2">
            <Button
              className="text-md rounded bg-green-600 px-2 py-0.5 text-white hover:bg-green-700 @sm:text-lg @md:px-2.5 @md:py-1 @md:text-xl @lg:px-3 @lg:py-1.5 @lg:text-2xl"
              onClick={() =>
                modQuant(card, maxQuant == card.quantity ? card.quantity : card.quantity + 1)
              }
            >
              +
            </Button>

            <p className="text-ls @2xs:text-xl @xs:text-2xl @sm:text-4xl">
              {card.quantity}
              {maxQuant ? "/" + maxQuant : ""}
            </p>

            <Button
              className="text-md rounded bg-red-600 px-2 py-0.5 text-white hover:bg-red-700 @sm:text-lg @md:px-2.5 @md:py-1 @md:text-xl @lg:px-3 @lg:py-1.5 @lg:text-2xl"
              onClick={() => modQuant(card, card.quantity - 1)}
            >
              -
            </Button>
          </div>
        )}

        {/* Card text info */}
        <div className="flex max-w-[50%] flex-col text-center">
          <h4 className="text-md font-bold @sm:text-lg @md:text-xl @lg:text-2xl">{card.name}</h4>
          <p className="@md:text-md text-xs text-gray-400 @sm:text-sm @lg:text-lg">
            {card.set_name}
          </p>

          {card.print_description && (
            <p className="mt-1 text-xs text-gray-500">{card.print_description}</p>
          )}
          <p className="@md:text-md mt-1 text-xs @sm:text-sm @lg:text-lg">
            ${Number(card.price || 0).toFixed(2)}
          </p>
        </div>

        {/* Remove button */}
        {modQuant && (
          <Button
            className="text-md rounded bg-red-700 px-2 py-1 hover:bg-red-800 @sm:text-lg @md:px-2.5 @md:py-1.5 @md:text-xl @lg:px-3 @lg:py-2 @lg:text-2xl"
            onClick={() => modQuant(card, 0)}
          >
            remove
          </Button>
        )}
      </div>
      <div className="mb-2">{children}</div>
    </div>
  );
};

export default CardItem;
