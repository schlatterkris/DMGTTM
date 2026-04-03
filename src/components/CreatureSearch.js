import React, { useState, useMemo } from 'react';
import monsterData from '../data/monsters.json'; 

const CreatureSearch = ({ onSelectCreature }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const searchableList = useMemo(() => {
    const allEntries = [];
    const isStatBlock = (item) => 
      item && typeof item === 'object' && Array.isArray(item.content) && 
      item.content.some(c => typeof c === 'object' && c.table);

    Object.keys(monsterData).forEach(categoryKey => {
      const category = monsterData[categoryKey];
      if (category && typeof category === 'object') {
        Object.keys(category).forEach(entryKey => {
          const entry = category[entryKey];
          if (entryKey !== 'content' && isStatBlock(entry)) {
            allEntries.push({ name: entryKey, data: entry });
          } else if (typeof entry === 'object' && !Array.isArray(entry.content)) {
            Object.keys(entry).forEach(subKey => {
              const subEntry = entry[subKey];
              if (subKey !== 'content' && isStatBlock(subEntry)) {
                allEntries.push({ name: subKey, data: subEntry });
              }
            });
          }
        });
      }
    });
    return allEntries.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredResults = searchableList.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-['Uncial_Antiqua'] text-vault-blood text-xl mb-4 tracking-tighter">
        The Archives
      </h2>
      
      <div className="relative mb-6">
        <input 
          type="text"
          placeholder="Search for a beast..."
          className="w-full p-3 bg-stone-950 border border-vault-blood/40 rounded-sm text-sm font-serif focus:outline-none focus:border-vault-blood text-vault-paper shadow-inner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute right-3 top-3 opacity-30">🔍</span>
      </div>

      {/* THE GATEKEEPER: Only show list if there is a search term */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {searchTerm.length > 0 ? (
          <ul className="space-y-1">
            {filteredResults.map((monster, idx) => (
              <li 
                key={`${monster.name}-${idx}`}
                onClick={() => {
                    onSelectCreature(monster);
                    setSearchTerm(""); // Optional: clear search after picking
                }}
                className="p-3 text-sm hover:bg-vault-blood/20 cursor-pointer font-serif italic border-b border-white/5 flex justify-between group transition-all"
              >
                <span className="group-hover:text-vault-blood text-vault-paper/80">✦ {monster.name}</span>
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-vault-blood uppercase">Summon</span>
              </li>
            ))}
            {filteredResults.length === 0 && (
              <p className="text-xs italic opacity-40 p-2 text-center">No records found for "{searchTerm}"</p>
            )}
          </ul>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center opacity-20 italic text-sm">
            Enter a name to consult the ancient records...
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatureSearch;
