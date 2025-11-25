/* Component for displaying cards. Is designed to be adaptable to 
   different card interfaces allowing you to pass in child components.
*/
import * as React from "react";
import { card } from "../../types";
import { useNavigate } from "react-router-dom";

interface CardItemProps {
  card: card;
  modQuant?: (card: card, amount: number) => void; //Displays quantity buttons if defined
  maxQuant?: number; //Limits quantity if defined
  children?: React.ReactNode; //Adds additional elements to bottom
}

const CardItem: React.FC<CardItemProps> = ({
  card,
  modQuant,
  maxQuant,
  children,
}) => {
  const navigate = useNavigate();
  function handleSelectUser() {
    console.log("Selected card:", card);
    navigate(`/user/${card.owner_id}`);
  }
  return (
    <div className="@container flex flex-col items-center border border-gray-300 rounded-md shadow-sm overflow-hidden bg-neutral-900">
      {/* Card image */}
      <img src={card.image_url} alt={card.name} className="w-full" />

      {/* Card info row */}
      <div className="flex justify-between items-center px-3 py-2 gap-2 @md:gap-3 @lg:gap-4 text-white">
        {/* Quantity controls */}
        {modQuant && (
          <div className="flex items-center gap-2">
            <button
              className="px-2 @md:px-2.5 @lg:px-3
                       py-0.5 @md:py-1 @lg:py-1.5 
                       text-md @sm:text-lg @md:text-xl @lg:text-2xl
                       bg-green-600 hover:bg-green-700 rounded text-white"
              onClick={() =>
                modQuant(
                  card,
                  maxQuant == card.quantity ? card.quantity : card.quantity + 1
                )
              }
            >
              +
            </button>

            <p className="text-ls @2xs:text-xl @xs:text-2xl @sm:text-4xl">
              {card.quantity}
              {maxQuant ? "/" + maxQuant : ""}
            </p>

            <button
              className="px-2 @md:px-2.5 @lg:px-3
                       py-0.5 @md:py-1 @lg:py-1.5
                       text-md @sm:text-lg @md:text-xl @lg:text-2xl
                          bg-red-600 hover:bg-red-700 rounded text-white"
              onClick={() => modQuant(card, card.quantity - 1)}
            >
              -
            </button>
          </div>
        )}

        {/* Card text info */}
        <div className="flex flex-col text-center ">
          <h4 className="text-md @sm:text-lg @md:text-xl @lg:text-2xl font-bold">
            {card.name}
          </h4>
          <p className="text-xs @sm:text-sm @md:text-md @lg:text-lg text-gray-400">
            {card.set_name}
          </p>

          {card.print_description && (
            <p className="text-xs text-gray-500 mt-1">
              {card.print_description}
            </p>
          )}
          <p className="text-sm mt-1">
            {card.owner ? card.owner.username : ""}
          </p>
          <p className="text-xs @sm:text-sm @md:text-md @lg:text-lg mt-1">
            ${Number(card.price || 0).toFixed(2)}
          </p>
        </div>

        {/* Remove button */}
        {modQuant && (
          <button
            className="px-2 @md:px-2.5 @lg:px-3
                       py-1 @md:py-1.5 @lg:py-2 
                       text-md @sm:text-lg @md:text-xl @lg:text-2xl
                       bg-red-700 hover:bg-red-800 rounded whitespace-nowrap"
            onClick={() => modQuant(card, 0)}
          >
            remove
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default CardItem;
