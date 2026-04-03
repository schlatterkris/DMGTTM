import React, { useState } from 'react';
import styles from '../styles/Spellbook.module.css';

const EncounterHUD = ({ activeEntities, onRemove, onUpdateHP }) => {
  return (
    <div className={styles.hudContainer}>
      <h2 className={styles.vibeHeader}>⚔️ Active Initiative</h2>
      <div className={styles.hudGrid}>
        {activeEntities.map((entity, index) => (
          <div key={`${entity.name}-${index}`} className={styles.entityMiniCard}>
            <div className={styles.miniHeader}>
              <span className={styles.miniName}>{entity.name}</span>
              <button onClick={() => onRemove(index)} className={styles.closeBtn}>×</button>
            </div>
            
            {/* HP Tracker Logic */}
            <div className={styles.hpControl}>
              <button onClick={() => onUpdateHP(index, -5)}>-5</button>
              <span className={styles.hpDisplay}>❤️ {entity.currentHP}</span>
              <button onClick={() => onUpdateHP(index, 5)}>+5</button>
            </div>

            {/* Roleplay Trait Prompt (from our Regex/JSON logic) */}
            {entity.traits && (
              <p className={styles.miniTrait}>🎭 "{entity.traits[0]}"</p>
            )}
            
            <div className={styles.miniStats}>
              <span>🛡️ AC: {entity.ac}</span>
              <span>🎯 CR: {entity.cr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
