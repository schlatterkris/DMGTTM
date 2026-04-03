import React from 'react';
// Import the CSS module we created in the previous step
import styles from '../app/Spellbook.module.css';

/**
 * VibeControl Component
 * @param {string} currentVibe - The ID or name of the Pocket Bard station
 * @param {function} onToggle - Optional function to trigger actual audio playback
 */
const VibeControl = ({ currentVibe, onToggle }) => {
  // Logic: The 'active' state is determined by whether a vibe string is passed in
  const isActive = Boolean(currentVibe && currentVibe.length > 0);

  return (
    <div className={styles.vibeContainer}>
      <button 
        onClick={onToggle}
        className={`${styles.audioVibeButton} ${isActive ? styles.audioActive : ''}`}
        aria-label="Toggle Atmosphere"
      >
        {/* Using a span to allow for separate rotation/scaling if desired */}
        <span className={styles.vibeIcon}>
          {isActive ? '🔊' : '🔇'}
        </span>
      </button>
      
      {isActive && (
        <p className={styles.vibeLabel}>
          Current Vibe: <strong>{currentVibe}</strong>
        </p>
      )}
    </div>
  );
};

export default VibeControl;
