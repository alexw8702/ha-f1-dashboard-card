# v0.6.1 — Session-Karte: Wetter-Layout bei breitem Viewport korrigiert

- **Strecken-Bedingungen (Wetter):** Bei Kartenbreiten ab 680 px wirkte das Wetterfeld winzig und zentriert in einem großen leeren Panel, weil die Tageskarten auf einspaltige, vertikal zentrierte Mini-Boxen umschalteten statt die gewonnene Breite zu nutzen. Die Tageskarten sind jetzt horizontale Zeilen (Label, Icon, Temperatur, Regen, Wind nebeneinander), die die volle Panel-Breite ausfüllen.
- Die Zweispalten-Schwelle für Zeitplan/Wetter wurde von 600 px auf 680 px angehoben, da im Bereich 600–680 px sowohl die Zeitplan-Tabelle (Datum brach um) als auch die Wetter-Details (Windangabe brach um) zu eng wurden. Datum/Zeit-Zellen und Wetter-Details brechen jetzt nicht mehr um (`white-space: nowrap`).
- **Streckenkarte (SVG-Outline):** Hochformatige Streckenumrisse (z.B. Spa, Villeneuve, Yas Marina) wirkten winzig und mittig in viel Leerraum, weil der Anzeigebereich eher breit als hoch ist. Die Bounding-Box jeder Strecke wird jetzt zur Laufzeit per `getBBox()` gemessen: Umrisse, die deutlich höher als breit sind, werden automatisch um ihren Mittelpunkt um 90° gedreht, und das SVG-viewBox wird eng auf die (ggf. gedrehte) Bounding-Box zugeschnitten statt das feste 500×500-Basis-viewBox zu nutzen. Dadurch skaliert jede Strecke verzerrungsfrei auf die maximal mögliche Größe im verfügbaren Bereich — automatisch für alle 22 Strecken, ohne pro Strecke gepflegte Werte.
- **Streckenfakten (km/Runden/Kurven/Rundenrekord/Höhenmeter):** Die fünf Werte waren einzelne Boxen in einem `grid-auto-fit`-Raster, das sie bei breiten Karten auf die volle Restbreite streckte — winzige Zahl in einer riesigen leeren Box. Jetzt ein einziger kompakter Streifen mit dünnen Trennlinien statt fünf eigenständiger Boxen; die Werte wachsen nicht mehr einzeln mit der Kartenbreite, überschüssiger Platz bleibt schlicht als Rand rechts des Streifens. Mobil (Container ≤460px) steht der Rundenrekord als eigene zentrierte Zeile unter den anderen vier Werten, die sich zu viert eine Zeile teilen.
- **Streckenkarte nutzt jetzt die volle Höhe der Titelspalte.** Die Größe kam bisher aus einer festen Breite (190/220px), wodurch bei kurzen, breiten (rotierten) Streckenumrissen sichtbarer Leerraum unter dem Bild blieb. Die Größe wird jetzt aus der zur Laufzeit gemessenen Bounding-Box als `aspect-ratio` gesetzt, `.hero` streckt die Streckenkarte (`align-items: stretch`) auf die Höhe des Titelblocks — sie füllt jetzt konsequent die verfügbare Höhe und kann dadurch deutlich größer werden als vorher.
- **Header-Umbruch folgt jetzt der tatsächlichen Streckengröße statt eines festen Pixel-Schwellwerts.** Titel und Streckenkarte standen bisher exakt unter 420px Kartenbreite untereinander, unabhängig davon, ob die Strecke bei dieser Breite überhaupt noch nebeneinander gepasst hätte. `.hero` nutzt jetzt `flex-wrap`, und da die Streckenkarte ihre echte (gemessene) Seitenverhältnis-Breite als `aspect-ratio` mitbringt, entscheidet die tatsächliche Bildgröße mit über den Umbruchpunkt — unterschiedliche Streckenformen (z.B. das sehr breite Miami vs. das schmalere, rotierte Spa) brechen dadurch bei unterschiedlichen Breiten um.

# v0.6.0 — Responsive Design + Validierung

- Alle vier Karten nutzen ab 600 px Breite ein zweispaltiges Layout:
  - **Fahrerwertung:** Tabelle teilt sich automatisch in der Hälfte in zwei Spalten.
  - **Konstrukteurswertung:** Zweite Spalte zeigt die Fahrer des Teams mit WM-Position und Punkten.
  - **Session-Karte:** Countdown + Zeitplan links, Wetter rechts.
  - **Letztes-Rennen-Karte:** Podium + Klassement links, Reifen-Strategie + Boxenstopps rechts.
- **Konstrukteurswertung (Detail):** Die Team-Historie (letzte 5 Rennen) wurde mit Spalten-Headern versehen, die die Fahrer-Kürzel (TLA) zeigen. Leere oder DNF-Zustände werden nun sauber dargestellt.
- **Fahrerwertung (Detail):** Die vertikalen Abstände im Detail-Popup wurden korrigiert. Die Elemente (Name, WM-Stand, Wikipedia-Text) sind nun im Desktop-Layout kompakt angeordnet, und unschöne Lücken durch CSS-Grid-Stretching wurden entfernt.
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
