import React, { useState } from 'react';
import styles from '../styles/Spellbook.module.css';

const ScryingPool = ({ dataSources, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < 2) {
      setResults([]);
      return;
    }

    // Logic: Aggregating results from diverse JSON files
    const filtered = [
      ...dataSources.monsters.filter(m => m.name.toLowerCase().includes(val.toLowerCase()))
        .map(m => ({ ...m, category: 'Monster', icon: '👹' })),
      ...dataSources.spells.filter(s => s.name.toLowerCase().includes(val.toLowerCase()))
        .map(s => ({ ...s, category: 'Spell', icon: '✨' })),
      ...dataSources.items.filter(i => i.name.toLowerCase().includes(val.toLowerCase()))
        .map(i => ({ ...i, category: 'Item', icon: '⚔️' }))
    ].slice(0, 8); // Limit to 8 results for the "Vibe"

    setResults(filtered);
  };

  return (
    <div className={styles.scryingContainer}>
      <div className={styles.scryingOrbit}>
        <input 
          type="text" 
          className={styles.scryingInput}
          placeholder="Peer into the vault..."
          value={query}
          onChange={handleSearch}
        />
      </div>
      
      {results.length > 0 && (
        <ul className={styles.resultsList}>
          {results.map((res, index) => (
            <li key={index} onClick={() => onSelect(res)} className={styles.resultItem}>
              <span className={styles.resultIcon}>{res.icon}</span>
              <div className={styles.resultText}>
                <span className={styles.resultName}>{res.name}</span>
                <span className={styles.resultCategory}>{res.category}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScryingPool;
