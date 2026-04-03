import React, { useState } from 'react';

const DiceRoller = ({ notation = "1d20", label = "Roll" }) => {
  const [result, setResult] = useState(null);
  const [rolls, setRolls] = useState([]);

  const rollDice = (diceNotation) => {
    // 1. Clean the string (handles the '−' from your JSON)
    const cleanNotation = diceNotation.replace('−', '-');
    
    // 2. The Regex Ritual
    const regex = /(\d+)d(\d+)(?:\s*([\+\-])\s*(\d+))?/;
    const match = cleanNotation.match(regex);
    
    if (!match) return;

    // 3. Robust Extraction (Avoiding the destructuring token error)
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const op = match[3] || null;
    const mod = parseInt(match[4] || 0, 10);

    const individualRolls = Array.from({ length: count }, () => 
      Math.floor(Math.random() * sides) + 1
    );
    
    let total = individualRolls.reduce((a, b) => a + b, 0);
    if (op === '+') total += mod;
    if (op === '-') total -= mod;

    setRolls(individualRolls);
    setResult(total);
  };

  return (
    <div className="inline-flex flex-col items-start bg-vault-blood/5 p-2 rounded border border-vault-blood/20 shadow-inner">
      <div className="flex items-center gap-3">
        <button 
          onClick={(e) => {
            e.preventDefault(); // Prevents page jumps
            rollDice(notation);
          }}
          className="bg-vault-blood text-vault-paper px-3 py-1 rounded-sm text-xs font-bold hover:brightness-125 active:scale-95 transition-all shadow-md uppercase tracking-wider"
        >
          {label}
        </button>

        {result !== null && (
          <div className="text-xl font-bold text-vault-blood animate-in zoom-in duration-200">
            {result}
          </div>
        )}
      </div>

      {rolls.length > 0 && (
        <div className="mt-1 text-[9px] font-mono text-vault-ink/50 italic">
          Result: [{rolls.join(' + ')}] {notation.includes('+') || notation.includes('-') ? '± mod' : ''}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
