// Types defined across whole frontend
export interface card {
  id?: string;
  name: string;
  set_name: string;
  rarity: string;
  price: number;
  print_description?: string;
  image_url: string;
  owner_id?: string;
  quantity: number;
  intent: "have" | "want";
  date_added?: string | number | Date;
  locked?: boolean;
}

export interface ScryfallPrice {
  usd?: number;
  usd_foil?: number;
  usd_etched?: number;
  eur?: number;
  tix?: number;
}

// Many of these fields are optional as Scryfall returns different fields for different cards
export interface ScryfallCard {
  id?: string;
  name: string;
  set_name: string;
  set?: string;
  rarity: string;
  prices: ScryfallPrice;
  image_uris?: {
    small?: string;
    png?: string;
  };
  card_faces?: Array<{
    name?: string;
    image_uris?: {
      small?: string;
      png?: string;
    };
  }>;
  border_color?: string;
  promo?: boolean;
  variation?: boolean;
  frame_effects?: string[];
  foil?: boolean;
  nonfoil?: boolean;
}

export enum SortOption {
  NAME = "name",
  PRICE = "price",
  DATE_ADDED = "date_added",
  SET_NAME = "set_name",
}

export enum TradeStatus {
  PENDING = "pending",
  PROPOSE = "propose",
  SHIP = "ship",
  RECEIVE = "receive",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export enum ActiveUser {
  NONE = "none",
  A = "a",
  B = "b",
  BOTH = "both",
}

export interface User {
  id?: string;
  username: string;
}

export interface UserSettings {
  disable_warning: boolean;
  backsplash: string;
  dark_mode: boolean;
  email_notifications: boolean;
}

export interface UserAddress {
  full_name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  settings: UserSettings;
  address: UserAddress;
}

export interface TradeItem {
  id?: string;
  card: card;
  quantity: number;
}

export interface trade {
  id?: string;

  status: TradeStatus;
  activeUser: ActiveUser;

  a_user: User;
  b_user: User;

  trade_items: TradeItem[];
  date_added?: string | number | Date;
  last_updated?: string | number | Date;
  a_viewed?: string | number | Date;
  b_viewed?: string | number | Date;
}

// When creating new trades just link to elements with id
export interface TradeItemWrite {
  card_id: string;
  quantity: number;
}
export interface TradeWrite {
  a_user_id: string;
  b_user_id: string;

  trade_items: TradeItemWrite[];
  status: TradeStatus;
  activeUser: ActiveUser;
}

export interface CardPayload {
  name: string;
  set_name: string;
  rarity: string;
  price: number;
  print_description?: string;
  image_url: string;
  quantity: number;
  intent: "have" | "want";
}
