import React, { useState } from 'react';
import spellsData from '../data/spells.json'; // Logic: Our master spell library
import styles from '../styles/Spellbook.module.css';

// Pre-index for performance
const spellMap = new Map(spellsData.map(s => [s.name.toLowerCase(), s]));

export const SpellLink = ({ spellName }) => {
  const [visible, setVisible] = useState(false);
  const spell = spellMap.get(spellName.toLowerCase().replace(/\*/g, ''));

  if (!spell) return <span>{spellName}</span>;

  return (
    <span 
      className={styles.spellLink}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {spellName}
      {visible && (
        <div className={styles.spectralScroll}>
          <div className={styles.scrollHeader}>
            <strong>{spell.name}</strong>
            <span>{spell.level} • {spell.school}</span>
          </div>
          <p className={styles.scrollBody}>{spell.description}</p>
          <div className={styles.scrollFooter}>
            Range: {spell.range} | Time: {spell.casting_time}
          </div>
        </div>
      )}
    </span>
  );
};
