// Types defined across whole frontend
export interface card {
  id?: number;
  name: string;
  set_name: string;
  rarity: string;
  price: number;
  print_description?: string;
  image_url: string;
  owner_id?: number;
  quantity: number;
  intent: "have" | "want";
}

export enum TradeStatus {
  PROPOSED = "proposed",
  COUNTERED = "countered",
  ACCEPTED = "accepted",
  SHIPPED = "shipped",
  RECEIVED = "received",  
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export enum ActiveUser {
  NONE = "none",
  A = "a",
  B = "b",
  BOTH = "both",
}

export interface User{
  id: number
  username: string
}

export interface TradeItem {
  id?: number
  card: card
  quantity: number
}

export interface trade {
  id?: number

  status: TradeStatus
  activeUser: ActiveUser

  a_user: User
  b_user: User

  trade_items: TradeItem[]
}

// When creating new trades just link to elements with id
export interface TradeItemPayload {
  card_id: number;
  quantity: number;
}
export interface TradePayload {
  a_user_id: number;         
  b_user_id: number;          
  
  trade_items: TradeItemPayload[]

  status: TradeStatus;       
  activeUser: ActiveUser;    
}
