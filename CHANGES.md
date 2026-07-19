# v0.6.5-beta.2 — Hotfix: Streckenkarten-Overlays (Spa) wieder sichtbar

**Bugfix: die in v0.6.4-beta.1 eingeführten Straight-Mode-Zonen/Turn-Marker auf der Streckenkarte waren beim Merge der v0.6.5-beta.1-Änderungen versehentlich wieder entfernt worden**

- `F1SessionCard.ce.vue` wurde beim Zusammenführen der Timing-Tabelle/Startaufstellung-Änderungen von einer veralteten Basis überschrieben, die das Zonen-/Turn-Rendering aus v0.6.4-beta.1 noch nicht enthielt — die Streckenkarte fiel dadurch stillschweigend auf die alte Darstellung zurück
- Sauber per 3-Way-Merge zusammengeführt: beide Feature-Sets (Zonen-Overlay + Timing/Grid) sind jetzt gemeinsam vorhanden
- Neue Regressionstests (`.track-straight-mode`, `.turn-label`) verhindern, dass das künftig unbemerkt erneut passiert

# v0.6.5-beta.1 — Session Card: Timing-Tabelle und Startaufstellung mit Strafen-Kennzeichnung

**Beta-Feature: Live/letzte Session-Zeiten und Startaufstellung inkl. Strafen-Hinweis direkt in der Session Card**

- **Timing-Tabelle:** zeigt während einer laufenden Session die Live-Positionen/Zeiten (`sensor.f1_dashboard_live_timing_tower`), sonst das Ergebnis der zuletzt abgeschlossenen Session — Training, Sprint, Qualifying oder Rennen (neuer Backend-Sensor `sensor.f1_dashboard_letzte_session`, Integration ≥ v0.5.0-beta.1 erforderlich)
- **Startaufstellung:** Grid-Position neben Qualifying-Position, Strafen visuell markiert (⚠️ mit Tooltip zur Begründung, sofern bekannt) — neuer Backend-Sensor `sensor.f1_dashboard_startaufstellung`
- **Provisorisch-Hinweis:** solange die FIA-Startaufstellung noch nicht offiziell feststeht, zeigt die Karte einen Hinweis statt falsche Sicherheit vorzutäuschen
- **Kein Breaking Change:** beide Abschnitte erscheinen nur, wenn die jeweiligen Sensoren vorhanden sind und Daten liefern — mit einer älteren Integration bleibt die Karte unverändert

# v0.6.4-beta.1 — Spa & Red Bull Ring: Straight-Mode-Zonen auf der Streckenkarte

**Beta-Feature: Straight-Mode-Zonen und Turn-Nummern werden jetzt direkt auf der SVG-Streckenkarte eingezeichnet, nicht mehr nur als Text-Badge**

- **Neue Streckenkarten-Overlays:** rot gestrichelte Straight-Mode-Zonen entlang der echten Streckenführung (Spa: 5 Zonen, Red Bull Ring: 3 Zonen), nummerierte Turn-Marker an jeder Kurve
- **Spa gegen offizielle 2026-Referenzkarte verifiziert:** Zonen-Grenzen und Turn-Positionen über Bogenlängen-Abgleich der Outline-Geometrie kalibriert
- **Red Bull Ring neu integriert:** Straight-Mode-Zonen, Turn-Labels, korrigierte Overtake Detection/Activation-Positionen
- **Rendering:** `F1SessionCard.ce.vue` zeichnet `straightModeZones`/`turnLabels` aus `circuits.js`, wenn vorhanden; Strecken ohne diese Felder fallen weiterhin auf die bisherige Aero-Zonen-Darstellung zurück (kein Breaking Change)
- **Weitere Strecken folgen:** Recherche und Kalibrierung für die restlichen 20 Strecken läuft, wird in kommenden Beta-Releases nachgezogen

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