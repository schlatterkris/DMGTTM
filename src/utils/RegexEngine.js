export const AdventureScanner = {
  // Logic: Identify Stat Blocks (Monsters/NPCs)
  // Look for: Name followed by Size/Type, then the Ability Score cluster
  findEntities: (text) => {
    const entityRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\n(?:(Tiny|Small|Medium|Large|Huge|Gargantuan)\s(.*?)\n)?[\s\S]*?STR\s*DEX\s*CON[\s\S]*?Challenge\s*([\d\/]+)/g;
    
    const matches = [];
    let match;
    while ((match = entityRegex.exec(text)) !== null) {
      matches.push({
        name: match[1],
        size: match[2],
        type: match[3],
        cr: match[4],
        index: match.index
      });
    }
    return matches;
  },

  // Logic: Identify Character Traits for Storytelling
  // Look for: "Personality Traits", "Ideals", "Bonds", "Flaws"
  findTraits: (text) => {
    const traitRegex = /(?:Personality Traits|Ideals|Bonds|Flaws):\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi;
    
    const traits = [];
    let match;
    while ((match = traitRegex.exec(text)) !== null) {
      traits.push(match[1].trim());
    }
    return traits;
  }
};
