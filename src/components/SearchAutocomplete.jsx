import React, { useState, useEffect } from 'react';
import { getVaultIndex } from '@/lib/utils/masterParser';

export default function SearchAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load the full index once when the component mounts
  useEffect(() => {
    setAllNames(getVaultIndex());
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 1) {
      const filtered = allNames
        .filter(name => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8); // Keep the scroll short
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (name) => {
    setQuery(name);
    setIsOpen(false);
    onSelect(name); // Pass the chosen name back to the main Dashboard
  };

  return (
    <div className="relative w-full">
      <input 
        type="text"
        className="w-full p-3 bg-vault-paper text-vault-ink border-2 border-vault-blood font-bold placeholder:italic focus:outline-none"
        placeholder="Type to summon (e.g., Beholder)..."
        value={query}
        onChange={handleChange}
        onFocus={() => query.length > 1 && setIsOpen(true)}
      />

      {/* THE SUGGESTIONS SCROLL */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-vault-paper border-2 border-t-0 border-vault-blood shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((name, idx) => (
            <li 
              key={idx}
              onClick={() => handleSelect(name)}
              className="p-2 hover:bg-vault-blood hover:text-vault-paper cursor-pointer font-uncial text-sm border-b border-vault-blood/10 last:border-0 transition-colors"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
