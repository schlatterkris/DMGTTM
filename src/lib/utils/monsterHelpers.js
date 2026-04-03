// lib/utils/monsterHelpers.js
import monsterData from '@/data/monsters.json';

export const getMonsterByName = (name) => {
  // Logic to search through your nested JSON categories
  return monsterData.Monsters[name] || null;
};
