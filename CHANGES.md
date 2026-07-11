# v0.6.0 — Responsive Design + Validierung

- Alle vier Karten nutzen ab 600 px Breite ein zweispaltiges Layout:
  - **Fahrerwertung:** Tabelle teilt sich automatisch in der Hälfte in zwei Spalten.
  - **Konstrukteurswertung:** Zweite Spalte zeigt die Fahrer des Teams mit WM-Position und Punkten.
  - **Session-Karte:** Countdown + Zeitplan links, Wetter rechts.
  - **Letztes-Rennen-Karte:** Podium + Klassement links, Reifen-Strategie + Boxenstopps rechts.
- `npm run test:ci` baut das Bundle, prüft die Syntax und führt alle JSDOM-Tests aus.
- Der aktive Session-Status (`active_session`) ist mit einem LIVE-Badge-Test abgedeckt.
- Die dokumentierte Entität für den Rennrückblick lautet `sensor.f1_dashboard_letztes_rennen_detail`.

# v0.4.0 — Vue 3 Redesign: Änderungen gegenüber v0.3.1

## 🎨 Design

| Aspekt | v0.3.x | v0.4.0 |
|--------|--------|--------|
| Framework | Vanilla JS | Vue 3 |
| Styling | Inline CSS | scoped SFC |
| Ästhetik | Modern minimalist | Carbon Dark + F1 Red |
| Farbschema | Türkis/Neutral | Carbon (#101017) + Rot (#e10600) + Teal (#00e6c3) |
| Mobile | Responsive | Optimiert für alle Screens |

## 📊 Karten

### Session-Card
- **Neu:** Streckenlayout mit Live-SVG (Outline, Safety Car Line, Arrow)
- **Neu:** Countdown bis nächste Session (Live aktualisiert)
- **Neu:** Wetter Fr/Sa/So (direkt von Open-Meteo)
- **Neu:** Kollabierbare Sections (Zeitplan, Bedingungen)
- **Verbessert:** Zeitplan zeigt vergangene Sessions gedimmt, Rennen rot
- **Entfernt:** Lap-by-Lap Details (Phase 2)

### Drivers-Card
- **Neu:** Fortschrittsbalken (Punkte relativ zu Leader)
- **Neu:** Podium-Highlights (Gold/Silber/Bronze)
- **Neu:** Länder-Emoji neben Team
- **Neu:** Siege-Badge pro Fahrer
- **Entfernt:** Große Treiber-Bilder (nicht nötig)

### Constructors-Card
- **Neu:** Größere Fortschrittsbalken (Teams visuell wichtiger)
- **Neu:** Podium-Highlights
- **Neu:** Siege-Badge pro Team
- **Gleich:** Struktur ähnlich Drivers

### Race-Recap-Card
- **Neu:** 3D-Podium-Visualisierung (Positionen 1-3 größer)
- **Neu:** Reifen-Compound-Ansicht (farbig: S=Rot, M=Gelb, H=Weiß, etc.)
- **Neu:** Boxenstopps-Tabelle (Lap, Duration)
- **Neu:** Top 10 Ergebnisse
- **Entfernt:** Lap-by-Lap Simulation

## 🔄 Datenfluss

### Sensoren (HA Integration v0.3.1+)
```
sensor.f1_dashboard_session_status       → Trigger für Session-Card
sensor.f1_dashboard_fahrerwertung        → Drivers-Card
sensor.f1_dashboard_konstrukteurswertung → Constructors-Card
sensor.f1_dashboard_letztes_rennen_detail → Race-Recap-Card
sensor.f1_dashboard_live_track_positionen → (Phase 2: Canvas-Streaming)
sensor.f1_dashboard_live_timing_tower     → (Phase 2: Live-Positionen)
```

### Externe APIs (direkt, ohne Sensoren)
```
Open-Meteo API (free)                    ← Wetter (Circuit-Koordinaten)
 └─ Nur aktiv wenn session_status wechselt
 └─ Refresh alle 30 Min
```

### Lokale Daten (embedded)
```
circuits.js (22 Strecken)                ← SVG-Outlines, Fakten
teams.js (11 Teams + 2026er)             ← Teamfarben (constructorId → Hex)
```

## 📦 Bundle-Größe

| Version | Size (raw) | Size (gzip) | Karten |
|---------|-----------|------------|--------|
| v0.3.1 | ~98 kB | ~48 kB | 4 (Vanilla JS) |
| v0.4.0 | ~136 kB | ~53 kB | 4 (Vue 3) |

**Begründung:** Vue 3 Runtime + Composition API overhead, aber alles in einer Datei (keine separaten Bundles).

## ✅ Getestete Szenarien

- [x] Alle 4 Karten rendern (JSDOM)
- [x] Sensor-Integration (HA Mock)
- [x] Open-Meteo Wetter-Fetch
- [x] Responsive Layout (Mobile < 360px)
- [x] Shadow-DOM Encapsulation
- [x] Countdown-Timer (Live)
- [x] Countdown-Timer (Karte unsichtbar = Pause)

## 🚀 Nächste Schritte (Phase 2+)

1. **Live Streckenkarte (Session-Card erweitern)**
   - WebSocket zu `livetiming.formula1.com/signalrcore`
   - Canvas-Rendering mit Fahrer-Positionen
   - Trail-Animation (wie v0.3.0)

2. **Histor. Daten (enrichment)**
   - Fahrer-Karriere-Vergleiche
   - Streck-Historie
   - Trend-Analysen

3. **UI Refinements**
   - Theme-Switcher (Light/Dark)
   - Konfigurierbare Acc icons
   - Bessere Error-States

---

**Kompatibilität:** v0.4.0 Cards funktionieren nur mit HA Integration v0.3.1+
