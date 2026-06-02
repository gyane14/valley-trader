import React from 'react';
import { useGame } from '../context/GameContext';
import { PARTIES } from '../data/gameData';
import { Vote, Building2, Gavel, Scale, AlertTriangle, ChevronRight } from 'lucide-react';

export default function PoliticsView() {
  const { state, dispatch } = useGame();

  const handleVote = (partyId: string) => {
    dispatch({ type: 'VOTE_PARTY', payload: { partyId } });
  };

  const currentParty = PARTIES.find(p => p.id === state.currentPartyId);
  const activeLawRules = {
    'subsidize_seeds': 'Seed costs in the Mandi are reduced by 40%.',
    'abolish_mandi': 'The Mandi is CLOSED. You must rely solely on direct Villager Trades (with enhanced payouts).',
    'price_controls': 'Market prices move very slowly. Building costs are somewhat subsidized (15%).',
    'none': 'No active laws.',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Parliament & Elections</h2>
        <p className="text-neutral-600 mt-2">Vote for political parties to influence market laws and village economy mandates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current State Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 relative overflow-hidden">
             {currentParty && (
                <div className={`absolute top-0 right-0 w-2 h-full ${currentParty.color}`} />
             )}
             <div className="flex items-center gap-2 text-neutral-500 uppercase font-bold text-xs tracking-wider mb-4">
                <Gavel className="w-4 h-4" /> Current Ruling Party
             </div>
             
             {currentParty ? (
                <>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">{currentParty.name}</h3>
                  <div className="text-sm font-medium text-neutral-500 mb-4">Led by {currentParty.leader}</div>
                  
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                     <div className="flex items-center gap-2 font-bold text-neutral-800 mb-2 text-sm">
                        <Scale className="w-4 h-4 text-indigo-500" /> Active Law: {state.activeLaw.replace('_', ' ').toUpperCase()}
                     </div>
                     <p className="text-xs text-neutral-600 leading-relaxed">
                        {activeLawRules[state.activeLaw as keyof typeof activeLawRules] || 'No special rules.'}
                     </p>
                  </div>
                </>
             ) : (
                <div className="text-neutral-500 italic">No government formed.</div>
             )}
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Vote className="w-8 h-8" />
             </div>
             <p className="text-sm text-neutral-500 font-bold uppercase tracking-wide">Next Election In</p>
             <p className="text-4xl font-black text-neutral-900 my-1">{state.daysUntilElection}</p>
             <p className="text-sm text-neutral-500">Days</p>
          </div>
        </div>

        {/* Voting Ballots Column */}
        <div className="md:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
             <Building2 className="w-5 h-5 text-neutral-400" /> Cast Your Ballot
          </h3>

          <div className="space-y-4">
             {PARTIES.map(party => {
                const isSelected = state.playerVote === party.id;
                const isRuling = state.currentPartyId === party.id;
                
                return (
                   <div 
                     key={party.id}
                     className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                          : 'border-neutral-100 bg-neutral-50 hover:border-neutral-300'
                     }`}
                   >
                      <div className="flex-1">
                         <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${party.color}`} />
                            <h4 className="font-bold text-lg text-neutral-900">{party.name}</h4>
                            {isRuling && (
                               <span className="text-[10px] uppercase font-bold bg-neutral-800 text-white px-2 py-0.5 rounded-full">Incumbent</span>
                            )}
                         </div>
                         <p className="text-xs text-neutral-500 mt-1 font-medium">Leader: {party.leader}</p>
                         <p className="text-sm text-neutral-700 mt-2 italic">"{party.mandate}"</p>
                      </div>
                      
                      <button
                        onClick={() => handleVote(party.id)}
                        className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                           isSelected
                             ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                             : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                         {isSelected ? 'Ballot Cast' : 'Vote'} 
                         {!isSelected && <ChevronRight className="w-4 h-4 text-neutral-400" />}
                      </button>
                   </div>
                );
             })}
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
             <div className="text-xs text-amber-800 leading-relaxed">
                <strong>Elections matter.</strong> At the end of the election cycle, your vote combined with your farm's 
                Reputation will sway the parliament. The winning party will enact their law immediately, completely changing the economy.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
