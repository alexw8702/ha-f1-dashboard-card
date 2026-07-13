// F1 2026 Zones Metadata - Straight Mode, Active Aero, Overtake Detection/Activation
// This file extends CIRCUITS with 2026 regulatory zone definitions
// Usage: const circuit = enrichCircuitWithZones(CIRCUITS[name], ZONES_2026[name])

export const ZONES_2026 = {
  albert_park: {
    name: "Albert Park",
    straightMode: { turns: [1, 3], length: 450, description: "Pit straight" },
    overtakeZones: [
      { type: "detection", turn: 13, zone: "Turn 13" },
      { type: "activation", turn: 14, zone: "Turn 14" },
      { type: "secondary", turns: [1, 2], zone: "Main straight" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 100 },
      { turn: 2, type: "MID", speed: 180 },
      { turn: 3, type: "MIN", speed: 280 },
      { turn: 4, type: "MIN", speed: 300 },
      { turn: 5, type: "MID", speed: 200 },
      { turn: 6, type: "MAX", speed: 80 },
      { turn: 7, type: "MID", speed: 190 },
      { turn: 8, type: "MIN", speed: 250 },
      { turn: 9, type: "MID", speed: 220 },
      { turn: 10, type: "MID", speed: 210 },
      { turn: 11, type: "MID", speed: 180 },
      { turn: 12, type: "MIN", speed: 260 },
      { turn: 13, type: "MAX", speed: 90 },
      { turn: 14, type: "MID", speed: 200 }
    ]
  },

  spa: {
    name: "Spa-Francorchamps",
    straightMode: { turns: [1, 5], length: 450, description: "Pit straight through Eau Rouge approach" },
    overtakeZones: [
      { type: "detection", turn: 17, zone: "Bus Stop chicane" },
      { type: "activation", turn: 18, zone: "Bus Stop exit" },
      { type: "secondary", turns: [1, 2], zone: "Main straight" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 85, notes: "La Source" },
      { turn: 2, type: "MID", speed: 150 },
      { turn: 3, type: "MID", speed: 180 },
      { turn: 4, type: "MID", speed: 200 },
      { turn: 5, type: "MIN", speed: 380, notes: "Eau Rouge" },
      { turn: 6, type: "MIN", speed: 500, notes: "Eau Rouge high" },
      { turn: 7, type: "MIN", speed: 450 },
      { turn: 8, type: "MIN", speed: 320 },
      { turn: 9, type: "MIN", speed: 300 },
      { turn: 10, type: "MID", speed: 240 },
      { turn: 11, type: "MID", speed: 220 },
      { turn: 12, type: "MID", speed: 200 },
      { turn: 13, type: "MID", speed: 190 },
      { turn: 14, type: "MID", speed: 210 },
      { turn: 15, type: "MID", speed: 420, notes: "Pouhon" },
      { turn: 16, type: "MID", speed: 350 },
      { turn: 17, type: "MAX", speed: 70, notes: "Bus Stop" },
      { turn: 18, type: "MAX", speed: 80, notes: "Bus Stop exit" },
      { turn: 19, type: "MID", speed: 180 }
    ]
  },

  silverstone: {
    name: "Silverstone",
    straightMode: { turns: [1, 3], length: 580, description: "Wellington straight" },
    overtakeZones: [
      { type: "detection", turn: 18, zone: "Turn 18" },
      { type: "activation", turn: 1, zone: "Turn 1" },
      { type: "secondary", turns: [7, 8], zone: "Turn 7-8" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 100 },
      { turn: 2, type: "MID", speed: 190 },
      { turn: 3, type: "MIN", speed: 280 },
      { turn: 4, type: "MIN", speed: 320 },
      { turn: 5, type: "MIN", speed: 300 },
      { turn: 6, type: "MIN", speed: 280, notes: "Copse" },
      { turn: 7, type: "MID", speed: 240 },
      { turn: 8, type: "MID", speed: 220 },
      { turn: 9, type: "MIN", speed: 270 },
      { turn: 10, type: "MIN", speed: 290 },
      { turn: 11, type: "MID", speed: 210 },
      { turn: 12, type: "MID", speed: 190 },
      { turn: 13, type: "MID", speed: 200 },
      { turn: 14, type: "MIN", speed: 300 },
      { turn: 15, type: "MIN", speed: 320 },
      { turn: 16, type: "MID", speed: 180 },
      { turn: 17, type: "MIN", speed: 260 },
      { turn: 18, type: "MAX", speed: 95 }
    ]
  },

  monza: {
    name: "Monza",
    straightMode: { turns: [1, 2], length: 750, description: "Main straight and Parabolica" },
    overtakeZones: [
      { type: "detection", turn: 12, zone: "Turn 12" },
      { type: "activation", turn: 13, zone: "Turn 13" },
      { type: "secondary", turns: [1, 2], zone: "Main straight" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 110, notes: "Monza corner" },
      { turn: 2, type: "MIN", speed: 380, notes: "Parabolica" },
      { turn: 3, type: "MID", speed: 220 },
      { turn: 4, type: "MID", speed: 200 },
      { turn: 5, type: "MIN", speed: 300 },
      { turn: 6, type: "MIN", speed: 320 },
      { turn: 7, type: "MIN", speed: 350 },
      { turn: 8, type: "MID", speed: 180 },
      { turn: 9, type: "MAX", speed: 100 },
      { turn: 10, type: "MID", speed: 210 },
      { turn: 11, type: "MID", speed: 190 }
    ]
  },

  shanghai: {
    name: "Shanghai International Circuit",
    straightMode: { turns: [1, 2], length: 520 },
    overtakeZones: [
      { type: "detection", turn: 14, zone: "Turn 14" },
      { type: "activation", turn: 15, zone: "Turn 15" },
      { type: "secondary", turns: [1, 2], zone: "Main straight" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 95 },
      { turn: 2, type: "MIN", speed: 300 },
      { turn: 3, type: "MAX", speed: 85 },
      { turn: 4, type: "MID", speed: 200 },
      { turn: 5, type: "MIN", speed: 320 },
      { turn: 6, type: "MID", speed: 210 },
      { turn: 7, type: "MID", speed: 180 },
      { turn: 8, type: "MIN", speed: 280 },
      { turn: 9, type: "MID", speed: 200 },
      { turn: 10, type: "MAX", speed: 90 },
      { turn: 11, type: "MID", speed: 220 },
      { turn: 12, type: "MIN", speed: 300 },
      { turn: 13, type: "MID", speed: 190 },
      { turn: 14, type: "MAX", speed: 100 },
      { turn: 15, type: "MID", speed: 210 },
      { turn: 16, type: "MID", speed: 200 }
    ]
  },

  suzuka: {
    name: "Suzuka International Racing Course",
    straightMode: { turns: [1, 2], length: 580 },
    overtakeZones: [
      { type: "detection", turn: 16, zone: "16R (100R area)" },
      { type: "activation", turn: 1, zone: "Turn 1 hairpin" },
      { type: "secondary", turns: null, zone: "100R" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 120, notes: "Hairpin" },
      { turn: 2, type: "MIN", speed: 380 },
      { turn: 3, type: "MID", speed: 240 },
      { turn: 4, type: "MIN", speed: 350 },
      { turn: 5, type: "MIN", speed: 380 },
      { turn: 6, type: "MIN", speed: 400 },
      { turn: 7, type: "MAX", speed: 100 },
      { turn: 8, type: "MIN", speed: 350 },
      { turn: 9, type: "MID", speed: 180 },
      { turn: 10, type: "MIN", speed: 320 },
      { turn: 11, type: "MIN", speed: 400, notes: "130R" },
      { turn: 12, type: "MID", speed: 220 },
      { turn: 13, type: "MAX", speed: 110 },
      { turn: 14, type: "MIN", speed: 300 },
      { turn: 15, type: "MID", speed: 240 },
      { turn: 16, type: "MIN", speed: 380, notes: "100R" }
    ]
  },

  villeneuve: {
    name: "Circuit Gilles Villeneuve",
    straightMode: { turns: [1, 3], length: 620 },
    overtakeZones: [
      { type: "detection", turn: 12, zone: "Turn 12" },
      { type: "activation", turn: 14, zone: "Turn 14" },
      { type: "secondary", turns: [1, 2], zone: "Main straight" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 105 },
      { turn: 2, type: "MIN", speed: 300 },
      { turn: 3, type: "MID", speed: 210 },
      { turn: 4, type: "MAX", speed: 95 },
      { turn: 5, type: "MID", speed: 200 },
      { turn: 6, type: "MID", speed: 190 },
      { turn: 7, type: "MAX", speed: 100 },
      { turn: 8, type: "MID", speed: 210 },
      { turn: 9, type: "MIN", speed: 280 },
      { turn: 10, type: "MID", speed: 200 },
      { turn: 11, type: "MID", speed: 180 },
      { turn: 12, type: "MAX", speed: 90 },
      { turn: 13, type: "MID", speed: 220 },
      { turn: 14, type: "MID", speed: 210 }
    ]
  },

  // Remaining 15 circuits (abbreviated for deployment)
  // Structure template shown above - each circuit needs:
  // - straightMode: { turns, length, description }
  // - overtakeZones: array of detection/activation/secondary zones
  // - activeAero: per-turn configuration array

  monaco: {
    name: "Circuit de Monaco",
    straightMode: { turns: [1, 4], length: 350 },
    overtakeZones: [
      { type: "detection", turn: 16, zone: "Portier" },
      { type: "activation", turn: 17, zone: "Grand Hotel Hairpin" }
    ],
    activeAero: [
      { turn: 1, type: "MAX", speed: 100 },
      { turn: 2, type: "MID", speed: 180 },
      { turn: 3, type: "MAX", speed: 75 },
      { turn: 4, type: "MID", speed: 160 },
      { turn: 5, type: "MAX", speed: 85 },
      { turn: 6, type: "MIN", speed: 280 },
      { turn: 7, type: "MAX", speed: 70 },
      { turn: 8, type: "MID", speed: 170 },
      { turn: 9, type: "MAX", speed: 80 },
      { turn: 10, type: "MID", speed: 190 },
      { turn: 11, type: "MIN", speed: 240 },
      { turn: 12, type: "MAX", speed: 95 },
      { turn: 13, type: "MAX", speed: 90 },
      { turn: 14, type: "MID", speed: 150 },
      { turn: 15, type: "MID", speed: 170 },
      { turn: 16, type: "MAX", speed: 100 },
      { turn: 17, type: "MAX", speed: 85 },
      { turn: 18, type: "MID", speed: 160 },
      { turn: 19, type: "MID", speed: 180 }
    ]
  },

  barcelona: { // Catalunya
    name: "Circuit de Barcelona-Catalunya",
    straightMode: { turns: [1, 2], length: 600 },
    overtakeZones: [
      { type: "detection", turn: 16, zone: "Turn 16" },
      { type: "activation", turn: 1, zone: "Turn 1" },
      { type: "secondary", turns: [5, 6], zone: "Turn 5-6" }
    ]
  },

  red_bull_ring: {
    name: "Red Bull Ring",
    straightMode: { turns: [1, 3], length: 500 },
    overtakeZones: [
      { type: "detection", turn: 10, zone: "Turn 10" },
      { type: "activation", turn: 1, zone: "Turn 1" },
      { type: "secondary", turns: [3, 4], zone: "Turn 3-4" }
    ]
  },

  miami: {
    name: "Miami International Autodrome",
    straightMode: { turns: [1, 2], length: 600 },
    overtakeZones: [
      { type: "detection", turn: 16, zone: "Turn 16" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  baku: {
    name: "Baku City Circuit",
    straightMode: { turns: [1, 4], length: 730 },
    overtakeZones: [
      { type: "detection", turn: 20, zone: "Turn 20" },
      { type: "activation", turn: 1, zone: "Turn 1" },
      { type: "secondary", turns: [7, 8], zone: "Turn 7-8" }
    ]
  },

  madring: { // Madrid
    name: "Circuit de Madrid",
    straightMode: { turns: [1, 3], length: 600 },
    overtakeZones: [
      { type: "detection", turn: 12, zone: "Turn 12" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  marina_bay: { // Singapore
    name: "Marina Bay Street Circuit",
    straightMode: { turns: [1, 4], length: 520 },
    overtakeZones: [
      { type: "detection", turn: 18, zone: "Turn 18" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  hungaroring: {
    name: "Hungaroring",
    straightMode: { turns: [1, 2], length: 400 },
    overtakeZones: [
      { type: "detection", turn: 13, zone: "Turn 13" },
      { type: "activation", turn: 14, zone: "Turn 14" }
    ]
  },

  zandvoort: {
    name: "Circuit Zandvoort",
    straightMode: { turns: [1, 3], length: 490 },
    overtakeZones: [
      { type: "detection", turn: 15, zone: "Turn 15" },
      { type: "activation", turn: 1, zone: "Turn 1" },
      { type: "secondary", turns: [7, 8], zone: "Turn 7-8" }
    ]
  },

  vegas: { // Las Vegas
    name: "Las Vegas Grand Prix",
    straightMode: { turns: [1, 3], length: 780 },
    overtakeZones: [
      { type: "detection", turn: 17, zone: "Turn 17" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  americas: { // Austin
    name: "Circuit of The Americas",
    straightMode: { turns: [1, 2], length: 650 },
    overtakeZones: [
      { type: "detection", turn: 15, zone: "Turn 15" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  rodriguez: { // Mexico City
    name: "Autódromo Hermanos Rodríguez",
    straightMode: { turns: [1, 2], length: 630 },
    overtakeZones: [
      { type: "detection", turn: 16, zone: "Turn 16" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  interlagos: { // Brazil
    name: "Autódromo José Carlos Pace",
    straightMode: { turns: [1, 3], length: 610 },
    overtakeZones: [
      { type: "detection", turn: 16, zone: "Turn 16" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  losail: { // Qatar
    name: "Lusail International Circuit",
    straightMode: { turns: [1, 4], length: 700 },
    overtakeZones: [
      { type: "detection", turn: 20, zone: "Turn 20" },
      { type: "activation", turn: 1, zone: "Turn 1" }
    ]
  },

  yas_marina: { // Abu Dhabi
    name: "Yas Marina Circuit",
    straightMode: { turns: [1, 3], length: 750 },
    overtakeZones: [
      { type: "detection", turn: 21, zone: "Turn 21" },
      { type: "activation", turn: 1, zone: "Turn 1" },
      { type: "secondary", turns: [9, 10], zone: "Turn 9-10" }
    ]
  },

  imola: {
    name: "Autodromo Enzo e Dino Ferrari",
    straightMode: { turns: [1, 2], length: 520 },
    overtakeZones: [
      { type: "detection", turn: 15, zone: "Turn 15" },
      { type: "activation", turn: 16, zone: "Turn 16" }
    ]
  }
};

// Utility function to enrich circuit data with 2026 zones
export function enrichCircuitWithZones(circuit, zones) {
  return {
    ...circuit,
    straightMode_2026: zones?.straightMode,
    overtakeZones_2026: zones?.overtakeZones,
    activeAero_2026: zones?.activeAero
  };
}
