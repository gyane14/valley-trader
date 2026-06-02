export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type Weather = 'Sunny' | 'Rainy' | 'Cloudy' | 'Drought' | 'Storm';

export type ItemId =
  | 'wheat_seed' | 'corn_seed' | 'tomato_seed' | 'potato_seed' | 'carrot_seed'
  | 'cabbage_seed' | 'pumpkin_seed' | 'strawberry_seed' | 'grape_seed' | 'melon_seed' | 'pepper_seed' | 'onion_seed'
  | 'wheat' | 'corn' | 'tomato' | 'potato' | 'carrot'
  | 'cabbage' | 'pumpkin' | 'strawberry' | 'grape' | 'melon' | 'pepper' | 'onion'
  | 'wood' | 'stone' | 'flour' | 'ale';

export type ItemType = 'seed' | 'crop' | 'resource' | 'artisan';

export interface Item {
  id: ItemId;
  name: string;
  type: ItemType;
  basePrice: number;
  description: string;
}

export interface CropData {
  seedId: ItemId;
  cropId: ItemId;
  growTime: number; // in days
  yield: [number, number]; // min, max
  seasons: Season[];
}

export interface Plot {
  id: string;
  isUnlocked: boolean;
  plantedCrop?: ItemId | null; // seedId
  daysPlanted?: number;
  watered?: boolean;
}

export interface VillagerDef {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  preferences: { likes: ItemId[]; dislikes: ItemId[] };
  baseGold: number;
}

export interface TradeOrder {
  id: string;
  villagerId: string;
  type: 'buy' | 'sell'; // from villager's perspective: buy means they buy from you, sell means they sell to you
  reqItemId: ItemId;
  reqAmount: number;
  offerMoney: number;
  expiresIn: number;
  negotiationTries: number;
  isMerchant?: boolean;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { money: number; items?: Partial<Record<ItemId, number>> };
  effect: string;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  duration: number;
  priceMultipliers: Partial<Record<ItemId, number>>;
}

export type LawType = 'subsidize_seeds' | 'abolish_mandi' | 'subsidize_buildings' | 'price_controls' | 'none';

export interface PoliticalParty {
  id: string;
  name: string;
  leader: string;
  mandate: string;
  law: LawType;
  color: string;
}

export interface GameState {
  day: number;
  season: Season;
  weather: Weather;
  money: number;
  energy: number;
  maxEnergy: number;
  reputation: number;
  inflation: number; // multiplier
  inventory: Partial<Record<ItemId, number>>;
  plots: Plot[];
  marketPrices: Record<ItemId, number>;
  marketTrends: Record<ItemId, 'up' | 'down' | 'stable'>;
  supplyDemand: Partial<Record<ItemId, number>>; // negative = high supply (cheaper), positive = high demand (more expensive)
  activeOrders: TradeOrder[];
  travelingMerchant: TradeOrder[] | null;
  activeEventId: string | null;
  eventDaysLeft: number;
  unlockedBuildings: string[];
  logs: string[];
  
  // Politics
  currentPartyId: string | null;
  activeLaw: LawType;
  daysUntilElection: number;
  playerVote: string | null;
  
  // Runtime Villager State
  villagers: Record<string, {
    mood: 'happy' | 'neutral' | 'annoyed' | 'angry';
    gold: number;
  }>;
}
