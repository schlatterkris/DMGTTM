import { useState } from 'react';
import CreatureSearch from '../components/CreatureSearch';
import MonsterStatBlock from '../components/MonsterStatBlock';

export default function UltimateDMVault() {
  const [warband, setWarband] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [previewMonster, setPreviewMonster] = useState(null);

  // Triggered when a DM clicks a name in the Sidebar
  const handleSelection = (creature) => {
    setPreviewMonster({ name: creature.name, ...creature.data });
    setActiveTabId('preview'); // Focus the new search immediately
  };

  // Triggered when "Enlist in Warband" button is clicked
  const addToWarband = () => {
    if (!previewMonster) return;
    const newID = `${previewMonster.name}-${Date.now()}`;
    const newEntry = { ...previewMonster, instanceId: newID };
    
    setWarband([...warband, newEntry]);
    setActiveTabId(newID); // Switch focus to the new combatant
    setPreviewMonster(null); // Clear the preview slot
  };

  const removeFromWarband = (id) => {
    const newWarband = warband.filter(m => m.instanceId !== id);
    setWarband(newWarband);
    // If we deleted the active tab, focus the next available monster
    if (activeTabId === id) {
      setActiveTabId(newWarband.length > 0 ? newWarband[0].instanceId : null);
    }
  };

  // Determine which monster data to pass to the StatBlock component
  const activeMonster = activeTabId === 'preview' 
    ? previewMonster 
    : warband.find(m => m.instanceId === activeTabId);

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-[#0a0a0a] text-[#f4e4bc] font-serif">
      
      {/* 1. LEFT SIDEBAR: THE ARCHIVES */}
      <aside className="w-80 shrink-0 h-full border-r border-[#8b0000]/40 bg-[#141414] p-6 flex flex-col z-20">
        <CreatureSearch onSelectCreature={handleSelection} />
        <div className="mt-auto pt-4 border-t border-[#8b0000]/10 opacity-20 text-[10px] text-center uppercase tracking-widest">
          Warband Tactical HUD v1.1
        </div>
      </aside>

      {/* 2. MAIN AREA: TABS & STAT BLOCKS */}
      <main className="flex-1 h-full overflow-hidden flex flex-col bg-[#0f0f0f]">
        
        {/* TAB BAR */}
        <nav className="flex bg-red-500 border-b border-[#8b0000]/30 h-12 overflow-x-auto no-scrollbar scroll-smooth flex-row flex-nowrap">
          {/* THE PREVIEW TAB (Blue-ish to distinguish from active combat) */}
          {previewMonster && (
            <button 
              onClick={() => setActiveTabId('preview')}
              className={`px-6 flex items-center gap-2 border-r border-blue-900/30 transition-all shrink-0 ${
                activeTabId === 'preview' 
                ? 'bg-blue-900/40 text-blue-200 border-b-2 border-b-blue-400' 
                : 'bg-blue-950/10 text-blue-400/50 hover:bg-blue-900/20'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest italic truncate max-w-[120px]">
                🔍 {previewMonster.name}
              </span>
            </button>
          )}

          {/* WARBAND TABS (Red/Gold for active combatants) */}
          {warband.map((m) => (
            <div key={m.instanceId} className="flex border-r border-[#8b0000]/20 shrink-0">
              <button 
                onClick={() => setActiveTabId(m.instanceId)}
                className={`px-6 flex items-center h-full transition-all ${
                  activeTabId === m.instanceId 
                  ? 'bg-[#1a1a1a] text-[#d4af37] border-b-2 border-b-[#8b0000]' 
                  : 'text-[#f4e4bc]/40 hover:bg-white/5'
                }`}
              >
                <span className="font-['Uncial_Antiqua'] text-sm tracking-tight">{m.name}</span>
              </button>
              <button 
                onClick={() => removeFromWarband(m.instanceId)}
                className="px-3 hover:text-red-600 hover:bg-red-950/20 transition-colors text-white/20"
                title="Dismiss from Warband"
              >✕</button>
            </div>
          ))}
        </nav>

        {/* WORKSPACE */}
        <section className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] flex flex-col items-center">
          
          {/* ENLIST ACTION (Only shown when looking at a preview) */}
          {activeTabId === 'preview' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <button 
                onClick={addToWarband}
                className="mb-8 bg-green-900/20 hover:bg-green-800 text-green-100 font-['Uncial_Antiqua'] px-10 py-3 rounded-sm shadow-xl transition-all border border-green-500/30 hover:shadow-green-900/20 flex items-center gap-3"
              >
                <span className="text-xl">⚔️</span> ENLIST IN WARBAND
              </button>
            </div>
          )}

          {/* THE ACTIVE STAT BLOCK */}
          <div className="w-full max-w-2xl">
            {activeMonster ? (
              <MonsterStatBlock 
                key={activeMonster.instanceId || 'preview'} 
                monster={activeMonster} 
                monsterName={activeMonster.name} 
              />
            ) : (
              <div className="mt-40 text-center opacity-20 italic">
                <p className="font-['Uncial_Antiqua'] text-3xl mb-2">The Warband is Empty</p>
                <p>Search the archives and enlist creatures to begin tracking combat.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
