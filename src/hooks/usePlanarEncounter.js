import { useState } from 'react';
import monstersData from './monsters.json';
import planesData from './planes.json';

export const usePlanarEncounter = () => {
  const [encounter, setEncounter] = useState(null);

  const generateEncounter = (planeName, cr) => {
    // 1. Get Plane Vibe
    const plane = planesData["Appendix PH-C: The Planes of Existence"][planeName];
    
    // 2. Simple logic: Map Plane to Monster Type
    const typeMapping = {
      "The Nine Hells": "fiend (devil)",
      "The Abyss": "fiend (demon)",
      "Mount Celestia": "celestial"
    };

    const targetType = typeMapping[planeName];

    // 3. Filter monsters from the JSON
    // Note: In our current JSON, monsters are nested under 'Monsters (A)', etc.
    const allMonsters = Object.values(monstersData.Monsters).flatMap(category => 
      typeof category === 'object' ? Object.entries(category) : []
    );

    const possibleMonsters = allMonsters.filter(([name, data]) => {
      const stats = data.content?.[0] || "";
      return stats.toLowerCase().includes(targetType) && stats.includes(`challenge ${cr}`);
    });

    if (possibleMonsters.length > 0) {
      const [name, data] = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
      setEncounter({
        name,
        stats: data.content,
        audio_vibe: plane.audio_vibe || "Ominous Ambience" // Default vibe
      });
    }
  };

  return { encounter, generateEncounter };
};
