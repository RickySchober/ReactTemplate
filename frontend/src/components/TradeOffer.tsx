// src/components/TradeOfferCard.tsx
import * as React from 'react';
import CardItem from './CardItem'; // Assuming CardItem component is defined as before

interface TradeOfferCardProps {
  trade: TradeOffer;
  currentUserId: number;
}

const TradeOfferCard: React.FC<TradeOfferCardProps> = ({ trade, currentUserId }) => {

  // We need a way to know the owner of the card.
  // Since trade items don't have user_id anymore, we use the card's original owner_id from the 'card' object.
  const userAItems = trade.trade_items.filter(item => item.card.owner_id === trade.a_user_id);
  const userBItems = trade.trade_items.filter(item => item.card.owner_id === trade.b_user_id);

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-md p-6 shadow-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-bold">Trade #{trade.id}</h2>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          trade.status === 'ACCEPTED' ? 'bg-green-600 text-white' : 
          trade.status === 'PENDING' ? 'bg-yellow-600 text-black' : 
          'bg-red-600 text-white'
        }`}>
          {trade.status}
        </span>
      </div>

      <div className="flex justify-between space-x-6">
        {/* User A's Offer */}
        <div className="w-1/2">
          <h3 className={`text-lg font-semibold mb-2 ${
            currentUserId === trade.a_user_id ? 'text-blue-400' : 'text-gray-300'
          }`}>
            {trade.a_user.username}'s Offer
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {userAItems.map(item => (
              // Note: We use item.quantity for the quantity in this specific trade item
              <CardItem key={item.card.id} card={item.card} quantity={item.quantity} />
            ))}
          </div>
        </div>

        {/* User B's Offer */}
        <div className="w-1/2">
          <h3 className={`text-lg font-semibold mb-2 ${
            currentUserId === trade.b_user_id ? 'text-blue-400' : 'text-gray-300'
          }`}>
            {trade.b_user.username}'s Offer
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {userBItems.map(item => (
                 <CardItem key={item.card.id} card={item.card} quantity={item.quantity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeOfferCard;
