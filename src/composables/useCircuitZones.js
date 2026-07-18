// useCircuitZones - Utility to access F1 2026 zone data
// Provides Straight Mode, Active Aero, and Overtake zone information

import { ZONES_2026 } from '../data/circuits_2026_zones.js';

export function useCircuitZones(circuitKey) {
  const zoneData = ZONES_2026[circuitKey];
  
  return {
    // Straight Mode zones, always as an array (older per-circuit data still has a single object)
    getStraightModeZones: () => {
      const sm = zoneData?.straightMode
      if (!sm) return []
      return Array.isArray(sm) ? sm : [sm]
    },

    // Get all overtake zones (detection, activation, secondary)
    getOvertakeZones: () => zoneData?.overtakeZones || [],
    
    // Get specific overtake zone by type
    getOvertakeZoneByType: (type) => {
      return zoneData?.overtakeZones?.find(z => z.type === type);
    },
    
    // Active Aero configuration for a specific turn
    getActiveAeroForTurn: (turn) => {
      if (!zoneData?.activeAero) return null;
      return zoneData.activeAero.find(a => a.turn === turn);
    },
    
    // Get all Active Aero config
    getAllActiveAeroConfig: () => zoneData?.activeAero || [],
    
    // Get Active Aero zones grouped by type (MAX, MID, MIN)
    getActiveAeroByType: (type) => {
      if (!zoneData?.activeAero) return [];
      return zoneData.activeAero.filter(a => a.type === type);
    },
    
    // For dashboard visualization
    getSummary: () => ({
      circuit: zoneData?.name,
      straightMode: (Array.isArray(zoneData?.straightMode)
        ? zoneData.straightMode.map(s => s.description).join(' + ')
        : zoneData?.straightMode?.description) || "N/A",
      overtakingOpportunities: zoneData?.overtakeZones?.length || 0,
      totalCorners: zoneData?.activeAero?.length || 0,
      maxDownforceCorners: zoneData?.activeAero?.filter(a => a.type === "MAX").length || 0,
      minDownforceCorners: zoneData?.activeAero?.filter(a => a.type === "MIN").length || 0
    })
  };
}
