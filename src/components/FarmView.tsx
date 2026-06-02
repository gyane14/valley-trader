import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ITEMS, CROPS } from '../data/gameData';
import { ItemId } from '../types';
import { Sprout, Wheat, Sun, Droplets, ArrowRight, Target, Lock, CloudLightning, Wind, CloudRain, Cloud } from 'lucide-react';

export default function FarmView() {
  const { state, dispatch } = useGame();
  const [selectedSeed, setSelectedSeed] = useState<ItemId | null>(null);

  const seedInventory = Object.entries(state.inventory)
    .filter(([id, amount]) => ITEMS[id as ItemId]?.type === 'seed' && (amount as number) > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Your Farm</h2>
        <p className="text-neutral-600 mt-2">Plant crops according to the seasons. Current Season: <strong className="font-bold">{state.season}</strong></p>
      </div>

      {/* Seed Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Sprout className="w-5 h-5 text-emerald-600" />
             <h3 className="font-semibold text-neutral-800">Select Seed to Plant</h3>
          </div>
          <div className="text-xs text-neutral-500 font-bold bg-neutral-100 px-2 py-1 rounded">
             {seedInventory.length} Available
          </div>
        </div>
        <div className="p-6 overflow-x-auto">
          {seedInventory.length === 0 ? (
            <p className="text-neutral-500 italic text-center py-4">No seeds in inventory. Buy some from the Mandi or Villagers!</p>
          ) : (
            <div className="flex gap-4 flex-wrap pb-2">
              {seedInventory.map(([id, amount]) => {
                const item = ITEMS[id as ItemId];
                const cropData = CROPS[id as ItemId];
                const isSelected = selectedSeed === id;
                const inSeason = cropData?.seasons.includes(state.season);

                return (
                  <button
                    key={id}
                    disabled={!inSeason}
                    onClick={() => setSelectedSeed(isSelected ? null : (id as ItemId))}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left min-w-[220px] ${
                      !inSeason ? 'border-neutral-100 bg-neutral-50 opacity-60 grayscale cursor-not-allowed' :
                      isSelected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-neutral-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-neutral-100 shrink-0">
                      <Wheat className={`w-6 h-6 ${isSelected ? 'text-emerald-600' : 'text-neutral-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-neutral-900 leading-tight flex justify-between">
                         {item.name} 
                         <span className="font-bold text-emerald-700 bg-emerald-100/50 px-2 rounded-full text-xs ml-1 flex items-center justify-center">x{amount as number}</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1 font-medium">
                        <Sun className="w-3 h-3 text-amber-500" /> {cropData?.growTime} days
                      </div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400 mt-1 truncate">
                        {cropData?.seasons.join(', ')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Farm Plots */}
      <div className="bg-[#5c3a21] rounded-xl shadow-lg border-4 border-[#3e2723] p-4 relative overflow-hidden">
        {/* Dirt Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3e2723_2px,transparent_2px)] [background-size:16px_16px]" />
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 relative z-10">
          {state.plots.map((plot) => {
            if (!plot.isUnlocked) {
               return (
                  <div key={plot.id} className="aspect-square rounded-lg bg-black/40 border-2 border-black/50 flex flex-col items-center justify-center p-2 backdrop-blur-sm">
                     <Lock className="w-6 h-6 text-white/50 mb-1" />
                     <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider text-center">Locked Plot</span>
                  </div>
               );
            }

            const isPlanted = !!plot.plantedCrop;
            const cropData = isPlanted ? CROPS[plot.plantedCrop!] : null;
            const isReady = isPlanted && cropData && plot.daysPlanted! >= cropData.growTime;

            return (
              <div
                key={plot.id}
                className={`group relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all ${
                  isReady 
                    ? 'border-amber-400 bg-amber-200/90 hover:bg-amber-300/90 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.4)]' 
                    : isPlanted 
                      ? 'border-emerald-600/80 bg-emerald-800/40 hover:bg-emerald-800/60 shadow-inner' 
                      : 'border-[#3e2723]/30 bg-[#8B5A2B]/40 hover:bg-[#8B5A2B]/60 cursor-pointer shadow-inner'
                }`}
                onClick={() => {
                  if (isReady) {
                    dispatch({ type: 'HARVEST_CROP', payload: { plotId: plot.id } });
                  } else if (!isPlanted && selectedSeed) {
                    dispatch({ type: 'PLANT_CROP', payload: { plotId: plot.id, seedId: selectedSeed } });
                  }
                }}
              >
                {!isReady && !isPlanted && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-30 pointer-events-none">
                     <div className="h-0.5 bg-[#3e2723] rounded-full w-full" />
                     <div className="h-0.5 bg-[#3e2723] rounded-full w-full" />
                  </div>
                )}

                {isReady ? (
                  <>
                    <Wheat className="w-12 h-12 text-amber-700 animate-bounce drop-shadow-md" />
                    <span className="absolute bottom-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Harvest
                    </span>
                  </>
                ) : isPlanted ? (
                  <>
                    <Sprout className={`w-8 h-8 text-emerald-400 mb-1 drop-shadow-md ${Math.floor(plot.daysPlanted || 0) > 0 ? 'scale-125' : 'scale-90'} transition-transform duration-500`} />
                    <div className="absolute bottom-1 w-full px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
                        <div className="text-[10px] font-bold text-emerald-100 truncate text-center">{ITEMS[plot.plantedCrop!].name}</div>
                        <div className="w-full bg-black/50 h-1 rounded-full mt-1 overflow-hidden">
                          <div 
                             className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                             style={{ width: `${Math.min(100, ((plot.daysPlanted || 0) / (cropData?.growTime || 1)) * 100)}%`}} 
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3e2723]">
                    <Target className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-[10px] font-bold tracking-wide block text-center">
                      Plant
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
