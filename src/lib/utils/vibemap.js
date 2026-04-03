/**
 * lib/utils/vibeMap.js
 * The logic that bridges JSON data to Pocket Bard audio stations.
 */

const STATION_MAP = {
  // Creature Types
  undead: "Ominous Shadows",
  fiend: "Abyssal Winds",
  dragon: "Ancient Roar",
  fey: "Enchanted Forest",
  aberration: "Eldritch Horror",
  beast: "Wilderness Hunt",
  humanoid: "Bustling Tavern",
  construct: "Clockwork Laboratory",
  
  // Alignments / Environments
  evil: "Dark Cult",
  good: "Celestial Hymn",
  water: "Deep Sea",
  fire: "Infernal Pit"
};

export const getPocketBardStation = (creatureData) => {
  if (!creatureData || !creatureData.content) return "Dungeon Ambience";

  // Combine the first few lines of content to find keywords
  const traits = creatureData.content.slice(0, 3).join(" ").toLowerCase();

  // Search for matches in our STATION_MAP
  for (const [keyword, station] of Object.entries(STATION_MAP)) {
    if (traits.includes(keyword)) {
      return station;
    }
  }

  return "Dungeon Ambience"; // Default Vibe
};
