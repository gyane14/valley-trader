/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Sprout, Store, Home, Hammer, LogOut, Coins, Zap, Calendar, ArrowRightLeft } from 'lucide-react';
import FarmView from './components/FarmView';
import MarketView from './components/MarketView';
import VillageView from './components/VillageView';
import BuildingsView from './components/BuildingsView';
import Sidebar from './components/Sidebar';

import PoliticsView from './components/PoliticsView';
import { CloudRain, Sun, Cloud, Wind, CloudLightning, Landmark } from 'lucide-react';

type ViewMode = 'farm' | 'market' | 'village' | 'buildings' | 'politics';

function GameUI() {
  const { state, dispatch } = useGame();
  const [view, setView] = useState<ViewMode>('farm');

  const WeatherIcon = {
    'Sunny': Sun,
    'Rainy': CloudRain,
    'Cloudy': Cloud,
    'Drought': Wind,
    'Storm': CloudLightning,
  }[state.weather] || Sun;

  return (
    <div className="min-h-screen bg-neutral-100 flex font-sans text-neutral-800">
      {/* Sidebar for Stats and Navigation */}
      <Sidebar view={view} setView={setView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Date</span>
               <div className="flex items-center space-x-2 text-neutral-800 font-bold">
                 <Calendar className="w-4 h-4 text-emerald-600" />
                 <span>Day {state.day} - {state.season}</span>
               </div>
            </div>
            
            <div className={`h-8 w-px bg-neutral-200 mx-2`} />

            <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Weather</span>
               <div className="flex items-center space-x-2 font-bold text-indigo-700">
                 <WeatherIcon className="w-4 h-4" />
                 <span>{state.weather}</span>
               </div>
            </div>

            <div className={`h-8 w-px bg-neutral-200 mx-2`} />

            <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Government</span>
               <div className="flex items-center space-x-2 font-bold text-rose-700">
                 <Landmark className="w-4 h-4" />
                 <span>{state.currentPartyId ? state.currentPartyId.replace('_', ' ').toUpperCase() : 'NONE'}</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 py-1.5 px-3 rounded-full font-medium">
                <Coins className="w-5 h-5 text-amber-600" />
                <span className="font-mono">{Math.floor(state.money)}g</span>
             </div>
             <button
               onClick={() => dispatch({ type: 'END_DAY' })}
               className="bg-neutral-800 hover:bg-neutral-900 transition-colors text-white py-2 px-5 rounded-md font-bold flex items-center space-x-2 shadow-sm"
             >
               <span>End Day</span>
               <LogOut className="w-4 h-4 ml-1" />
             </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 pb-24">
          {view === 'farm' && <FarmView />}
          {view === 'market' && <MarketView />}
          {view === 'village' && <VillageView />}
          {view === 'buildings' && <BuildingsView />}
          {view === 'politics' && <PoliticsView />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
}

