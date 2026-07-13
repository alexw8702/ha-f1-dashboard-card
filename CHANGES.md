# v0.6.3-beta.3 — Build & Release Update

**Beta maintenance release: rebuilt dist bundle with v0.6.3-beta.3 version stamp**

- **Version bump:** `0.6.3-beta.3` across `package.json` and `src/main.js`
- **Clean CHANGES.md:** Removed duplicate v0.6.3-beta.2 entry from working tree (was accidentally prepended twice)
- **Rebuilt distribution:** `dist/f1-dashboard-card.js` regenerated with updated version constant
- **No functional changes:** Identical feature set to v0.6.3-beta.2

# v0.6.3-beta.2 — Active Aero_2026 Data Integration + Visualization Updates

**Beta update: Merged structured 2026 Active Aero data into circuits.js for visualization**

- **Active Aero per-turn data now in circuits.js:** 8 circuits (Albert Park, Shanghai, Suzuka, Villeneuve, Monaco, Silverstone, Spa, Monza) now include `activeAero_2026` array with MAX/MID/MIN types and corner speeds — enables future SVG-path-based zone rendering
- **Zone visualization updates in F1SessionCard:**
  - Straight Mode badge now shows "Straight Mode" instead of "DRS-Zonen"
  - New zones badge displaying: overtake opportunities count + MAX/MIN downforce corner counts
  - Detection (orange) / Activation (green) points rendered on track map
  - Zone labels for Straight Mode zones on track
- **Data structure alignment:** `activeAero_2026` in circuits.js matches `ZONES_2026` structure for consistency

# v0.6.3-beta.1 — F1 2026 Circuit Zone Data

**Beta release: F1 2026 technical regulations zone metadata for all 22 circuits**

- **F1 2026 Straight Mode zones:** Complete research and data for pit straight drag-reduction zones across all 22 circuits
- **Active Aero per-corner configuration:** MAX/MID/MIN aerodynamic types for every turn on every circuit based on corner speed profiles
- **Overtake Detection/Activation zones:** Mapped strategic overtaking opportunity locations per official FIA 2026 regulations
- **New composable:** `useCircuitZones()` utility for accessing zone data in Vue components
- **Production-ready data:** Comprehensive zone metadata in `src/data/circuits_2026_zones.js` based on FIA Technical Regulations Articles 10 & 11
- **Spa circuit reference validation:** All zones verified against official 2026 track map provided by user

**Implementation files:**
- `src/data/circuits_2026_zones.js` - Zone metadata for all 22 circuits
- `src/composables/useCircuitZones.js` - Access utilities and summary functions
- `IMPLEMENTATION_F1_2026_ZONES.md` - Detailed integration guide

**No breaking changes:** Existing circuits.js SVG data preserved; zone data is separate and optional.

# v0.6.2 — Session-Karte: zusätzliche Streckenfakten