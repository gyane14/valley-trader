import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, ItemId, Plot, TradeOrder, GameEvent, Season, Weather } from '../types';
import { ITEMS, CROPS, BUILDINGS, VILLAGERS, EVENTS, PARTIES } from '../data/gameData';

const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateInitialMarket = () => {
  const prices: Record<ItemId, number> = {} as any;
  const trends: Record<ItemId, 'up' | 'down' | 'stable'> = {} as any;
  (Object.keys(ITEMS) as ItemId[]).forEach((id) => {
    prices[id] = ITEMS[id].basePrice;
    trends[id] = 'stable';
  });
  return { prices, trends };
};

const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];

// Generates an initial state for new games
const initialState: GameState = {
  day: 1,
  season: 'Spring',
  weather: 'Sunny',
  money: 500,
  energy: 15,
  maxEnergy: 15,
  reputation: 0,
  inflation: 1.0,
  inventory: { wheat_seed: 5, wood: 20 },
  plots: Array.from({ length: 20 }).map((_, i) => ({ id: `plot_${i}`, isUnlocked: i < 10, plantedCrop: null, daysPlanted: 0 })),
  marketPrices: generateInitialMarket().prices,
  marketTrends: generateInitialMarket().trends,
  supplyDemand: {},
  activeOrders: [],
  travelingMerchant: null,
  activeEventId: null,
  eventDaysLeft: 0,
  unlockedBuildings: [],
  logs: ['Welcome to Valley Trader! Plant some crops to get started.'],
  
  // Politics defaults
  currentPartyId: 'agrarian_union',
  activeLaw: 'subsidize_seeds',
  daysUntilElection: 14,
  playerVote: null,

  villagers: Object.fromEntries(Object.keys(VILLAGERS).map(v => [v, { mood: 'neutral', gold: VILLAGERS[v].baseGold }])),
};

type GameAction =
  | { type: 'PLANT_CROP'; payload: { plotId: string; seedId: ItemId } }
  | { type: 'HARVEST_CROP'; payload: { plotId: string } }
  | { type: 'END_DAY' }
  | { type: 'BUY_ITEM'; payload: { itemId: ItemId; amount: number } }
  | { type: 'SELL_ITEM'; payload: { itemId: ItemId; amount: number } }
  | { type: 'NEGOTIATE_ORDER'; payload: { orderId: string; proposedAmount: number } }
  | { type: 'ACCEPT_ORDER'; payload: { orderId: string } }
  | { type: 'BUILD_BUILDING'; payload: { buildingId: string } }
  | { type: 'VOTE_PARTY'; payload: { partyId: string } }
  | { type: 'MARKET_TICK' }
  | { type: 'RESET_GAME' };

const addLog = (logs: string[], message: string) => [message, ...logs.slice(0, 49)];

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MARKET_TICK': {
      if (state.activeLaw === 'price_controls') {
         // Prices move much slower under price controls
         if (Math.random() > 0.2) return state; 
      }

      const activeEvent = state.activeEventId ? EVENTS.find((e) => e.id === state.activeEventId) : null;
      const newPrices: Record<ItemId, number> = { ...state.marketPrices };
      const newTrends: Record<ItemId, 'up' | 'down' | 'stable'> = { ...state.marketTrends };
      const newSupplyDemand = { ...state.supplyDemand };

      (Object.keys(ITEMS) as ItemId[]).forEach((id) => {
        let base = ITEMS[id].basePrice * state.inflation;
        if (activeEvent && activeEvent.priceMultipliers[id]) {
          base *= activeEvent.priceMultipliers[id]!;
        }
        
        // Supply demand drift
        const sd = state.supplyDemand[id] || 0;
        // high positive demand -> price goes up. negative means supply dumping -> price goes down
        const sdModifier = 1 + (sd * 0.05); 
        base = base * Math.max(0.2, sdModifier);

        const currentPrice = state.marketPrices[id];
        // Mean reversion bounds
        const minPrice = Math.max(1, Math.floor(base * 0.7));
        const maxPrice = Math.max(2, Math.floor(base * 1.5));
        
        let newPrice = currentPrice;
        
        // Random walk
        const changeStr = Math.random();
        // Tendency to revert to base
        if (currentPrice > base && changeStr > 0.4) newPrice -= Math.max(1, Math.floor(base * 0.02));
        else if (currentPrice < base && changeStr > 0.4) newPrice += Math.max(1, Math.floor(base * 0.02));
        else if (changeStr > 0.8) newPrice += Math.max(1, Math.floor(base * 0.03));
        else if (changeStr < 0.2) newPrice -= Math.max(1, Math.floor(base * 0.03));
        
        if (newPrice < minPrice) newPrice = minPrice;
        if (newPrice > maxPrice) newPrice = maxPrice;

        newPrices[id] = Math.floor(newPrice);
        if (newPrice > currentPrice) newTrends[id] = 'up';
        else if (newPrice < currentPrice) newTrends[id] = 'down';
        else newTrends[id] = 'stable';
        
        // Decay supply/demand slowly towards 0
        if (sd > 0) newSupplyDemand[id] = sd - 0.1;
        else if (sd < 0) newSupplyDemand[id] = sd + 0.1;
        if (Math.abs(newSupplyDemand[id]) < 0.2) newSupplyDemand[id] = 0;
      });

      return {
        ...state,
        marketPrices: newPrices,
        marketTrends: newTrends,
        supplyDemand: newSupplyDemand,
      };
    }

    case 'PLANT_CROP': {
      const { plotId, seedId } = action.payload;
      const cropData = CROPS[seedId];
      if (!cropData) return state;

      if (!cropData.seasons.includes(state.season)) {
         return {
            ...state,
            logs: addLog(state.logs, `Cannot plant ${ITEMS[seedId].name} in ${state.season}.`),
         };
      }

      if (state.energy < 1) return state;
      const currentSeedAmount = state.inventory[seedId] || 0;
      if (currentSeedAmount <= 0) return state;

      return {
        ...state,
        energy: state.energy - 1,
        inventory: { ...state.inventory, [seedId]: currentSeedAmount - 1 },
        plots: state.plots.map((p) =>
          p.id === plotId ? { ...p, plantedCrop: seedId, daysPlanted: 0, watered: state.weather === 'Rainy' || state.weather === 'Storm' } : p
        ),
      };
    }

    case 'HARVEST_CROP': {
      const { plotId } = action.payload;
      if (state.energy < 1) return state;

      const plot = state.plots.find((p) => p.id === plotId);
      if (!plot || !plot.plantedCrop) return state;

      const cropData = CROPS[plot.plantedCrop];
      if (!cropData || plot.daysPlanted! < cropData.growTime) return state;

      let yieldAmount = randomRange(cropData.yield[0], cropData.yield[1]);
      if (state.weather === 'Drought') yieldAmount = Math.max(1, yieldAmount - 1);
      
      const currentCropAmount = state.inventory[cropData.cropId] || 0;

      return {
        ...state,
        energy: state.energy - 1,
        inventory: { ...state.inventory, [cropData.cropId]: currentCropAmount + yieldAmount },
        plots: state.plots.map((p) =>
          p.id === plotId ? { ...p, plantedCrop: null, daysPlanted: 0, watered: false } : p
        ),
        logs: addLog(state.logs, `Harvested ${yieldAmount} ${ITEMS[cropData.cropId].name}!`),
        reputation: state.reputation + 1,
      };
    }

    case 'BUY_ITEM': {
      const { itemId, amount } = action.payload;
      if (state.activeLaw === 'abolish_mandi') return state; // Market is closed

      let cost = state.marketPrices[itemId] * amount;
      
      // Subsidy checks
      if (state.activeLaw === 'subsidize_seeds' && ITEMS[itemId].type === 'seed') {
         cost = Math.floor(cost * 0.6); // 40% discount on seeds
      }

      if (state.money < cost) return state;

      const currentAmount = state.inventory[itemId] || 0;
      return {
        ...state,
        money: state.money - cost,
        inventory: { ...state.inventory, [itemId]: currentAmount + amount },
        supplyDemand: { ...state.supplyDemand, [itemId]: (state.supplyDemand[itemId] || 0) + (amount * 0.2) }, // buying increases demand
        logs: addLog(state.logs, `Bought ${amount} ${ITEMS[itemId].name} for ${cost} gold.`),
      };
    }

    case 'SELL_ITEM': {
      const { itemId, amount } = action.payload;
      if (state.activeLaw === 'abolish_mandi') return state; // Market is closed

      const currentAmount = state.inventory[itemId] || 0;
      if (currentAmount < amount) return state;

      const revenue = state.marketPrices[itemId] * amount;
      return {
        ...state,
        money: state.money + revenue,
        inventory: { ...state.inventory, [itemId]: currentAmount - amount },
        supplyDemand: { ...state.supplyDemand, [itemId]: (state.supplyDemand[itemId] || 0) - (amount * 0.5) }, // selling increases supply (negative demand)
        logs: addLog(state.logs, `Sold ${amount} ${ITEMS[itemId].name} for ${revenue} gold.`),
      };
    }

    case 'ACCEPT_ORDER': {
       const { orderId } = action.payload;
       const order = state.activeOrders.find((o) => o.id === orderId);
       let isTravelingMerch = false;
       let actualOrder = order;

       // Check traveling merchant list if not found
       if (!order && state.travelingMerchant) {
          actualOrder = state.travelingMerchant.find(o => o.id === orderId);
          isTravelingMerch = !!actualOrder;
       }

       if (!actualOrder) return state;

       const villagerId = actualOrder.villagerId;
       const villagerState = state.villagers[villagerId] || { mood: 'neutral', gold: 9999 };

       if (actualOrder.type === 'buy') {
          // Villager is buying FROM user
          const currentInv = state.inventory[actualOrder.reqItemId] || 0;
          if (currentInv < actualOrder.reqAmount) return state;
          
          let updatedOrders = state.activeOrders.filter(o => o.id !== orderId);
          let updatedTraveling = state.travelingMerchant;
          if (isTravelingMerch) {
             updatedTraveling = updatedTraveling?.filter(o => o.id !== orderId) || null;
          }

          return {
             ...state,
             money: state.money + actualOrder.offerMoney,
             inventory: { ...state.inventory, [actualOrder.reqItemId]: currentInv - actualOrder.reqAmount },
             activeOrders: updatedOrders,
             travelingMerchant: updatedTraveling,
             reputation: state.reputation + 2,
             villagers: { ...state.villagers, [villagerId]: { ...villagerState, gold: villagerState.gold - actualOrder.offerMoney, mood: 'happy' } },
             logs: addLog(state.logs, `Completed trade with ${VILLAGERS[villagerId]?.name || 'Merchant'} for ${actualOrder.offerMoney}g.`),
          };
       } else {
          // Villager is selling TO user
          if (state.money < actualOrder.offerMoney) return state;
          
          const currentInv = state.inventory[actualOrder.reqItemId] || 0;
          let updatedOrders = state.activeOrders.filter(o => o.id !== orderId);
          let updatedTraveling = state.travelingMerchant;
          if (isTravelingMerch) {
             updatedTraveling = updatedTraveling?.filter(o => o.id !== orderId) || null;
          }

          return {
             ...state,
             money: state.money - actualOrder.offerMoney,
             inventory: { ...state.inventory, [actualOrder.reqItemId]: currentInv + actualOrder.reqAmount },
             activeOrders: updatedOrders,
             travelingMerchant: updatedTraveling,
             villagers: { ...state.villagers, [villagerId]: { ...villagerState, gold: villagerState.gold + actualOrder.offerMoney, mood: 'happy' } },
             logs: addLog(state.logs, `Bought items from ${VILLAGERS[villagerId]?.name || 'Merchant'} for ${actualOrder.offerMoney}g.`),
          };
       }
    }

    case 'NEGOTIATE_ORDER': {
       const { orderId, proposedAmount } = action.payload;
       let orderIndex = state.activeOrders.findIndex(o => o.id === orderId);
       let isTravelingMerch = false;
       let targetList = [...state.activeOrders];

       if (orderIndex === -1 && state.travelingMerchant) {
          orderIndex = state.travelingMerchant.findIndex(o => o.id === orderId);
          isTravelingMerch = true;
          targetList = [...state.travelingMerchant];
       }

       if (orderIndex === -1) return state;
       
       const order = targetList[orderIndex];
       if (order.negotiationTries <= 0) return state;

       const villagerId = order.villagerId;
       const vDef = VILLAGERS[villagerId];
       const vState = state.villagers[villagerId] || { mood: 'neutral', gold: 999 };

       // Negotiation logic
       // If user wants more money from user-selling, or wants to pay less for user-buying.
       const isPushing = order.type === 'buy' ? proposedAmount > order.offerMoney : proposedAmount < order.offerMoney;
       const diffRatio = Math.abs(proposedAmount - order.offerMoney) / order.offerMoney;
       
       let chanceToAccept = 1.0 - (diffRatio * 2);
       if (vState.mood === 'happy') chanceToAccept += 0.2;
       if (vState.mood === 'annoyed' || vState.mood === 'angry') chanceToAccept -= 0.3;
       if (vDef?.role === 'Merchant') chanceToAccept -= 0.1; // Harder to bargain with merchants

       let newMood = vState.mood;
       let newLogs = [...state.logs];

       if (Math.random() < chanceToAccept) {
          // Success
          targetList[orderIndex] = { ...order, offerMoney: proposedAmount };
          newLogs = addLog(newLogs, `Negotiation successful! Agreed on ${proposedAmount}g.`);
       } else {
          // Fail
          targetList[orderIndex] = { ...order, negotiationTries: order.negotiationTries - 1 };
          newMood = 'annoyed';
          newLogs = addLog(newLogs, `Negotiation failed. They look annoyed. (${targetList[orderIndex].negotiationTries} tries left)`);
          
          if (targetList[orderIndex].negotiationTries <= 0) {
             targetList.splice(orderIndex, 1);
             newMood = 'angry';
             newLogs = addLog(newLogs, `They walked away from the deal!`);
          }
       }

       return {
          ...state,
          activeOrders: isTravelingMerch ? state.activeOrders : targetList,
          travelingMerchant: isTravelingMerch ? targetList : state.travelingMerchant,
          villagers: { ...state.villagers, [villagerId]: { ...vState, mood: newMood as any } },
          logs: newLogs,
       };
    }

    case 'BUILD_BUILDING': {
      const { buildingId } = action.payload;
      const building = BUILDINGS[buildingId];
      if (!building || state.unlockedBuildings.includes(buildingId)) return state;

      let goldCost = building.cost.money;
      if (state.activeLaw === 'subsidize_buildings') goldCost = Math.floor(goldCost * 0.85);

      if (state.money < goldCost) return state;
      for (const [itemId, amount] of Object.entries(building.cost.items || {})) {
        if ((state.inventory[itemId as ItemId] || 0) < amount) return state;
      }

      const newInventory = { ...state.inventory };
      for (const [itemId, amount] of Object.entries(building.cost.items || {})) {
         newInventory[itemId as ItemId] = (newInventory[itemId as ItemId] || 0) - amount;
      }

      let newPlots = [...state.plots];
      if (building.effect === 'plots_5') {
         // Unlock next 5 plots
         let unlocked = 0;
         newPlots = newPlots.map(p => {
            if (!p.isUnlocked && unlocked < 5) {
               unlocked++;
               return { ...p, isUnlocked: true };
            }
            return p;
         });
      }

      const repGain = buildingId === 'market_stall' ? 10 : 5;

      return {
        ...state,
        money: state.money - goldCost,
        inventory: newInventory,
        unlockedBuildings: [...state.unlockedBuildings, buildingId],
        plots: newPlots,
        reputation: state.reputation + repGain,
        logs: addLog(state.logs, `Constructed ${building.name}!`),
      };
    }

    case 'VOTE_PARTY': {
       return { ...state, playerVote: action.payload.partyId };
    }

    case 'END_DAY': {
      let newLogs = [...state.logs];
      const newInventory = { ...state.inventory };
      let newMoney = state.money;
      let newReputation = state.reputation;

      // 1. Process Plots
      let deadCrops = 0;
      const newPlots = state.plots.map((p) => {
        if (p.plantedCrop && p.isUnlocked) {
          const cropData = CROPS[p.plantedCrop];
          // Check season passing
          if (cropData && !cropData.seasons.includes(state.season)) {
             deadCrops++;
             return { ...p, plantedCrop: null, daysPlanted: 0 };
          }
          let growthAdd = 1;
          if (state.weather === 'Rainy' || p.watered) growthAdd += 0.2; // slight buff
          if (state.weather === 'Drought') growthAdd = 0; // stunt growth
          return { ...p, daysPlanted: Math.min((p.daysPlanted || 0) + growthAdd, 99), watered: false };
        }
        return p;
      });
      if (deadCrops > 0) newLogs = addLog(newLogs, `${deadCrops} crops withered due to season/weather changes.`);

      // 2. Passive Buildings
      if (state.unlockedBuildings.includes('windmill')) {
         if ((newInventory.wheat || 0) >= 2) {
            newInventory.wheat = newInventory.wheat! - 2;
            newInventory.flour = (newInventory.flour || 0) + 1;
         }
      }
      if (state.unlockedBuildings.includes('brewery')) {
         if ((newInventory.wheat || 0) >= 3) {
            newInventory.wheat = newInventory.wheat! - 3;
            newInventory.ale = (newInventory.ale || 0) + 1;
         }
      }
      if (state.unlockedBuildings.includes('market_stall')) {
         newReputation += 1;
         newMoney += 20; // daily drip
      }

      // 3. Elections & Laws
      let newDaysUntilElection = state.daysUntilElection - 1;
      let newParty = state.currentPartyId;
      let newLaw = state.activeLaw;

      if (newDaysUntilElection <= 0) {
         // Election Time!
         const parties = PARTIES.map(p => p.id);
         let winner = state.playerVote || parties[Math.floor(Math.random() * parties.length)];
         
         // If rep is high, player vote counts absolutely.
         if (state.playerVote && state.reputation > 50) winner = state.playerVote; 
         else if (!state.playerVote) winner = parties[Math.floor(Math.random() * parties.length)];
         
         newParty = winner;
         newLaw = PARTIES.find(p => p.id === winner)?.law || 'none';
         newDaysUntilElection = 14;
         newLogs = addLog(newLogs, `Election complete! ${PARTIES.find(p=>p.id===winner)?.name} has formed the government.`);
      }

      // 4. Seasons & Weather
      let nextDayWeather = state.weather;
      let nextSeason = state.season;
      
      const r = Math.random();
      if (r < 0.2) nextDayWeather = 'Rainy';
      else if (r < 0.4) nextDayWeather = 'Cloudy';
      else if (r < 0.5) nextDayWeather = 'Drought';
      else if (r < 0.55 && state.season === 'Summer') nextDayWeather = 'Storm';
      else nextDayWeather = 'Sunny';

      if (state.day % 7 === 0) {
         const idx = SEASONS.indexOf(state.season);
         nextSeason = SEASONS[(idx + 1) % SEASONS.length];
         newLogs = addLog(newLogs, `Season changed to ${nextSeason}!`);
      }

      // 5. Events
      let newActiveEventId = state.activeEventId;
      let newEventDaysLeft = state.eventDaysLeft - 1;
      let newInflation = state.inflation + 0.01; // creep

      if (newEventDaysLeft <= 0) {
        if (newActiveEventId) {
          newLogs = addLog(newLogs, `The ${EVENTS.find(e => e.id === newActiveEventId)?.name} event has ended.`);
        }
        newActiveEventId = null;
        newEventDaysLeft = 0;
        
        if (Math.random() < 0.15) {
          const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
          newActiveEventId = event.id;
          newEventDaysLeft = event.duration;
          if (event.id === 'price_surge') newInflation += 0.5;
          newLogs = addLog(newLogs, `EVENT: ${event.name}! ${event.description}`);
        }
      }

      // 6. Villager Orders (Village Board)
      let tradeOrdersAllowed = state.unlockedBuildings.includes('trade_guild') ? 4 : 2;
      let newOrders = state.activeOrders.map(o => ({ ...o, expiresIn: o.expiresIn - 1 })).filter(o => o.expiresIn > 0);
      
      if (newOrders.length < tradeOrdersAllowed) {
         for (let i=0; i<tradeOrdersAllowed - newOrders.length; i++) {
            if (Math.random() > 0.4) {
               const vId = Object.keys(VILLAGERS)[Math.floor(Math.random() * Object.keys(VILLAGERS).length)];
               const vPref = VILLAGERS[vId].preferences;
               const prefItem = (Math.random() > 0.5 && vPref.likes.length > 0) ? vPref.likes[Math.floor(Math.random() * vPref.likes.length)] : null;
               
               const itemIds = Object.keys(ITEMS) as ItemId[];
               let reqItem = prefItem || itemIds[Math.floor(Math.random() * itemIds.length)];
               
               const type = Math.random() > 0.5 ? 'buy' : 'sell'; // buy = villager buying from player
               const base = ITEMS[reqItem].basePrice;
               const reqAmount = randomRange(2, 10);
               
               let lawMultiplier = 1.0;
               if (state.activeLaw === 'abolish_mandi') lawMultiplier = 1.5;

               let offerMoney = type === 'buy' 
                  ? Math.floor((base * reqAmount) * (1.2 + Math.random()) * lawMultiplier) 
                  : Math.floor((base * reqAmount) * (0.5 + Math.random() * 0.4) * lawMultiplier);

               newOrders.push({
                 id: `ord_${state.day}_${Math.random().toString(36).substr(2, 5)}`,
                 villagerId: vId,
                 type: type,
                 reqItemId: reqItem,
                 reqAmount,
                 offerMoney,
                 expiresIn: randomRange(2, 4),
                 negotiationTries: 2,
               });
            }
         }
      }

      // 7. Traveling Merchant (if inn)
      let newMerchant = state.travelingMerchant;
      if (newMerchant) {
         newMerchant = newMerchant.map(o => ({ ...o, expiresIn: o.expiresIn - 1 })).filter(o => o.expiresIn > 0);
         if (newMerchant.length === 0) newMerchant = null;
      }
      if (!newMerchant && state.unlockedBuildings.includes('inn') && Math.random() > 0.7) {
         newLogs = addLog(newLogs, `A Traveling Merchant has arrived at the Inn!`);
         newMerchant = [{
            id: `merch_${state.day}`,
            villagerId: 'kael',
            type: 'sell',
            reqItemId: Math.random() > 0.5 ? 'melon_seed' : 'pumpkin_seed',
            reqAmount: randomRange(5, 10),
            offerMoney: 100,
            expiresIn: 1,
            negotiationTries: 1,
            isMerchant: true,
         }];
      }

      // 8. Restore moods slightly
      const newVillagers = { ...state.villagers };
      Object.keys(newVillagers).forEach(k => {
         if (newVillagers[k].mood === 'angry') newVillagers[k].mood = 'annoyed';
         else if (newVillagers[k].mood === 'annoyed') newVillagers[k].mood = 'neutral';
         
         // slowly regenerate gold
         newVillagers[k].gold = Math.min(newVillagers[k].gold + 50, VILLAGERS[k].baseGold * 2);
      });

      newLogs = addLog(newLogs, `--- Day ${state.day + 1} ---`);

      return {
        ...state,
        day: state.day + 1,
        season: nextSeason,
        weather: nextDayWeather,
        money: newMoney,
        reputation: newReputation,
        energy: state.maxEnergy,
        plots: newPlots,
        inventory: newInventory,
        activeEventId: newActiveEventId,
        eventDaysLeft: newEventDaysLeft,
        inflation: newInflation,
        daysUntilElection: newDaysUntilElection,
        currentPartyId: newParty,
        activeLaw: newLaw,
        activeOrders: newOrders,
        travelingMerchant: newMerchant,
        villagers: newVillagers,
        logs: newLogs,
      };
    }

    case 'RESET_GAME': {
      return initialState;
    }

    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    try {
      const local = localStorage.getItem('valley_trader_save');
      if (local) {
        return { ...initial, ...JSON.parse(local) }; // merge incase of schema update
      }
    } catch (e) {
      console.error('Failed to load save');
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('valley_trader_save', JSON.stringify(state));
  }, [state]);

  // Real-time market tick
  useEffect(() => {
    const int = setInterval(() => {
       dispatch({ type: 'MARKET_TICK' });
    }, 8000);
    return () => clearInterval(int);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
