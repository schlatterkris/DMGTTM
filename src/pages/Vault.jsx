import React, { useState } from 'react';
import ScryingPool from '../components/ScryingPool';
import StatBlock from '../components/StatBlock';
import VibeControl from '../components/VibeControl';
// Import your JSON data
import monsters from '../data/monsters.json';
import spells from '../data/spells.json';
import items from '../data/magic_items.json';

const Vault = () => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeVibe, setActiveVibe] = useState("");

  // Logic: The 'Cast' function
  const castToRenderer = (entity) => {
    setSelectedEntity(entity);
    
    // Logic: Connect the Vibe!
    // If the entity has a vibe, set it; otherwise, check its category
    const newVibe = entity.audio_vibe || (entity.category === 'Monster' ? 'Dungeon Ambience' : 'Mystic Hum');
    setActiveVibe(newVibe);

    // Vibe Polish: Scroll to the stat block automatically
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="vault-wrapper">
      {/* 1. The Scrying Pool (Input) */}
      <ScryingPool 
        dataSources={{ monsters, spells, items }} 
        onSelect={castToRenderer} 
      />

      {/* 2. The Parchment Page (Output) */}
      <div className="parchment-page">
        {selectedEntity ? (
          <StatBlock 
            entityName={selectedEntity.name} 
            content={selectedEntity.content} 
          />
        ) : (
          <div className="placeholder-text">
            <p>Speak a name into the water to summon its secrets...</p>
          </div>
        )}
      </div>

      {/* 3. The Atmosphere (Global Audio) */}
      <VibeControl currentVibe={activeVibe} />
    </div>
  );
};

export default Vault;
