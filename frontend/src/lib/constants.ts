export const TRADE_TUTORIAL_STEPS = [
  {
    image: "/tutorials/start_trade.jpg",
    title: "Welcome to Trading",
    body: `Welcome to the trade interface were you negotiate with another user to settle on a mutually beneficial trade. This
      process goes through 5 phases tracked by the progress bar at the top. The first phase is pending were you add cards from eachothers
      collection and propose an initial trade. You may cancel a trade during this phase with the close button.`,
  },
  {
    image: "/tutorials/view_collection.jpg",
    title: "Adding from Collection",
    body: `When viewing cards from either players collection you may add them to the trade with the button below each card. The AUTO MATCH
      toggle only shows cards that the other user has in their wants. Using automatch to add cards will often result in more successful trades 
      as the other user has already indicated they want that card. Once done, select close to return to the trade window.`,
  },
  {
    image: "/tutorials/trader_status.jpg",
    title: "After Initial Proposal",
    body: `After you have proposed an initial trade the other user will review it and either accept, propose a new offer or cancel the trade.
      You can also modify and repropose the offer before they review the trade. Either users status during a trade is listed on their trade panel.`,
  },
  {
    image: "/tutorials/ship_trade.jpg",
    title: "Shipping the Trade",
    body: `Once both users have agreed on a trade the next phase of shipping begins. You will recieve a notification with the other users mailing address
      and must begin the process of shipping your cards. Once both users ship their cards the receive phase begins.`,
  },
  {
    image: "/tutorials/receive_trade.jpg",
    title: "Receiving the Trade",
    body: `On confirming you have received all the cards as listed you should mark the trade as received. Once both players receive their cards the trade is complete!`,
  },
];
export const PROFILE_TUTORIAL_STEPS = [
  {
    image: "/tutorials/wants_haves_tutorial.jpg",
    title: "Wants & Haves",
    body: `Welcome to your profile page. This is where you list cards in your collection
      that you own as HAVES and list cards you want to aquire as WANTS. Click the toggle to switch
      between these two.`,
  },
  {
    image: "/tutorials/view_sort_tutorial.jpg",
    title: "View Your Collection",
    body: `You can view the cards you've added to your WANTS and HAVES in view mode and sort
      them based on different parameters using the sort dropdown.`,
  },
  {
    image: "/tutorials/add_tutorial.jpg",
    title: "Adding to Your Profile",
    body: `To add to your profile click the toggle to select add mode. You can either add
      cards by searching there name or paste in a decklist from a Magic the Gathering deckbuilding website.
      Cards that you have recently added will appear below.`,
  },
  {
    image: "/tutorials/begin_trade_tutorial.jpg",
    title: "Begin a Trade",
    body: `Once you have added a few cards to your profile you can begin a trade. Either search
      for a card name in the search bar above or click the Trade for Card button on cards in your WANT list.`,
  },
];
export const RECENT_ADDED_WINDOW = 60 * 5 * 1000; // timeframe cards will appear in recent added in ms (currently 5 minutes)

export const TRADE_DEFAULT_BG = "/backsplashes/Gudul_Lurker.jpg";
export const SEARCH_DEFAULT_BG = "/backsplashes/Treasure_Cruise.jpg";

export const ALL_BGS = [
  "Gudul_Lurker.jpg",
  "Treasure_Cruise.jpg",
  "Lightning_Bolt.jpg",
  "Nissa.jpg",
  "Soul_Herder.jpg",
  "Evolving_Wilds.jpg",
];
