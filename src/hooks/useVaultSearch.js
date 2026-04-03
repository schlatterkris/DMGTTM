import { useState, useMemo } from 'react';
import monsters from '../data/monsters.json';
import spells from '../data/spells.json';
import items from '../data/magic_items.json';

export const useVaultSearch = (query) => {
  return useMemo(() => {
    if (!query || query.length < 3) return { monsters: [], spells: [], items: [] };

    const lowerQuery = query.toLowerCase();

    // Logic: Filter across all three major datasets
    return {
      monsters: Object.values(monsters).filter(m => 
        m.name.toLowerCase().includes(lowerQuery) || 
        m.type?.toLowerCase().includes(lowerQuery)
      ),
      spells: spells.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        s.description.toLowerCase().includes(lowerQuery)
      ),
      items: Object.values(items).filter(i => 
        i.name.toLowerCase().includes(lowerQuery)
      )
    };
  }, [query]);
};
