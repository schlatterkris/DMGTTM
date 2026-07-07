'use client';

import React, { useState } from 'react';
import { Shield, Heart } from 'lucide-react';

export default function WarbandTile({ monster }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!monster) return null;

  return (
    <div className="bg-[#f4e4bc] border-2 border-[#8d6e63] rounded-sm p-2 shadow-md w-48 text-[#2b1d0e] transition-all hover:border-[#d4af37]">
      {/* Header: Name and CR */}
      <div className="flex justify-between items-start border-b border-[#8d6e63]/30 mb-2">
        <h3 className="font-medieval text-sm font-bold truncate">{monster.name}</h3>
        <span className="text-[10px] bg-[#8b0000] text-white px-1 rounded">CR {monster.challenge}</span>
      </div>

      {/* Key Stats Row */}
      <div className="flex justify-around text-xs mb-2">
        <div className="flex items-center gap-1">
          <Shield size={12} className="text-[#8b0000]" />
          <span>{monster.ac}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart size={12} className="text-[#8b0000]" />
          <span>{monster.hp}</span>
        </div>
      </div>

      {/* Collapsible Info */}
      <div 
        className={`overflow-y-auto transition-all ${isExpanded ? 'max-h-40' : 'max-h-0'}`}
      >
        <div className="text-[10px] italic mb-1 border-t border-[#8d6e63]/20 pt-1">
          {monster.type}
        </div>
        <ul className="text-[10px] list-disc pl-3">
          {monster.actions?.map((action, i) => (
            <li key={i}><strong>{action.name}:</strong> {action.desc}</li>
          ))}
        </ul>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-1 text-[10px] uppercase font-bold tracking-tighter hover:text-[#8b0000]"
      >
        {isExpanded ? 'Collapse ▲' : 'Details ▼'}
      </button>
    </div>
  );
}