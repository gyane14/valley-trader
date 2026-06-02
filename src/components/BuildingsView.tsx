import React from 'react';
import { useGame } from '../context/GameContext';
import { BUILDINGS, ITEMS } from '../data/gameData';
import { ItemId } from '../types';
import { Hammer, Check, Lock } from 'lucide-react';

export default function BuildingsView() {
  const { state, dispatch } = useGame();

  const handleBuild = (buildingId: string) => {
    dispatch({ type: 'BUILD_BUILDING', payload: { buildingId } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Construction</h2>
        <p className="text-neutral-600 mt-2">Expand your farm line and unlock new village capabilities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(BUILDINGS).map(([id, building]) => {
          const isUnlocked = state.unlockedBuildings.includes(id);
          
          let canAfford = state.money >= building.cost.money;
          if (canAfford && building.cost.items) {
             for (const [itemId, amount] of Object.entries(building.cost.items)) {
                if ((state.inventory[itemId as ItemId] || 0) < amount) {
                   canAfford = false;
                   break;
                }
             }
          }

          return (
            <div 
              key={id} 
              className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col ${
                 isUnlocked ? 'border-emerald-200' : 'border-neutral-200'
              }`}
            >
              <div className={`p-6 border-b flex items-start justify-between ${isUnlocked ? 'bg-emerald-50 border-emerald-100' : 'bg-neutral-50 border-neutral-100'}`}>
                 <div>
                    <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                       {building.name}
                       {isUnlocked && <Check className="w-5 h-5 text-emerald-600" />}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">{building.description}</p>
                 </div>
                 <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-neutral-100 text-indigo-600">
                    <Hammer className="w-6 h-6" />
                 </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                 <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Construction Cost</h4>
                 
                 <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center bg-neutral-50 px-3 py-2 rounded">
                       <span className="font-medium text-neutral-700">Gold</span>
                       <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${state.money >= building.cost.money ? 'text-amber-600' : 'text-rose-500'}`}>
                             {building.cost.money}
                          </span>
                       </div>
                    </div>
                    {building.cost.items && Object.entries(building.cost.items).map(([itemId, amount]) => {
                       const current = state.inventory[itemId as ItemId] || 0;
                       return (
                          <div key={itemId} className="flex justify-between items-center bg-neutral-50 px-3 py-2 rounded">
                             <span className="font-medium text-neutral-700">{ITEMS[itemId as ItemId].name}</span>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-400">(Have: {current})</span>
                                <span className={`font-mono font-bold ${current >= amount ? 'text-neutral-900' : 'text-rose-500'}`}>
                                   {amount}
                                </span>
                             </div>
                          </div>
                       );
                    })}
                 </div>

                 <div className="mt-auto">
                    {isUnlocked ? (
                       <button disabled className="w-full py-3 rounded-lg font-bold bg-neutral-100 text-neutral-500 cursor-not-allowed">
                          Constructed
                       </button>
                    ) : (
                       <button
                         onClick={() => handleBuild(id)}
                         disabled={!canAfford}
                         className={`w-full py-3 rounded-lg font-bold transition-colors ${
                            canAfford
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                         }`}
                       >
                         {canAfford ? 'Construct Building' : 'Not Enough Resources'}
                       </button>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
