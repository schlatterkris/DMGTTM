import React, { useState, useEffect } from 'react';
import styles from '../styles/Spellbook.module.css';

const TacticalHUD = ({ activeEncounter, updateEntity }) => {
  // Logic: Quick HP Adjuster
  const handleHealth = (id, amount) => {
    const entity = activeEncounter.find(e => e.instanceId === id);
    const newHP = Math.max(0, entity.currentHP + amount);
    updateEntity(id, { currentHP: newHP });
  };

  return (
    <div className={styles.tacticalBar}>
      {activeEncounter.map((entity) => (
        <div key={entity.instanceId} className={`${styles.hudToken} ${entity.currentHP === 0 ? styles.defeated : ''}`}>
          <div className={styles.tokenMain}>
            <span className={styles.tokenName}>{entity.name}</span>
            <div className={styles.hpBadge}>
               <button onClick={() => handleHealth(entity.instanceId, -5)}>-</button>
               <span className={styles.hpText}>{entity.currentHP}/{entity.maxHP}</span>
               <button onClick={() => handleHealth(entity.instanceId, 5)}>+</button>
            </div>
          </div>
          
          {/* The 'Hidden Connection' Logic */}
          <div className={styles.connectionHint}>
            {entity.deity && <span>🙏 {entity.deity}</span>}
            {entity.audio_vibe && <span>🔊 {entity.audio_vibe}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
