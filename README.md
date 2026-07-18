# F1 Dashboard Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Add Repo](https://img.shields.io/badge/HACS-Repo%20hinzuf%C3%BCgen-41BDF5.svg?style=for-the-badge)](https://my.home-assistant.io/redirect/hacs_repository/?owner=alexw8702&repository=ha-f1-dashboard-card&category=plugin)
[![Release](https://img.shields.io/github/v/release/alexw8702/ha-f1-dashboard-card?style=for-the-badge)](https://github.com/alexw8702/ha-f1-dashboard-card/releases)

![F1 Dashboard Banner](images/banner.jpg)

Vier eigenständige, dunkeldesignte Custom Cards für ein **Formel-1-Dashboard** in Home Assistant. **v0.6.0** bringt ein komplettes **Redesign der Rennwochenende-Karte** sowie einen Wechsel der Codebasis auf **Vue 3** (Single-File-Components, `.ce.vue`) für schnellere Entwicklung und einfacheres Styling.

| Karte | Element | Zeigt |
|-------|---------|-------|
| Fahrerwertung | `f1-drivers-card` | WM-Stand der Fahrer, Teamfarben, Klick-Details, Wikipedia-Link |
| Konstrukteurswertung | `f1-constructors-card` | WM-Stand der Teams, Teamfarben, Klick-Details |
| Rennwochenende | `f1-session-card` | Streckenlayout (SVG), Fakten, Countdown, Session-Zeitplan, Wetter am Circuit |
| Letztes Rennen | `f1-race-recap-card` | Ergebnis (inkl. DNF/DSQ), Reifenstrategie, Boxenstopps (OpenF1) |

---

## Was ist neu in v0.4.0?

- 🧩 **Technik-Wechsel auf Vue 3**: Alle vier Karten sind jetzt Vue Single-File-Components (`.ce.vue`) statt Vanilla-JS/Lit. Das macht die Weiterentwicklung wartbarer, ändert aber nichts an der Nutzung in YAML.
- 🎨 **Rennwochenende-Karte (`f1-session-card`) komplett neu gestaltet**: neues „Carbon-Dark"-Design mit F1-Rot-Akzenten, kollabierbare Sections für Zeitplan und Streckenbedingungen, LIVE/ANSTEHEND-Badge im Header.
- ☀️ **Wetter läuft jetzt direkt im Frontend**: Die Karte holt die Vorhersage selbst live via Open-Meteo (anhand der Streckenkoordinaten) – ein separater Wetter-Sensor ist für die Grundfunktion nicht mehr nötig. Angezeigt wird eine kompakte 3-Tages-Übersicht (Fr/Sa/So des Rennwochenendes).
- ⏱️ Countdown und Session-Zeitplan laufen weiterhin über den bestehenden `entity`-Sensor (`sensor.f1_dashboard_session_status`).

> **Wichtig zu Live-Timing:** Die in v0.3.0 eingeführte Canvas-Live-Streckenkarte mit Echtzeit-Fahrzeugpositionen sowie der Timing Tower sind im v0.4.0-Redesign der Session Card **nicht mehr Teil der Standardansicht**. Die Session Card zeigt aber weiterhin `LIVE`, wenn ihr Session-Status-Sensor ein `active_session`-Attribut liefert. Die separaten Live-Sensoren der [F1 Dashboard Integration](https://github.com/alexw8702/ha-f1-dashboard) bleiben für eigene Automationen oder Templates verfügbar.

---

## Voraussetzung: Sensoren

Diese Karten brauchen passende Sensoren mit bestimmten Attributen. Die einfachste Quelle dafür ist die begleitende **[F1 Dashboard Integration](https://github.com/alexw8702/ha-f1-dashboard)** (separates Repo, HACS-Kategorie *Integration*, UI-Setup ohne YAML).

---

## Installation

1. **HACS → Frontend** (bzw. „Dashboard") → oben rechts ⋮ → **Benutzerdefinierte Repositories**
2. Diese Repo-URL einfügen: `https://github.com/alexw8702/ha-f1-dashboard-card`
3. Kategorie: **Dashboard/Plugin** → **Hinzufügen**
4. „F1 Dashboard Card" suchen → **Herunterladen**
5. **Browser hart neu laden** (Strg+Shift+R)

> HACS legt die Ressource automatisch an. Falls nicht, unter *Einstellungen → Dashboards → ⋮ → Ressourcen* prüfen:
> `/hacsfiles/ha-f1-dashboard-card/f1-dashboard-card.js` als **JavaScript-Modul**.

---

## Verwendung

### Fahrerwertung

```yaml
type: custom:f1-drivers-card
entity: sensor.f1_dashboard_fahrerwertung
max: 10          # optional, Standard 10
```

**Features:**
- Positionen-Badge mit Teamfarbe
- Punkte, Rückstand zum Ersten
- Klick öffnet Detail-Popup: Nationalität, Geburtsdatum + Alter, Team
- Wikipedia-Link zum Fahrer

---

### Konstrukteurswertung

```yaml
type: custom:f1-constructors-card
entity: sensor.f1_dashboard_konstrukteurswertung
max: 10          # optional
```

**Features:**
- Wie Fahrerwertung, aber für Teams
- Team-Logo und -Farbe
- Klick zeigt Team-Details

---

### Rennwochenende (Redesign v0.4.0)

```yaml
type: custom:f1-session-card
entity: sensor.f1_dashboard_session_status
```

Das ist bereits die vollständige Konfiguration – weitere Optionen sind für diese Karte aktuell nicht vorgesehen, da Wetter direkt im Frontend geladen wird.

**Features:**
- Streckenlayout als SVG (alle 22 Strecken 2026) mit Start/Ziel-Linie und Fahrtrichtung
- Streckenfakten: Länge, Runden, Kurven, Rundenrekord, Höhenmeter
- LIVE/ANSTEHEND-Statusbadge im Header
- Live-Countdown zur nächsten Session
- Kollabierbarer Session-Zeitplan (FP1–3, Quali, Sprint, Rennen) mit Hervorhebung vergangener/kommender Termine
- Kollabierbare Streckenbedingungen: 3-Tages-Wetterübersicht (Fr/Sa/So) direkt von Open-Meteo, inkl. Temperatur, Regenwahrscheinlichkeit und Wind

<details>
<summary>Ältere Live-Timing-Sensoren (optional, derzeit ohne Card-Anbindung)</summary>

Die F1 Dashboard Integration stellt weiterhin folgende Live-Sensoren bereit, die aktuell **nicht** von `f1-session-card` genutzt werden, aber z. B. für eigene Automationen oder Templates interessant sein können:

- `sensor.f1_dashboard_live_streckenstatus` – Live-Flaggenstatus (Grün/Gelb/SC/Rot/VSC)
- `sensor.f1_dashboard_live_timing_tower` – Live-Timing (Position, Gap, Rundenzeit, Box-Status)
- `sensor.f1_dashboard_live_renn_kontrolle` – jüngste Rennkontrollmeldungen (Flaggen, Strafen, Untersuchungen)
- `sensor.f1_dashboard_live_track_positionen` – Echtzeit-Fahrzeugpositionen (X/Y/Z, Bounds)

Diese Sensoren sind nur während aktiver Sessions verfügbar und lassen sich unter *Entwickler-Tools → Zustände* einsehen.

</details>

---

### Letztes Rennen

```yaml
type: custom:f1-race-recap-card
entity: sensor.f1_dashboard_letztes_rennen_detail
```

**Features:**
- Endergebnis mit Positionen 1–10 (+ mehr auf Klick)
- DNF/DNS/DSQ-Status mit Grund
- Rückstand zum Sieger
- **Reifenstrategie**: Pro-Fahrer-Compound-Timeline
  - Rot = Soft (C5)
  - Gelb = Medium (C4)
  - Weiß = Hard (C3)
  - Grün/Blau = Intermediate/Wet
- **Boxenstopps**: Anzahl + Dauer pro Fahrer (via OpenF1)

---

## Konfiguration der Session Card

### Config-Optionen

| Option | Typ | Erforderlich | Default | Beschreibung |
|--------|-----|--------------|---------|-------------|
| `entity` | string | ✅ | — | Session-Status-Sensor |

Die aktuelle Session Card wertet nur `entity` aus. Wetter wird direkt geladen; Live-Timing und die Live-Streckenkarte sind vorübergehend nicht Teil dieser Card.

### Minimale Konfiguration

```yaml
type: custom:f1-session-card
entity: sensor.f1_dashboard_session_status
```

→ Zeigt Streckenlayout, Fakten, Countdown, Zeitplan und Wetter (automatisch)

---

## Dashboard-Beispiel (vollständig)

```yaml
type: vertical-stack
title: Formel 1
cards:
  - type: custom:f1-session-card
    entity: sensor.f1_dashboard_session_status

  - type: horizontal-stack
    cards:
      - type: custom:f1-drivers-card
        entity: sensor.f1_dashboard_fahrerwertung
        max: 5

      - type: custom:f1-constructors-card
        entity: sensor.f1_dashboard_konstrukteurswertung
        max: 5

  - type: custom:f1-race-recap-card
    entity: sensor.f1_dashboard_letztes_rennen_detail
```

---

## Browser-Kompatibilität

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 15+
- ❌ Internet Explorer (nicht unterstützt)

---

## Changelog

### v0.6.4-beta.1 (In Beta)
- 🗺️ **Straight-Mode-Zonen jetzt auf der Streckenkarte:** rot gestrichelte Zonen entlang der echten Streckenführung statt nur als Text-Badge, plus nummerierte Turn-Marker an jeder Kurve
- ✅ **Spa gegen offizielle 2026-Referenzkarte verifiziert:** 5 Zonen, 19 Turn-Positionen
- 🆕 **Red Bull Ring integriert:** 3 Zonen, 10 Turn-Positionen, korrigierte Overtake Detection/Activation
- 🔄 **Kein Breaking Change:** Strecken ohne die neuen Felder fallen weiterhin auf die bisherige Aero-Zonen-Darstellung zurück
- ⏳ Weitere Strecken folgen in kommenden Beta-Releases

### v0.6.3-beta.1 (In Beta)
- 🏎️ **F1 2026 Circuit Zone Data:** Complete research and metadata for all 22 circuits
  - **Straight Mode zones** - Pit straight drag-reduction zones (FIA Technical Regulations 2026)
  - **Active Aero per-corner** - MAX/MID/MIN configurations based on corner speed profiles
  - **Overtake Detection/Activation** - Official overtaking opportunity zones per circuit
- 🛠️ **New composable:** `useCircuitZones()` utility for accessing zone data in Vue components
- 📊 **Data sources:** FIA Technical Regulations, official circuit specs, Spa 2026 reference map validation
- 📦 **Files added:** `src/data/circuits_2026_zones.js`, `src/composables/useCircuitZones.js`
- ✅ **Backward compatible:** No modifications to existing circuits data; zone metadata is separate

### v0.6.2
- 🐛 **Spa gegen die 2026-Referenzkarte nachkorrigiert:** Detection-Punkt jetzt vor der Bus-Stop-Schikane (lag fälschlich nach Start/Ziel), Boxengeraden-Zone beginnt erst am Schikanen-Ausgang, Zone Turn 17→18 reicht jetzt bis direkt an die Schikane.
- 🔬 **Straight-Mode-Daten komplett neu recherchiert, Overtake Mode ergänzt.** 9 Strecken (Albert Park, Shanghai, Suzuka, Miami, Villeneuve, Monaco, Catalunya, Red Bull Ring, Silverstone) plus Spa haben bestätigte 2026er Daten aus freien Quellen (FIA, f1livepulse.com, Motor Sport Magazine, PlanetF1). Die übrigen 12 Strecken zeigen bewusst keine Zonen, statt auf alte DRS-Daten zurückzufallen — für sie liegen noch keine 2026-Streckenkarten vor. Neu: **Overtake Detection** (orange) und **Overtake Activation** (grün) als Punkte auf der Streckenkarte.
- 🐛 **Spa: fehlende Straight-Mode-Zonen ergänzt (2→5)** anhand einer aktuellen 2026-Streckenkarte — die vorherige Recherche basierte auf veralteten 2024/2025-DRS-Daten.
- 🏁 **Neue Streckenfakten:** Straight Mode Zonen (vormals DRS) real auf der Streckenkarte eingezeichnet für alle 22 Strecken der Saison plus Badge mit der Gesamtzahl, Ort/Land mit Flagge unter dem Streckennamen, Vorjahrespodium, erstes Grand-Prix-Jahr im Fakten-Streifen, Sprint-Sessions farblich im Zeitplan hervorgehoben. Podium/erstes-GP-Jahr per direktem Jolpica-Abruf im Browser, kein Backend-Umbau nötig.
- 📐 **Streckenkarte größer, config.title unterstützt.** max-width von 45%/75% auf 62%/92% (Desktop/Mobil) angehoben. Ein gesetzter Kartentitel (`title:` in der Lovelace-Konfiguration) erscheint jetzt im eigenen Header statt nirgends sichtbar zu sein.

### v0.6.1
- 🐛 **Session-Karte: Wetter-Layout korrigiert.** Ab 680px Kartenbreite füllen die Wetter-Tageskarten ("Strecken-Bedingungen") jetzt die volle Panel-Breite als horizontale Zeile (Label, Icon, Temperatur, Regen, Wind), statt als winzige zentrierte Box in einem großen leeren Feld zu wirken. Die Zweispalten-Schwelle für Zeitplan/Wetter wurde von 600px auf 680px angehoben, um Textumbrüche im 600–680px-Bereich zu vermeiden.
- 🏁 **Streckenkarte automatisch rotiert & maximal skaliert.** Hochformatige Streckenumrisse (Spa, Villeneuve, Yas Marina, ...) werden zur Laufzeit vermessen und bei Bedarf um 90° gedreht, das SVG-viewBox wird eng auf die Strecke zugeschnitten. Ergebnis: jede Strecke nutzt den verfügbaren Platz im Header maximal aus, ganz ohne pro Strecke gepflegte Werte.
- 📊 **Streckenfakten kompakter.** Die fünf Fakten-Boxen (km, Runden, Kurven, Rundenrekord, Höhenmeter) sind jetzt ein einziger kompakter Streifen mit Trennlinien statt fünf einzelner Boxen, die sich bei breiten Karten auf die volle Restbreite streckten. Mobil steht der Rundenrekord zentriert unter den anderen vier Werten.
- 📐 **Streckenkarte füllt die volle Höhe, Header-Umbruch folgt der echten Bildgröße.** Die Streckenkarte war bisher auf eine feste Breite begrenzt und ließ bei kurzen/breiten Umrissen Leerraum darunter. Sie nutzt jetzt per `aspect-ratio` + `align-items: stretch` die volle Höhe der Titelspalte und wird dadurch größer. Der Umbruch zwischen Titel und Streckenkarte entscheidet sich außerdem anhand der tatsächlichen (gemessenen) Bildgröße statt eines festen Pixel-Werts.
- 🎯 **Mobil zentriert.** Streckenkarte und Fakten-Streifen standen mobil trotz Umbruch linksbündig und die Karte war zusätzlich künstlich auf 240px begrenzt. Beide sind jetzt zentriert, die Streckenkarte nutzt bis zu 75% der verfügbaren Breite statt eines festen Pixelwerts.
- 📏 **Streckenfakten jetzt Teil der Titelspalte.** Vorher eine eigene Zeile unterhalb des Headers, wirkte die Streckenkarte dadurch trotz Höhenanpassung klein gegenüber dem verbleibenden Leerraum. Titel + Badge + Fakten-Streifen bilden jetzt gemeinsam die Titelspalte, die Streckenkarte streckt sich auf deren volle (größere) Höhe.
- 🏷️ **Status-Badge neben "Nächstes Rennen"** statt als eigene Zeile unterhalb von Datum/Zeitraum.

### v0.6.0
- ✅ **Robustere Session Card:** Der LIVE-Badge bei gesetztem `active_session` wird nun mit einem eigenen JSDOM-Test geprüft.
- 🧪 **Einheitliche Validierung:** `npm run test:ci` baut das auslieferbare Bundle, prüft dessen Syntax und führt alle Card-Tests aus; dieselbe Prüfkette läuft in GitHub Actions.
- 📚 **Entitätsdokumentation bereinigt:** Der Rennrückblick verwendet durchgängig `sensor.f1_dashboard_letztes_rennen_detail`; veraltete oder nicht existente Sensornamen wurden entfernt.

- 📱 **Responsive Design (Kapitel 2)**:
  * **Zweispaltige Fahrerwertung**: Auf Tablets und Desktops (Breite ab 600px) teilt sich die Fahrerwertungs-Tabelle automatisch genau in der Hälfte und wird zweispaltig nebeneinander dargestellt, um vertikalen Platz zu sparen.
  * **Fahrer-Details in Konstrukteuren**: In der Konstrukteurswertung wird auf größeren Bildschirmen eine zweite Spalte mit den Fahrern des jeweiligen Teams inklusive deren Meisterschafts-Position und Punkten eingeblendet.
  * **Team-Historie mit Spalten-Headern**: Die Team-Historie (letzte 5 Rennen) in der Detailkarte zeigt nun die Fahrer-Kürzel (TLA) als Spalten-Header, und die Positions-Badges entsprechen präzise den Ergebnissen der einzelnen Fahrer (DNF- und leere Zustände sauber abgefangen).
  * **Kompakte Fahrer-Details**: Vertikale Abstände und ungewolltes Dehnen (CSS Grid) im Detail-Popup der Fahrerwertung wurden korrigiert; Name, WM-Stand und Wikipedia-Text rücken kompakt zusammen.
  * **Session-Karte zweispaltig**: Countdown + Zeitplan links, Strecken-Bedingungen (Wetter) rechts – auf breiteren Bildschirmen nebeneinander statt gestapelt.
  * **Letztes-Rennen-Karte zweispaltig**: Podium + Klassement links, Reifen-Strategie + Boxenstopps rechts – auf breiteren Viewports nebeneinander.

### v0.5.1
- 🛠️ **Refactoring & Detail-Verbesserungen**:
  * **Kontrastreiche Team-Logos**: Team-Logos in der Detailkarte besitzen nun ein rundes weißes Badge als Hintergrund, wodurch auch dunkle Logos (wie z. B. Mercedes AMG) hervorragend lesbar sind.
  * **Größere Porträts & Logos**: Die Porträts der Fahrer und Teamlogos im Header der Detailkarten wurden von 50px auf 90px vergrößert.
  * **Vertikale Fahrerliste mit WM-Platz**: Die Fahrer eines Teams werden in der Detailkarte nun sauber untereinander aufgelistet. Dabei wird deren aktueller WM-Rang in einem Team-akzentuierten Badge und deren WM-Punkte dargestellt.
  * **Wikipedia-Zusammenfassungen**: Zeigt nun den Wikipedia-Einleitungstext (Kurz-Bio) des Fahrers bzw. Teams dynamisch in der Detailkarte an.

### v0.5.0
- ✨ **Feature (Fahrer- & Konstrukteurs-Details & Viewport-Fix)**:
  * **Interaktive Team-Details**: Durch Klicken auf ein Team in der Konstrukteurswertung (`f1-constructors-card`) öffnet sich nun ebenfalls eine detaillierte Karte (Overlay) im Carbon-Design.
  * **Team-Fakten**: Zeigt Herkunft, Wikipedia-Link und die **aktuelle Fahrerbesetzung** (vollständig dynamisch geladen) an.
  * **Viewport-zentrierte Positionierung**: Das Detail-Overlay positioniert sich nun mittels `position: fixed` relativ zum Viewport (Browserfenster) statt zur Karte. Dadurch schwebt es immer exakt in der Mitte der Anzeige, unabhängig von der Scroll-Position.
  * **Kompaktes Stats-Grid**: Die Position, die WM-Punkte und die Podestplätze (P1, P2, P3) werden für Fahrer und Teams platzsparend in einem dreispaltigen Raster mit edlen Vektor-Pokalen dargestellt.
  * **2. & 3. Plätze**: Das Detail-Overlay lädt nun zusätzlich alle Rennergebnisse des Fahrers oder Teams für die aktuelle Saison und berechnet die Anzahl der 2. und 3. Plätze.

### v0.4.3
- 🛠️ **Refactoring & Design-Optimierung**:
  * **Zentriertes Overlay**: Die Detail-Karte schwebt nun als modales Overlay in der Mitte des Bildschirms mit abgerundeten Ecken und einer flüssigen Spring-In-Animation (Skalierung und Opazität). Perfekt optimiert für Smartphones und mobile Ansichten!
  * **Fix für Fahrerbilder**: Fehler behoben, bei dem die Fahrerbilder nicht geladen wurden. Die Detailinformationen (Wikipedia-URL, Startnummer, Geburtstag) werden nun zuverlässig aus den Rohdaten (`attrs.DriverStandings`) extrahiert, auch wenn sie in der flachen Standings-Liste fehlen.

### v0.4.2
- ✨ **Feature (Fahrer-Details & Bilder)**:
  * Durch Klicken auf eine Fahrerzeile in der Fahrerwertung (`f1-drivers-card`) öffnet sich nun eine interaktive Detail-Karte (Overlay) im Carbon-Design.
  * Zeigt Geburtsdatum, Alter (dynamisch berechnet), Startnummer, Nationalität und Wikipedia-Link des Fahrers an.
  * **Dynamische Fahrerbilder**: Lädt automatisch ein offizielles Porträtfoto des Fahrers live aus Wikipedia via REST API (keine zusätzlichen Sensoren im Backend notwendig).

### v0.4.1
- 🔧 **Bugfix (Rennrückblick-Header)**: 
  - Die Rennrückblick-Karte (`f1-race-recap-card`) zeigt nun den Circuit-Namen (z. B. `Spa-Francorchamps`) und das Land als Fallback an, falls `raceName` und `date` in den Sensorattributen fehlen.
- 🔧 **Entwickler-Tools**:
  - JSDOM-Testpfade wurden korrigiert, um die Tests lokal in jeder Umgebung ausführen zu können. `jsdom` wurde als Dev-Abhängigkeit hinzugefügt.

### v0.4.0 (Vue-Redesign)
- 🧩 Codebasis auf **Vue 3** Single-File-Components (`.ce.vue`) umgestellt
- 🎨 `f1-session-card` komplett neu designt: Carbon-Dark-Theme, kollabierbare Sections, LIVE-Badge
- ☀️ Wetter wird direkt im Frontend via Open-Meteo geladen (kein separater Wetter-Sensor mehr nötig für die Grundfunktion), kompakte 3-Tages-Ansicht
- ⚠️ Live-Streckenkarte (Canvas) und Timing Tower vorübergehend nicht mehr in der Session Card enthalten (Sensoren der Integration bleiben bestehen)

### v0.3.0 (Live-Streckenkarte)
- ✨ Canvas-basierte Live-Streckenkarte in der Session Card
- 🎨 Fahrzeuge als Kreise in Teamfarbe + Nummer/TLA, sanfte Interpolation
- 🚩 Flaggen-Logik: Rot blendet aus, SC/VSC dimmt + Overlay, Trail pausiert
- 📍 Automatische Bounds-Berechnung, keine vordefinierten Strecken nötig
- 🔄 Persistente Live-DOM: Canvas überlebt HA-UI-Updates
- 📦 Benötigt `ha-f1-dashboard` v0.3.0 (neuer Sensor `live_track_positionen`)
- 🎯 DPR-Rendering, ResizeObserver, rAF off-screen-pause

### v0.2.0
- Live-Timing-Unterstützung (Timing Tower)
- Wetter-Vorhersage-Integration
- Session-Zeitplan mit Live-Highlights

### v0.1.0
- Vier Custom Cards (Drivers, Constructors, Session, Race Recap)
- SVG-Streckenlayouts für alle 21 Strecken 2024

---

## Lizenz

MIT License — siehe [LICENSE](LICENSE)

---

## Support & Feedback

- 🐛 [Bug melden](https://github.com/alexw8702/ha-f1-dashboard-card/issues)
- 💡 [Feature-Wunsch](https://github.com/alexw8702/ha-f1-dashboard-card/issues)
- 🗣️ [Diskussion](https://github.com/alexw8702/ha-f1-dashboard-card/discussions)

---

**Gutes Rennen! 🏁**
