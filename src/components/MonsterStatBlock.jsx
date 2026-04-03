import React, { useState, useEffect } from 'react';
import DiceRoller from './DiceRoller';
import { getPocketBardStation } from '@/lib/utils/vibeMap';

export default function MonsterStatBlock({ monster, monsterName }) {
  if (!monster || !monster.content) return <p className="text-vault-blood italic p-4">Entry missing...</p>;

  const { content, instanceId } = monster;
  const station = getPocketBardStation(monster);
  
  // HP Extraction Logic
  const hpLine = content.find(c => typeof c === 'string' && c.includes('Hit Points')) || "";
  const maxHP = parseInt(hpLine.match(/\d+/) || 0, 10);
  
  const [currentHP, setCurrentHP] = useState(maxHP);
  const [damageInput, setDamageInput] = useState("");

  useEffect(() => { setCurrentHP(maxHP); }, [monsterName, maxHP]);

  const modifyHP = (mod) => {
    setCurrentHP(prev => Math.max(0, prev + mod));
    setDamageInput("");
  };

  return (
    <div className="vault-scroll relative my-4 p-8 bg-vault-paper text-vault-ink shadow-2xl border-l-8 border-vault-blood max-w-lg leading-relaxed mx-auto animate-in fade-in duration-500">
      
      {/* VIBE BADGE */}
      <div className="absolute -top-3 -right-3 bg-vault-blood text-vault-paper px-3 py-1 rounded-full text-[10px] font-uncial shadow-lg cursor-pointer hover:scale-110 transition-transform z-10" onClick={() => console.log(station)}>
        🎵 {station}
      </div>

      {/* HEADER & VITALITY */}
      <header className="border-b-2 border-vault-blood/30 mb-4 pb-2">
        <div className="flex justify-between items-baseline">
          <h2 className="text-4xl font-uncial text-vault-blood uppercase tracking-tighter">
            {monsterName} 
            {instanceId && <span className="text-xs ml-2 opacity-30 font-mono">#{instanceId.split('-')[1]?.slice(-4)}</span>}
          </h2>
          <span className="font-mono text-xl font-bold text-vault-blood">{currentHP}/{maxHP}</span>
        </div>
        
        <div className="w-full h-1.5 bg-stone-300 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-vault-blood transition-all" style={{ width: `${(currentHP / maxHP) * 100}%` }} />
        </div>

        <div className="flex gap-2 mt-3 items-center">
          <input type="number" placeholder="Amt" className="w-14 p-1 bg-white/50 border border-vault-blood/20 rounded text-xs" value={damageInput} onChange={e => setDamageInput(e.target.value)} />
          <button onClick={() => modifyHP(-parseInt(damageInput || 0))} className="px-2 py-1 bg-vault-blood text-white text-[9px] uppercase font-bold rounded hover:bg-red-700">Dmg</button>
          <button onClick={() => modifyHP(parseInt(damageInput || 0))} className="px-2 py-1 bg-green-800 text-white text-[9px] uppercase font-bold rounded hover:bg-green-700">Heal</button>
          <p className="text-[10px] italic opacity-60 ml-auto uppercase font-bold">{content[0]}</p>
        </div>
      </header>

      {/* CONTENT ENGINE */}
      <div className="space-y-3">
        {content.slice(1).map((item, idx) => {
          if (typeof item === 'object' && item.table) return <AbilityTable key={idx} stats={item.table} />;
          
          if (item === "Actions" || item === "**Actions**") {
            return <h3 key={idx} className="font-uncial text-2xl border-b border-vault-blood/20 text-vault-blood mt-4">Actions</h3>;
          }

          return <ContentRow key={idx} text={item} />;
        })}
      </div>
    </div>
  );
}

/** * Sub-Component: ContentRow
 * Handles text formatting and auto-dice-roller injection.
 */
function ContentRow({ text }) {
  if (typeof text !== 'string') return null;

  const diceRegex = /\((\d+d\d+\s*[\+\-]?\s*\d*)\)/;
  const match = text.replace('−', '-').match(diceRegex);
  const notation = match ? match[1] : null;

  return (
    <div className="group border-l-2 border-transparent hover:border-vault-blood/20 pl-3 transition-all">
      <p className="text-sm leading-snug" dangerouslySetInnerHTML={{ __html: formatText(text) }} />
      {notation && (
        <div className="mt-2 flex items-center gap-2 bg-vault-blood/5 p-1.5 rounded border border-vault-blood/10 w-fit scale-90 origin-left">
          <span className="font-mono text-[10px] font-bold text-vault-blood/70">{notation}</span>
          <DiceRoller notation={notation} label={text.split('.')[0].replace(/\*/g, '')} />
        </div>
      )}
    </div>
  );
}

function AbilityTable({ stats }) {
  return (
    <div className="grid grid-cols-6 gap-1 border-y border-vault-blood/40 py-2 my-4 text-center">
      {Object.entries(stats).map(([key, val]) => (
        <div key={key} className="flex flex-col">
          <span className="font-bold text-[9px] text-vault-blood uppercase">{key}</span>
          <span className="text-sm">{val[0]}</span>
        </div>
      ))}
    </div>
  );
}

function formatText(str) {
  return str
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="italic font-bold text-vault-blood">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
}
