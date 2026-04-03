import React from 'react';
import styles from '../styles/Spellbook.module.css';

const CONDITIONS = ["Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious"];

const ConditionTracker = ({ entity, onUpdateConditions }) => {
  const toggleCondition = (cond) => {
    const newConditions = entity.conditions.includes(cond)
      ? entity.conditions.filter(c => c !== cond)
      : [...entity.conditions, cond];
    onUpdateConditions(entity.instanceId, newConditions);
  };

  return (
    <div className={styles.conditionSubMenu}>
      <div className={styles.activeConditionIcons}>
        {entity.conditions.map(c => (
          <span key={c} className={styles.conditionBadge} title={c}>
            {c.charAt(0)} {/* Display first letter or a small icon */}
          </span>
        ))}
      </div>
      
      {/* Scrollable list of common conditions */}
      <div className={styles.conditionPicker}>
        {CONDITIONS.map(c => (
          <button 
            key={c} 
            className={entity.conditions.includes(c) ? styles.condActive : styles.condInactive}
            onClick={() => toggleCondition(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};
