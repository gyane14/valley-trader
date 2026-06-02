import React from 'react';
import { useGame } from '../context/GameContext';
import { Sprout, Store, Home, Hammer, Package, AlertCircle, Gavel } from 'lucide-react';
import { ITEMS } from '../data/gameData';
import { ItemId } from '../types';

interface SidebarProps {
  view: 'farm' | 'market' | 'village' | 'buildings' | 'politics';
  setView: (v: 'farm' | 'market' | 'village' | 'buildings' | 'politics') => void;
}

export default function Sidebar({ view, setView }: SidebarProps) {
  const { state } = useGame();

  const navItems = [
    { id: 'farm', label: 'Farm', icon: Sprout },
    { id: 'market', label: 'Market', icon: Store },
    { id: 'village', label: 'Village', icon: Home },
    { id: 'buildings', label: 'Buildings', icon: Hammer },
    { id: 'politics', label: 'Politics', icon: Gavel },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen shrink-0">
      <div className="p-6 border-b border-neutral-200">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <Sprout className="text-emerald-600" />
          ValleyTrader
        </h1>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors font-medium ${
              view === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${view === item.id ? 'text-indigo-600' : 'text-neutral-400'}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Inventory Summary */}
      <div className="mt-8 px-4 flex-1 overflow-y-auto">
        <div className="flex items-center space-x-2 px-2 mb-3 text-sm font-bold tracking-wider text-neutral-500 uppercase">
          <Package className="w-4 h-4" />
          <span>Inventory</span>
        </div>
        <div className="space-y-2 px-2">
          {Object.entries(state.inventory).map(([itemId, amount]) => {
            if (!amount || (amount as number) <= 0) return null;
            const item = ITEMS[itemId as ItemId];
            return (
              <div key={itemId} className="flex justify-between items-center text-sm py-1 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 rounded px-1">
                <span className="text-neutral-700">{item?.name || itemId}</span>
                <span className="font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs">x{amount as number}</span>
              </div>
            );
          })}
          {Object.values(state.inventory).every((a) => !a || (a as number) <= 0) && (
            <div className="text-sm text-neutral-400 italic px-2">Empty</div>
          )}
        </div>
      </div>

      {/* Event Warning */}
      {state.activeEventId && (
        <div className="m-4 mt-auto">
          <div className="bg-rose-50 border border-rose-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-rose-800 font-medium mb-1 text-sm">
              <AlertCircle className="w-4 h-4" />
              Active Event!
            </div>
            <p className="text-xs text-rose-600 leading-tight">
              An event is affecting market prices! ({state.eventDaysLeft} days left)
            </p>
          </div>
        </div>
      )}

      {/* Activity Log Mini */}
      <div className="h-40 border-t border-neutral-200 bg-neutral-50 p-4 overflow-hidden flex flex-col mt-auto">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Recent Activity</h3>
        <div className="space-y-2 overflow-y-auto flex-1 text-xs text-neutral-600 font-mono">
          {state.logs.slice(0, 5).map((log, i) => (
            <div key={i} className={`truncate ${log.startsWith('---') ? 'font-bold text-indigo-500 mt-2' : ''}`}>
               {log}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
