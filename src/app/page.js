'use client';

import React, { useState, useEffect } from 'react';
import WarbandTile from '../components/WarbandTile';
import initialData from '../WarbandTile.json'; 

export default function VaultPage() {
  // 1. HYDRATION SHIELD
  const [mounted, setMounted] = useState(false);
  
  // 2. STATE MANAGEMENT
  const [warband, setWarband] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newMonster, setNewMonster] = useState({
    name: '',
    ac: '',
    hp: '',
    challenge: '',
    type: '',
    actions: [{ name: '', desc: '' }]
  });

  // Triggered only once the browser is ready
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. SEARCH LOGIC
const filteredMonsters = warband.filter((monster) => {
  if (!searchTerm) return true; // Show everything if search is empty
  
  // Convert everything to strings and lowercase to prevent crashes
  const monsterName = String(monster.name || "").toLowerCase().trim();
  const searchquery = String(searchTerm).toLowerCase().trim();
  
  return monsterName.includes(searchquery);
});

  // 4. HANDLERS
  const handleAddMonster = (e) => {
    e.preventDefault();
    setWarband([...warband, newMonster]);
    // Reset form
    setNewMonster({ 
      name: '', 
      ac: '', 
      hp: '', 
      challenge: '', 
      type: '', 
      actions: [{ name: '', desc: '' }] 
    });
    setIsModalOpen(false);
  };

  // Prevent Hydration Error by waiting for mount
  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 md:p-10 text-[#f4e4bc]">
      <header className="mb-10 border-b-2 border-[#8b0000]/50 pb-8 relative">
        <h1 className="font-medieval text-5xl text-[#d4af37] tracking-tighter uppercase mb-2">
          The Ultimate DM Vault
        </h1>
        <p className="text-[#f4e4bc]/40 italic text-sm tracking-[0.2em] uppercase">
          Warband Commander — Tactical HUD
        </p>
        
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full max-w-md">
            <label className="block text-[10px] uppercase tracking-widest text-[#8b0000] mb-2 font-bold">
              Filter Active Roster
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full bg-[#151515] border-b-2 border-[#8b0000]/40 p-3 text-[#d4af37] focus:outline-none focus:border-[#d4af37]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#8b0000] hover:bg-[#600000] text-[#f4e4bc] px-8 py-3 rounded-sm font-bold uppercase text-[10px] tracking-widest border border-[#d4af37]/20 shadow-lg transition-all active:scale-95"
          >
            + Recruit Entity
          </button>
        </div>
      </header>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border-2 border-[#8b0000] p-8 w-full max-w-lg shadow-[0_0_60px_rgba(139,0,0,0.4)]">
            <h2 className="font-medieval text-3xl text-[#d4af37] mb-6 uppercase border-b border-[#8b0000]/30 pb-2">
              New Entity Designation
            </h2>
            
            <form onSubmit={handleAddMonster} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input 
                    placeholder="Creature Name" 
                    className="w-full bg-[#0a0a0a] border border-[#8b0000]/40 p-3 text-[#d4af37] outline-none"
                    required
                    value={newMonster.name}
                    onChange={e => setNewMonster({...newMonster, name: e.target.value})}
                  />
                </div>
                <input 
                  placeholder="Type (e.g. Undead)" 
                  className="bg-[#0a0a0a] border border-[#8b0000]/40 p-3 text-[#d4af37] outline-none"
                  value={newMonster.type}
                  onChange={e => setNewMonster({...newMonster, type: e.target.value})}
                />
                <input 
                  placeholder="CR" 
                  className="bg-[#0a0a0a] border border-[#8b0000]/40 p-3 text-[#d4af37] outline-none"
                  value={newMonster.challenge}
                  onChange={e => setNewMonster({...newMonster, challenge: e.target.value})}
                />
                <input 
                  placeholder="AC" type="number"
                  className="bg-[#0a0a0a] border border-[#8b0000]/40 p-3 text-[#d4af37] outline-none"
                  value={newMonster.ac}
                  onChange={e => setNewMonster({...newMonster, ac: e.target.value})}
                />
                <input 
                  placeholder="HP" type="number"
                  className="bg-[#0a0a0a] border border-[#8b0000]/40 p-3 text-[#d4af37] outline-none"
                  value={newMonster.hp}
                  onChange={e => setNewMonster({...newMonster, hp: e.target.value})}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#8b0000] font-bold">Action Registry</label>
                <input 
                  placeholder="Action Title" 
                  className="w-full bg-[#0a0a0a] border border-[#8b0000]/40 p-3 text-[#d4af37] outline-none"
                  value={newMonster.actions[0].name}
                  onChange={e => {
                    let acts = [...newMonster.actions];
                    acts[0].name = e.target.value;
                    setNewMonster({...newMonster, actions: acts});
                  }}
                />
                <textarea 
                  placeholder="Action Description..." 
                  className="w-full bg-[#0a0a0a] border border-[#8b0000]/40 p-3 text-[#d4af37] h-24 outline-none resize-none"
                  value={newMonster.actions[0].desc}
                  onChange={e => {
                    let acts = [...newMonster.actions];
                    acts[0].desc = e.target.value;
                    setNewMonster({...newMonster, actions: acts});
                  }}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-grow bg-[#8b0000] hover:bg-[#a00000] py-4 text-xs font-bold uppercase tracking-widest transition-colors">
                  Bind to Vault
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 border border-[#f4e4bc]/20 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white/5"
                >
                  Dismiss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC GRID */}
      <section>
        <h2 className="text-[#8b0000] font-bold uppercase tracking-[0.3em] text-xs mb-8 flex items-center gap-4">
          <span>Active Warband Status</span>
          <div className="h-[1px] flex-grow bg-[#8b0000]/20"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredMonsters.length > 0 ? (
            filteredMonsters.map((monster, index) => (
              <div key={index}>
                <WarbandTile monster={monster} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 border-2 border-dashed border-[#8d6e63]/10 text-center rounded-lg bg-[#111]/50">
              <p className="text-[#f4e4bc]/20 italic font-medieval text-xl">
                {searchTerm ? "No entities match the current search." : "The Warband is currently empty."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}