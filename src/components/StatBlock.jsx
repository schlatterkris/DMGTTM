import React from 'react';
import styles from '../styles/Spellbook.module.css';

// Logic: Parsing Markdown-lite strings into JSX
const formatText = (text) => {
  if (typeof text !== 'string') return text;
  
  // Handle ***Action Name.*** or **Stat Name**
  const formatted = text
    .replace(/\*\*\*(.*?)\.\*\*\*/g, '<strong class="action-title">$1.</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="stat-label">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

const AbilityTable = ({ table }) => (
  <div className={styles.abilityGrid}>
    {Object.entries(table).map(([stat, value]) => (
      <div key={stat} className={styles.abilityScore}>
        <span className={styles.statName}>{stat}</span>
        <span className={styles.statValue}>{value[0]}</span>
      </div>
    ))}
  </div>
);

const StatBlock = ({ entityName, content }) => {
  if (!content) return null;

  return (
    <div className={styles.statBlockWrapper}>
      <h1 className={styles.entityTitle}>{entityName}</h1>
      
      {content.map((item, index) => {
        // 1. Logic: Render Tables (Ability Scores)
        if (typeof item === 'object' && item.table) {
          return <AbilityTable key={index} table={item.table} />;
        }

        // 2. Logic: Render Dividers
        if (item === "Actions" || item === "Legendary Actions") {
          return <h3 key={index} className={styles.sectionHeader}>{item}</h3>;
        }

        // 3. Logic: Render Text Strings
        return (
          <p key={index} className={styles.statText}>
            {formatText(item)}
          </p>
        );
      })}
    </div>
  );
};

export default StatBlock;
