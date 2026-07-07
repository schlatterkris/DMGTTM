'use client';

import React, { useState } from 'react';
import { Shield, Heart, ScrollText } from 'lucide-react';

export default function WarbandTile({ monster }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!monster) return null;

  return (
    /* FIX: 'w-64' prevents it from taking the whole row. 'flex-none' stops shrinking. */
    <div className="w-64 flex-none bg-[#f4e4bc] border-2 border-[#8d6e63] rounded-sm p-4 shadow-xl text-[#2b1d0e] transition-all hover:border-[#d4af37] h-fit">
      <div className="flex justify-between items-start border-b-2 border-[#8b0000]/20 mb-3 pb-1">
        <h3 className="font-medieval text-lg font-bold truncate leading-tight">{monster.name}</h3>
        <span className="text-[10px] bg-[#8b0000] text-white px-2 py-0.5 rounded-full font-bold uppercase">
          CR {monster.challenge}
        </span>
      </div>

      <div className="flex justify-around bg-[#8d6e63]/10 py-2 rounded-sm mb-3">
        <div className="flex flex-col items-center">
          <Shield size={16} className="text-[#8b0000] mb-1" />
          <span className="font-bold text-sm">{monster.ac}</span>
        </div>
        <div className="flex flex-col items-center border-l border-[#8d6e63]/30 pl-4">
          <Heart size={16} className="text-[#8b0000] mb-1" />
          <span className="font-bold text-sm">{monster.hp}</span>
        </div>
      </div>

      <p className="text-[10px] italic text-[#8d6e63] mb-3 uppercase tracking-wider">{monster.type}</p>

      {isExpanded && (
        <div className="mt-2 text-xs border-t border-[#8d6e63]/20 pt-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-1 mb-1 text-[#8b0000] font-bold uppercase text-[9px]">
            <ScrollText size={12} /> Actions
          </div>
          {monster.actions.map((action, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <span className="font-bold block text-[#5d4037]">{action.name}:</span>
              <p className="text-[#2b1d0e]/80 leading-relaxed">{action.desc}</p>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-3 py-1 bg-[#8d6e63]/10 hover:bg-[#8b0000]/10 border border-[#8d6e63]/30 text-[10px] uppercase font-bold tracking-widest transition-colors"
      >
        {isExpanded ? 'Minimize' : 'View Stats'}
      </button>
    </div>
  );
}