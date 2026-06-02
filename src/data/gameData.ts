import { Item, CropData, Building, VillagerDef, GameEvent, ItemId, PoliticalParty } from '../types';

export const ITEMS: Record<ItemId, Item> = {
  wheat_seed: { id: 'wheat_seed', name: 'Wheat Seed', type: 'seed', basePrice: 10, description: 'Grows in 2 days.' },
  corn_seed: { id: 'corn_seed', name: 'Corn Seed', type: 'seed', basePrice: 15, description: 'Grows in 3 days.' },
  tomato_seed: { id: 'tomato_seed', name: 'Tomato Seed', type: 'seed', basePrice: 20, description: 'Grows in 4 days.' },
  potato_seed: { id: 'potato_seed', name: 'Potato Seed', type: 'seed', basePrice: 25, description: 'Grows in 3 days.' },
  carrot_seed: { id: 'carrot_seed', name: 'Carrot Seed', type: 'seed', basePrice: 15, description: 'Grows in 3 days.' },
  cabbage_seed: { id: 'cabbage_seed', name: 'Cabbage Seed', type: 'seed', basePrice: 18, description: 'Grows in 4 days.' },
  pumpkin_seed: { id: 'pumpkin_seed', name: 'Pumpkin Seed', type: 'seed', basePrice: 40, description: 'Grows in 5 days.' },
  strawberry_seed: { id: 'strawberry_seed', name: 'Strawberry Seed', type: 'seed', basePrice: 30, description: 'Grows in 3 days.' },
  grape_seed: { id: 'grape_seed', name: 'Grape Seed', type: 'seed', basePrice: 45, description: 'Grows in 5 days.' },
  melon_seed: { id: 'melon_seed', name: 'Melon Seed', type: 'seed', basePrice: 50, description: 'Grows in 6 days.' },
  pepper_seed: { id: 'pepper_seed', name: 'Pepper Seed', type: 'seed', basePrice: 25, description: 'Grows in 4 days.' },
  onion_seed: { id: 'onion_seed', name: 'Onion Seed', type: 'seed', basePrice: 12, description: 'Grows in 3 days.' },

  wheat: { id: 'wheat', name: 'Wheat', type: 'crop', basePrice: 25, description: 'Versatile grain.' },
  corn: { id: 'corn', name: 'Corn', type: 'crop', basePrice: 35, description: 'Sweet and starchy.' },
  tomato: { id: 'tomato', name: 'Tomato', type: 'crop', basePrice: 50, description: 'Juicy red fruit.' },
  potato: { id: 'potato', name: 'Potato', type: 'crop', basePrice: 60, description: 'Hearty tuber.' },
  carrot: { id: 'carrot', name: 'Carrot', type: 'crop', basePrice: 40, description: 'Crunchy.' },
  cabbage: { id: 'cabbage', name: 'Cabbage', type: 'crop', basePrice: 45, description: 'Leafy green.' },
  pumpkin: { id: 'pumpkin', name: 'Pumpkin', type: 'crop', basePrice: 120, description: 'Festive gourd.' },
  strawberry: { id: 'strawberry', name: 'Strawberry', type: 'crop', basePrice: 80, description: 'Sweet berry.' },
  grape: { id: 'grape', name: 'Grape', type: 'crop', basePrice: 110, description: 'Vine fruit.' },
  melon: { id: 'melon', name: 'Melon', type: 'crop', basePrice: 150, description: 'Large sweet fruit.' },
  pepper: { id: 'pepper', name: 'Pepper', type: 'crop', basePrice: 65, description: 'Spicy.' },
  onion: { id: 'onion', name: 'Onion', type: 'crop', basePrice: 30, description: 'Pungent bulb.' },

  wood: { id: 'wood', name: 'Wood', type: 'resource', basePrice: 15, description: 'Building material.' },
  stone: { id: 'stone', name: 'Stone', type: 'resource', basePrice: 20, description: 'Sturdy material.' },
  flour: { id: 'flour', name: 'Flour', type: 'artisan', basePrice: 55, description: 'Milled wheat.' },
  ale: { id: 'ale', name: 'Ale', type: 'artisan', basePrice: 100, description: 'Brewed beverage.' },
};

export const CROPS: Partial<Record<ItemId, CropData>> = {
  wheat_seed: { seedId: 'wheat_seed', cropId: 'wheat', growTime: 2, yield: [1, 2], seasons: ['Spring', 'Summer', 'Fall'] },
  corn_seed: { seedId: 'corn_seed', cropId: 'corn', growTime: 3, yield: [1, 3], seasons: ['Summer', 'Fall'] },
  tomato_seed: { seedId: 'tomato_seed', cropId: 'tomato', growTime: 4, yield: [2, 4], seasons: ['Summer'] },
  potato_seed: { seedId: 'potato_seed', cropId: 'potato', growTime: 3, yield: [2, 3], seasons: ['Spring', 'Summer', 'Fall'] },
  carrot_seed: { seedId: 'carrot_seed', cropId: 'carrot', growTime: 3, yield: [1, 3], seasons: ['Spring', 'Fall'] },
  cabbage_seed: { seedId: 'cabbage_seed', cropId: 'cabbage', growTime: 4, yield: [1, 2], seasons: ['Spring', 'Fall'] },
  pumpkin_seed: { seedId: 'pumpkin_seed', cropId: 'pumpkin', growTime: 5, yield: [1, 1], seasons: ['Fall'] },
  strawberry_seed: { seedId: 'strawberry_seed', cropId: 'strawberry', growTime: 3, yield: [2, 5], seasons: ['Spring'] },
  grape_seed: { seedId: 'grape_seed', cropId: 'grape', growTime: 5, yield: [2, 4], seasons: ['Summer', 'Fall'] },
  melon_seed: { seedId: 'melon_seed', cropId: 'melon', growTime: 6, yield: [1, 2], seasons: ['Summer'] },
  pepper_seed: { seedId: 'pepper_seed', cropId: 'pepper', growTime: 4, yield: [1, 3], seasons: ['Summer', 'Fall'] },
  onion_seed: { seedId: 'onion_seed', cropId: 'onion', growTime: 3, yield: [1, 4], seasons: ['Spring', 'Summer', 'Fall'] },
};

export const BUILDINGS: Record<string, Building> = {
  barn: { id: 'barn', name: 'Barn', description: 'Expands your farm by unlocking 5 more plots.', cost: { money: 1000, items: { wood: 50, stone: 20 } }, effect: 'plots_5' },
  windmill: { id: 'windmill', name: 'Windmill', description: 'Automatically mills wheat into flour overnight.', cost: { money: 1500, items: { wood: 100, stone: 50 } }, effect: 'mill' },
  market_stall: { id: 'market_stall', name: 'Market Stall', description: 'Gain daily reputation and slightly better Mandi trade prices.', cost: { money: 1200, items: { wood: 80 } }, effect: 'rep' },
  inn: { id: 'inn', name: 'The Inn', description: 'Attracts the Traveling Merchant with rare items.', cost: { money: 2500, items: { wood: 150, stone: 100 } }, effect: 'merchant' },
  trade_guild: { id: 'trade_guild', name: 'Trade Guild', description: 'Allows two extra trade orders per day from villagers.', cost: { money: 3000, items: { stone: 200 } }, effect: 'extra_trades' },
  brewery: { id: 'brewery', name: 'Brewery', description: 'Automatically crafts ale from wheat overnight.', cost: { money: 4000, items: { wood: 100, stone: 150 } }, effect: 'brew' },
};

export const VILLAGERS: Record<string, VillagerDef> = {
  barnaby: { id: 'barnaby', name: 'Barnaby', role: 'Farmer', description: 'Loves basic crops.', icon: 'Tractor', preferences: { likes: ['wheat', 'corn', 'potato'], dislikes: ['ale', 'flour'] }, baseGold: 500 },
  elara: { id: 'elara', name: 'Elara', role: 'Baker', description: 'Bakes sweet goods.', icon: 'Croissant', preferences: { likes: ['flour', 'strawberry'], dislikes: ['stone', 'wood'] }, baseGold: 800 },
  garrick: { id: 'garrick', name: 'Garrick', role: 'Merchant', description: 'A shrewd trader.', icon: 'Coins', preferences: { likes: ['ale', 'pumpkin', 'melon', 'wood'], dislikes: [] }, baseGold: 2000 },
  thorin: { id: 'thorin', name: 'Thorin', role: 'Builder', description: 'Sturdy resources only.', icon: 'Hammer', preferences: { likes: ['wood', 'stone'], dislikes: ['tomato', 'strawberry'] }, baseGold: 1000 },
  silas: { id: 'silas', name: 'Silas', role: 'Brewer', description: 'Always thirsty.', icon: 'Beer', preferences: { likes: ['wheat', 'ale'], dislikes: ['carrot', 'stone'] }, baseGold: 700 },
  kael: { id: 'kael', name: 'Kael', role: 'Traveler', description: 'Follows the wind.', icon: 'Map', preferences: { likes: ['melon', 'pumpkin'], dislikes: ['wheat', 'corn'] }, baseGold: 1200 },
  lyra: { id: 'lyra', name: 'Lyra', role: 'Forager', description: 'Appreciates nature.', icon: 'Leaf', preferences: { likes: ['strawberry', 'grape'], dislikes: ['stone'] }, baseGold: 400 },
  rowan: { id: 'rowan', name: 'Rowan', role: 'Guard', description: 'Keeps the peace.', icon: 'Shield', preferences: { likes: ['potato', 'onion'], dislikes: ['strawberry'] }, baseGold: 600 },
  finn: { id: 'finn', name: 'Finn', role: 'Fisher', description: 'Smells like the sea.', icon: 'Anchor', preferences: { likes: ['carrot', 'cabbage'], dislikes: ['flour', 'ale'] }, baseGold: 500 },
  hazel: { id: 'hazel', name: 'Hazel', role: 'Elder', description: 'Wise and cautious.', icon: 'Book', preferences: { likes: ['cabbage', 'pumpkin'], dislikes: ['ale'] }, baseGold: 1100 },
  cedric: { id: 'cedric', name: 'Cedric', role: 'Noble', description: 'Rich and picky.', icon: 'Crown', preferences: { likes: ['grape', 'melon', 'ale'], dislikes: ['wood', 'stone', 'wheat', 'potato'] }, baseGold: 4000 },
  beatrice: { id: 'beatrice', name: 'Beatrice', role: 'Doctor', description: 'Heals the sick.', icon: 'Cross', preferences: { likes: ['tomato', 'pepper', 'onion'], dislikes: ['ale'] }, baseGold: 900 },
};

export const EVENTS: GameEvent[] = [
  { id: 'drought', name: 'Drought', description: 'Crops struggle. Water is scarce.', duration: 3, priceMultipliers: { wheat: 2.0, corn: 2.0, melon: 3.0 } },
  { id: 'trade_boom', name: 'Trade Boom', description: 'Merchants are paying extra for everything!', duration: 2, priceMultipliers: {} }, // Fixed 1.25x modifier in code
  { id: 'crop_blight', name: 'Crop Blight', description: 'Vegetable yields globally plummet.', duration: 3, priceMultipliers: { potato: 2.5, tomato: 2.5, carrot: 2.5 } },
  { id: 'harvest_festival', name: 'Harvest Festival', description: 'Pumpkins and ales are selling fast!', duration: 3, priceMultipliers: { pumpkin: 3.0, ale: 2.5, flour: 2.0 } },
  { id: 'surplus', name: 'Massive Surplus', description: 'Too much food! Regional markets crash.', duration: 2, priceMultipliers: { wheat: 0.5, corn: 0.5, potato: 0.5, tomato: 0.6 } },
  { id: 'price_surge', name: 'Hyper Price Surge', description: 'Inflation strikes hard temporarily.', duration: 2, priceMultipliers: {} }, // Handled via inflation temporary spike
  { id: 'builder_craze', name: 'Builder Craze', description: 'Massive construction occurring locally.', duration: 3, priceMultipliers: { wood: 3.0, stone: 3.0 } },
  { id: 'royal_visit', name: 'Royal Visit', description: 'Luxury items are in extreme demand.', duration: 2, priceMultipliers: { grape: 3.0, melon: 3.0, ale: 4.0, strawberry: 2.0 } },
];

export const PARTIES: PoliticalParty[] = [
  { id: 'agrarian_union', name: 'Agrarian Union', leader: 'Barnaby', mandate: 'Subsidize seeds and protect farmers in the Mandi.', law: 'subsidize_seeds', color: 'bg-emerald-600' },
  { id: 'free_market', name: 'Free Market Coalition', leader: 'Garrick', mandate: 'Abolish the Mandi system. Decentralize trading completely.', law: 'abolish_mandi', color: 'bg-indigo-600' },
  { id: 'workers_party', name: 'Workers Party', leader: 'Thorin', mandate: 'Subsidize buildings using state funds. Strict price controls.', law: 'price_controls', color: 'bg-rose-600' },
];
