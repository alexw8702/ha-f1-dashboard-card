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

### v0.6.0
- ✅ **Robustere Session Card:** Der LIVE-Badge bei gesetztem `active_session` wird nun mit einem eigenen JSDOM-Test geprüft.
- 🧪 **Einheitliche Validierung:** `npm run test:ci` baut das auslieferbare Bundle, prüft dessen Syntax und führt alle Card-Tests aus; dieselbe Prüfkette läuft in GitHub Actions.
- 📚 **Entitätsdokumentation bereinigt:** Der Rennrückblick verwendet durchgängig `sensor.f1_dashboard_letztes_rennen_detail`; veraltete oder nicht existente Sensornamen wurden entfernt.

- 📱 **Responsive Design (Kapitel 2)**:
  * **Zweispaltige Fahrerwertung**: Auf Tablets und Desktops (Breite ab 600px) teilt sich die Fahrerwertungs-Tabelle automatisch genau in der Hälfte und wird zweispaltig nebeneinander dargestellt, um vertikalen Platz zu sparen.
  * **Fahrer-Details in Konstrukteuren**: In der Konstrukteurswertung wird auf größeren Bildschirmen eine zweite Spalte mit den Fahrern des jeweiligen Teams inklusive deren Meisterschafts-Position und Punkten eingeblendet.
  * **Team-Historie mit Spalten-Headern**: Die Team-Historie (letzte 5 Rennen) in der Detailkarte zeigt nun die Fahrer-Kürzel (TLA) als Spalten-Header, und die Positions-Badges entsprechen präzise den Ergebnissen der einzelnen Fahrer (DNF- und leere Zustände sauber abgefangen).
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
