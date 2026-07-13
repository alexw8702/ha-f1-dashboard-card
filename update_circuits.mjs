// Update circuits.js with activeAero_2026 data from ZONES_2026
import fs from 'fs';

const circuitsPath = '/home/alex/Schreibtisch/github/ha-f1-dashboard-card/src/data/circuits.js';
const zonesPath = '/home/alex/Schreibtisch/github/ha-f1-dashboard-card/src/data/circuits_2026_zones.js';

// Read ZONES_2026 - use dynamic import since it's an ES module
const zonesModule = await import('file://' + zonesPath);
const ZONES_2026 = zonesModule.ZONES_2026;

// Read circuits.js
let circuitsContent = fs.readFileSync(circuitsPath, 'utf-8');

// For each circuit in ZONES_2026 that has activeAero, add it to circuits.js
for (const [key, zoneData] of Object.entries(ZONES_2026)) {
  if (zoneData.activeAero) {
    const activeAeroStr = JSON.stringify(zoneData.activeAero, null, 2)
      .replace(/\n/g, '\n      ')
      .replace(/"/g, "'");
    
    // Find the circuit in circuits.js and add activeAero_2026 before the closing }
    // Pattern: circuitKey:{...},  (the circuit entry ends with },)
    const circuitRegex = new RegExp(`(${key}:\\{[\\s\\S]*?)(\\s*\\},\\n)`);
    
    circuitsContent = circuitsContent.replace(circuitRegex, (match, prefix, suffix) => {
      // Check if activeAero_2026 already exists
      if (prefix.includes('activeAero_2026')) {
        return match; // Already has it
      }
      // Add activeAero_2026 before the closing }
      return `${prefix},activeAero_2026:[${activeAeroStr.slice(2, -2)}]${suffix}`;
    });
  }
}

fs.writeFileSync(circuitsPath, circuitsContent);
console.log('Updated circuits.js with activeAero_2026 data');
