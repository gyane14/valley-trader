import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ITEMS } from '../data/gameData';
import { ItemId } from '../types';
import { TrendingUp, TrendingDown, Minus, ArrowRightLeft, PackageCheck } from 'lucide-react';

export default function MarketView() {
  const { state, dispatch } = useGame();
  const [tradeAmount, setTradeAmount] = useState<number>(1);
  const [ticker, setTicker] = useState(0);

  // Force re-render periodically to show live price updates
  useEffect(() => {
     const i = setInterval(() => setTicker(t => t + 1), 1000);
     return () => clearInterval(i);
  }, []);

  const handleBuy = (itemId: ItemId) => {
    dispatch({ type: 'BUY_ITEM', payload: { itemId, amount: tradeAmount } });
  };

  const handleSell = (itemId: ItemId) => {
    dispatch({ type: 'SELL_ITEM', payload: { itemId, amount: tradeAmount } });
  };

  const isMandiClosed = state.activeLaw === 'abolish_mandi';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Town Mandi (Market)</h2>
          <p className="text-neutral-600 mt-2">Prices tick constantly based on supply and demand. Trade carefully!</p>
        </div>
        
        {/* Trade Amount Selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-sm font-medium text-neutral-500 pl-2">Amount:</span>
          <div className="flex items-center gap-1">
             {[1, 5, 10, 50, 100].map((amt) => (
                <button
                  key={amt}
                  disabled={isMandiClosed}
                  onClick={() => setTradeAmount(amt)}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                     isMandiClosed ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' :
                     tradeAmount === amt ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  x{amt}
                </button>
             ))}
          </div>
        </div>
      </div>

      {isMandiClosed ? (
         <div className="bg-rose-50 border border-rose-200 rounded-xl p-12 text-center text-rose-800">
            <h3 className="text-2xl font-bold mb-2">The Mandi is CLOSED</h3>
            <p>The current government has abolished the central market. You must trade directly with Villagers from the Village tab.</p>
         </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-sm font-bold text-neutral-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Item</th>
                <th className="p-4">Market Price</th>
                <th className="p-4">Trend</th>
                <th className="p-4">Local Supply</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(Object.keys(ITEMS) as ItemId[]).map((itemId) => {
                const item = ITEMS[itemId];
                const price = state.marketPrices[itemId];
                const trend = state.marketTrends[itemId];
                
                let seedCost = price;
                if (state.activeLaw === 'subsidize_seeds' && item.type === 'seed') seedCost = Math.floor(price * 0.6);

                const isBasePrice = price === item.basePrice;
                const priceDiffStr = !isBasePrice 
                  ? price > item.basePrice 
                     ? `+${Math.round(((price / item.basePrice) - 1) * 100)}%`
                     : `${Math.round(((price / item.basePrice) - 1) * 100)}%`
                  : 'Base';
                const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-neutral-400';
                
                const currentInv = state.inventory[itemId] || 0;
                const canBuy = state.money >= seedCost * tradeAmount;
                const canSell = currentInv >= tradeAmount;
                const supplyDemand = state.supplyDemand[itemId] || 0;
                
                let demandMsg = 'Stable';
                if (supplyDemand > 5) demandMsg = 'High Shortage';
                else if (supplyDemand > 1) demandMsg = 'Demand Up';
                else if (supplyDemand < -5) demandMsg = 'Excess Supply';
                else if (supplyDemand < -1) demandMsg = 'Overstocked';

                return (
                  <tr key={itemId} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                         <div className="flex-1">
                            <div className="font-bold text-neutral-900 flex items-center gap-2">
                               {item.name}
                               <span className="capitalize text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md">
                                 {item.type}
                               </span>
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">{item.description}</div>
                         </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-lg font-bold text-amber-600">{price}g</span>
                        {!isBasePrice && (
                           <span className={`text-[10px] font-bold ${price > item.basePrice ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'} px-2 py-0.5 rounded`}>
                             {priceDiffStr}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                       <div className={`flex flex-col`}>
                          <div className={`flex items-center gap-1 font-bold ${trendColor}`}>
                             {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                             {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                             {trend === 'stable' && <Minus className="w-4 h-4" />}
                             <span className="capitalize text-sm">{trend}</span>
                          </div>
                          <span className={`text-[10px] tracking-wider uppercase font-bold mt-1 ${supplyDemand > 1 ? 'text-rose-500' : supplyDemand < -1 ? 'text-indigo-500' : 'text-neutral-400'}`}>
                             {demandMsg}
                          </span>
                       </div>
                    </td>
                    <td className="p-4 text-neutral-600 font-mono">
                       {currentInv > 0 ? (
                          <span className="font-bold text-neutral-900">{currentInv}</span>
                       ) : '-'}
                    </td>
                    <td className="p-4 pr-6">
                       <div className="flex justify-end gap-2 flex-col sm:flex-row">
                          {item.type === 'seed' || item.type === 'resource' ? (
                             <button
                               onClick={() => handleBuy(itemId)}
                               disabled={!canBuy}
                               className={`px-4 py-2 rounded-md font-bold text-sm transition-colors relative ${
                                  canBuy ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                               }`}
                             >
                               Buy {tradeAmount}
                               {state.activeLaw === 'subsidize_seeds' && item.type === 'seed' && canBuy && (
                                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] px-1.5 rounded-full z-10">
                                     Subsidized
                                  </span>
                               )}
                             </button>
                          ) : null}
                          
                          {item.type !== 'seed' ? (
                             <button
                               onClick={() => handleSell(itemId)}
                               disabled={!canSell}
                               className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${
                                  canSell ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                               }`}
                             >
                               Sell {tradeAmount}
                             </button>
                          ) : null}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}