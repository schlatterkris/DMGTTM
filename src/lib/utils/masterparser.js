import monsters from '@/data/monsters.json';
import npcs from '@/data/npcs.json';
import creatures from '@/data/creatures.json';

/**
 * MASTER PARSER
 * Purpose: Aggregates all creature-like data into a single searchable index.
 */

// 1. Logic: Flatten the nested JSONs into a single library
const vaultLibrary = {
  // Pull from monsters.json (The "Monsters" key)
  ...monsters.Monsters,
  
  // Pull from npcs.json (The "Appendix MM-B: Nonplayer Characters" key)
  ...npcs["Appendix MM-B: Nonplayer Characters"],
  
  // Pull from creatures.json (The "Appendix MM-A: Miscellaneous Creatures" key)
  ...creatures["Appendix MM-A: Miscellaneous Creatures"]
};

/**
 * Finds a creature by name across all indexed files.
 * @param {string} name - The name of the creature (e.g., "Aboleth")
 * @returns {Object|null} - Returns the monster data or null if not found.
 */
export const findInVault = (name) => {
  if (!name) return null;

  // Logic: Case-insensitive search
  const key = Object.keys(vaultLibrary).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );

  if (!key) {
    console.warn(`🕵️ Master Parser: '${name}' not found in any scroll.`);
    return null;
  }

  return {
    name: key,
    ...vaultLibrary[key]
  };
};

/**
 * Returns a list of all names for autocomplete/search bars.
 */
export const getVaultIndex = () => {
  return Object.keys(vaultLibrary).filter(key => key !== 'content');
};
