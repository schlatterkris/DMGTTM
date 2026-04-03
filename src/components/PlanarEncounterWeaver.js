import React, { useState } from 'react';

// Logic: Pulling from multiple JSON sources to create a cohesive scene
export const PlanarEncounterWeaver = ({ monsters, planes }) => {
  const [encounter, setEncounter] = useState(null);

  const generateEncounter = (selectedPlaneName) => {
    // 1. Conflict Resolver: Check if Plane exists
    const plane = planes.find(p => p.name === selectedPlaneName);
    if (!plane) {
      console.error("🚩 Conflict: Plane not found in planes.json!");
      return;
    }

    // 2. Filter Monsters (Example: CR 1-5 that fit the plane's vibe)
    const localMonsters = monsters.filter(m => m.environment?.includes(selectedPlaneName));
    const randomMonster = localMonsters[Math.floor(Math.random() * localMonsters.length)];

    // 3. Inject Audio Vibe (The Pocket Bard Link)
    const audioVibe = plane.name === "Shadowfell" ? "Ominous Shadows" : "Bustling Market";

    setEncounter({
      monster: randomMonster,
      location: plane,
      audio: audioVibe,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="spellbook-container">
      <button onClick={() => generateEncounter("Shadowfell")}>
        Weave Shadowfell Encounter
      </button>

      {encounter && (
        <div className="parchment-scroll">
          <h2>{encounter.monster.name}</h2>
          <p><i>Location: {encounter.location.name}</i></p>
          <div className="audio-badge">
            🔊 Current Vibe: <strong>{encounter.audio}</strong>
          </div>
          <pre>{JSON.stringify(encounter.monster.stats, null, 2)}</pre>
          
          <button onClick={() => downloadSession(encounter)}>
            Export Session to JSON
          </button>
        </div>
      )}
    </div>
  );
};

// JSON Exporter: Save state back to master logic
const downloadSession = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `encounter_${data.timestamp}.json`;
  link.click();
};
