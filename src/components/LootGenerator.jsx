import React, { useState } from 'react';
import itemsData from '../data/magic items.json';
import styles from '../styles/Spellbook.module.css';

const LootGenerator = ({ monsterCR, onLootFound }) => {
  const [isOpening, setIsOpening] = useState(false);

  // Logic: Extract numerical CR from string "**Challenge** 2 (450 XP)"
  const parseCR = (crString) => {
    const match = crString.match(/\*\*Challenge\*\* ([\d\/]+)/);
    if (!match) return 0;
    const val = match[1];
    if (val.includes('/')) {
      const [num, den] = val.split('/');
      return parseFloat(num) / parseFloat(den);
    }
    return parseFloat(val);
  };

  const generateLoot = () => {
    setIsOpening(true);
    const cr = parseCR(monsterCR);
    
    // Logic: Define Rarity Tiers based on CR
    let allowedRarities = ['common', 'uncommon'];
    if (cr >= 5) allowedRarities = ['uncommon', 'rare'];
    if (cr >= 11) allowedRarities = ['rare', 'very rare'];
    if (cr >= 17) allowedRarities = ['very rare', 'legendary', 'artifact'];

    // Logic: Filter items from master JSON
    // Note: Magic items are often nested under a top-level "Magic Items" key
    const allItems = Object.values(itemsData["Magic Items"] || itemsData);
    const pool = allItems.filter(item => {
      const desc = item.content?.[0]?.toLowerCase() || "";
      return allowedRarities.some(r => desc.includes(r));
    });

    const loot = pool[Math.floor(Math.random() * pool.length)];
    
    // Simulate "Opening" delay
    setTimeout(() => {
      onLootFound(loot);
      setIsOpening(false);
    }, 1000);
  };

  return (
    <button 
      className={`${styles.lootBoxButton} ${isOpening ? styles.shaking : ''}`}
      onClick={generateLoot}
      disabled={isOpening}
    >
      {isOpening ? '💎 Unlocking...' : '🎁 Claim Spoils'}
    </button>
  );
};

export default LootGenerator;
