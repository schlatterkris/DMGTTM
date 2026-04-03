import React from 'react';
import styles from '../styles/Spellbook.module.css';

export const LegendaryTracker = ({ count, used, onToggle }) => {
  // Logic: Create an array based on the count (usually 3)
  const gems = Array.from({ length: count });

  return (
    <div className={styles.gemContainer}>
      <span className={styles.gemLabel}>LEGENDARY ACTIONS</span>
      <div className={styles.gemRow}>
        {gems.map((_, i) => (
          <div 
            key={i}
            className={`${styles.soulGem} ${i < (count - used) ? styles.glowing : styles.dim}`}
            onClick={() => onToggle(i)}
            title="Click to spend/regain"
          />
        ))}
      </div>
    </div>
  );
};
