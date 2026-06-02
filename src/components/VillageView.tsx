import React from 'react';
import { useGame } from '../context/GameContext';
import { VILLAGERS, ITEMS } from '../data/gameData';
import { Clock, CheckCircle } from 'lucide-react';

export default function VillageView() {
  const { state, dispatch } = useGame();

  const isTradeBoardUnlocked = state.unlockedBuildings.includes('trade_guild');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">The Village</h2>
        <p className="text-neutral-600 mt-2">Interact with locals and complete their specific trade requests.</p>
      </div>

      {!isTradeBoardUnlocked ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-amber-800">
          <h3 className="text-xl font-bold mb-2">Trade Board Not Unlocked</h3>
          <p>Construct the Village Trade Guild in the Buildings tab to start receiving special orders from villagers.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight text-neutral-800 border-b border-neutral-200 pb-2 flex items-center gap-2">
            Active Trade Orders
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Traveling Merchant Section */}
            {state.travelingMerchant && state.travelingMerchant.map((order) => {
               const villager = VILLAGERS[order.villagerId] || { name: 'Traveling Merchant', role: 'Merchant', icon: 'Map' };
               const reqItem = ITEMS[order.reqItemId];
               const currentInv = state.inventory[order.reqItemId] || 0;
               const canBuy = state.money >= order.offerMoney;

               return (
                 <div key={`merch_${order.id}`} className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl shadow-lg border-2 border-indigo-500 overflow-hidden flex flex-col text-white relative">
                   <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                     Rare Opportunity
                   </div>
                   <div className="p-4 border-b border-indigo-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                            TM
                         </div>
                         <div>
                            <div className="font-bold text-indigo-50 leading-tight">Traveling Merchant</div>
                            <div className="text-[10px] text-indigo-300 uppercase tracking-wider">At the Inn</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-200 bg-indigo-800/50 px-2 py-1 rounded-md">
                         <Clock className="w-3 h-3" />
                         Left today
                      </div>
                   </div>
                   
                   <div className="p-5 flex-1 flex flex-col justify-center text-center space-y-4 relative z-10">
                      <p className="text-indigo-200 italic text-sm">
                         "I've traveled far. I sell rare seeds, if you have the coin."
                      </p>
                      
                      <div className="bg-indigo-950/40 p-4 rounded-lg flex justify-around items-center border border-indigo-700/50">
                         <div>
                            <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold mb-1">Buy Price</div>
                            <div className="font-mono font-bold text-lg text-amber-400">
                               {order.offerMoney}g
                            </div>
                            <div className={`text-[10px] font-bold mt-1 ${canBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                               You have {state.money}g
                            </div>
                         </div>
                         <div className="text-indigo-400">➜</div>
                         <div>
                            <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold mb-1">Receive</div>
                            <div className="font-mono font-bold text-lg text-indigo-50">
                               {order.reqAmount}x {reqItem.name}
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="p-4 bg-indigo-900/50 border-t border-indigo-700/50">
                      <button
                        onClick={() => dispatch({ type: 'ACCEPT_ORDER', payload: { orderId: order.id } })}
                        disabled={!canBuy}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                           canBuy 
                             ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                             : 'bg-indigo-900/50 text-indigo-500 cursor-not-allowed border-2 border-indigo-800'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        {canBuy ? 'Buy Deal' : 'Not enough gold'}
                      </button>
                   </div>
                 </div>
               );
            })}

            {state.activeOrders.length === 0 && !state.travelingMerchant && (
              <div className="col-span-full bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-500">
                <p>No active orders right now. Check back tomorrow!</p>
              </div>
            )}

            {state.activeOrders.map((order) => {
                const villager = VILLAGERS[order.villagerId];
                const reqItem = ITEMS[order.reqItemId];
                const currentInv = state.inventory[order.reqItemId] || 0;
                
                const isBuyFromPlayer = order.type === 'buy'; // Villager buys from player
                const canComplete = isBuyFromPlayer 
                   ? currentInv >= order.reqAmount
                   : state.money >= order.offerMoney;

                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                             {villager.name.charAt(0)}
                          </div>
                          <div>
                             <div className="font-bold text-neutral-900">{villager.name}</div>
                             <div className="text-xs text-neutral-500">{villager.role}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" />
                          {order.expiresIn}d
                       </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-center text-center space-y-4">
                       <p className="text-neutral-700 italic text-sm">
                          {isBuyFromPlayer 
                             ? '"I need some supplies urgently and I\'m paying top gold."'
                             : '"I have excess goods I\'m trying to offload."'}
                       </p>
                       
                       <div className="bg-neutral-50 p-4 rounded-lg flex justify-around items-center border border-neutral-100">
                          <div>
                             <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                                {isBuyFromPlayer ? 'Give' : 'Pay'}
                             </div>
                             <div className="font-mono font-bold text-lg text-neutral-800">
                                {isBuyFromPlayer ? `${order.reqAmount}x ${reqItem.name}` : `${order.offerMoney}g`}
                             </div>
                             <div className={`text-[10px] font-bold mt-1 ${canComplete ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {isBuyFromPlayer ? `You have ${currentInv}` : `You have ${state.money}g`}
                             </div>
                          </div>
                          <div className="text-neutral-300">➜</div>
                          <div>
                             <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">
                                {isBuyFromPlayer ? 'Receive' : 'Get'}
                             </div>
                             <div className="font-mono font-bold text-lg text-amber-600">
                                {isBuyFromPlayer ? `${order.offerMoney}g` : `${order.reqAmount}x ${reqItem.name}`}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4 bg-neutral-50 border-t border-neutral-100">
                       <button
                         onClick={() => dispatch({ type: 'ACCEPT_ORDER', payload: { orderId: order.id } })}
                         disabled={!canComplete}
                         className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                            canComplete 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                              : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                         }`}
                       >
                         <CheckCircle className="w-5 h-5" />
                         {canComplete ? 'Complete Trade' : (isBuyFromPlayer ? 'Missing Items' : 'Not enough gold')}
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      )}
    </div>
  );
}
