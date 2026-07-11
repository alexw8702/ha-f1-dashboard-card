# F1 Dashboard Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Add Repo](https://img.shields.io/badge/HACS-Repo%20hinzuf%C3%BCgen-41BDF5.svg?style=for-the-badge)](https://my.home-assistant.io/redirect/hacs_repository/?owner=alexw8702&repository=ha-f1-dashboard-card&category=plugin)
[![Release](https://img.shields.io/github/v/release/alexw8702/ha-f1-dashboard-card?style=for-the-badge)](https://github.com/alexw8702/ha-f1-dashboard-card/releases)

![F1 Dashboard Card Vorschau](images/preview.png)

Vier eigenständige, dunkeldesigned Custom Cards für ein **Formel-1-Dashboard** in Home Assistant. **v0.3.0** bringt eine **Canvas-basierte Live-Streckenkarte** mit Echtzeit-Fahrzeugpositionen direkt in die Session Card.

| Karte | Element | Zeigt |
|-------|---------|-------|
| Fahrerwertung | `f1-drivers-card` | WM-Stand der Fahrer, Teamfarben, Klick-Details, Wikipedia-Link |
| Konstrukteurswertung | `f1-constructors-card` | WM-Stand der Teams, Teamfarben, Klick-Details |
| Rennwochenende | `f1-session-card` | Streckenlayout (SVG), Fakten, Countdown, Session-Zeitplan, Wetter – schaltet live auf **Streckenkarte + Timing Tower** um |
| Letztes Rennen | `f1-race-recap-card` | Ergebnis (inkl. DNF/DSQ), Reifenstrategie, Boxenstopps (OpenF1) |

---

## Voraussetzung: Sensoren

Diese Karten brauchen passende Sensoren mit bestimmten Attributen. Die einfachste Quelle dafür ist die begleitende **[F1 Dashboard Integration](https://github.com/alexw8702/ha-f1-dashboard)** (separates Repo, HACS-Kategorie *Integration*, UI-Setup ohne YAML).

---

## Installation

1. **HACS → Frontend** (bzw. „Dashboard“) → oben rechts ⋮ → **Benutzerdefinierte Repositories**
2. Diese Repo-URL einfügen: `https://github.com/alexw8702/ha-f1-dashboard-card`
3. Kategorie: **Dashboard/Plugin** → **Hinzufügen**
4. „F1 Dashboard Card“ suchen → **Herunterladen**
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

### Rennwochenende (mit Live-Streckenkarte — v0.3.0)

```yaml
type: custom:f1-session-card
entity: sensor.f1_dashboard_session_status
live_track_entity: sensor.f1_dashboard_live_streckenstatus
live_timing_entity: sensor.f1_dashboard_live_timing_tower
live_positions_entity: sensor.f1_dashboard_live_track_positionen  # NEU: Live-Streckenkarte
weather_entity: sensor.f1_dashboard_wetter_vorhersage           # optional
```

**Features (normal, außerhalb Sessions):**
- Streckenlayout als SVG (alle 22 Strecken 2026)
- Streckenfakten: Länge, Runden, Kurven, Aktiv-Aero, Höhenmeter, Rundenrekord
- Countdown zur nächsten Session
- Session-Zeitplan (FP1–3, Quali, Sprint, Rennen) mit Echtzeit-Highlights
- Wetter-Vorhersage (4 Tage + Stundenverlauf Renntag)

**Live-Features (während Sessions):**
- **Live-Streckenkarte (Canvas)** mit allen 22 Fahrern
  - Fahrzeuge als Kreise in Teamfarbe + Startnummer + Fahrerkürzel
  - Fahrspuren zeigen automatisch das Streckenlayout (keine Vorlagen nötig!)
  - Sanfte Interpolation zwischen den Sekunden-Updates
  - **Flaggen-Rendering**:
    - 🟢 **Grün**: Normal
    - 🟡 **Gelb**: Normal
    - 🚗 **Safety Car**: Positionen eingefroren, 35% gedimmt, „SC“-Overlay
    - 🚨 **Rote Flagge**: Alle Fahrer ausgeblendet, rotes Overlay
    - 🟡 **VSC**: Positionen eingefroren, gedimmt, „VSC“-Overlay
  - Nur Fahrer mit Status `OnTrack` sichtbar
  - Performance: DPR-Skalierung, ResizeObserver, rAF pausiert off-screen
  - Persistente Live-DOM: Canvas überlebt HA-Updates

- **Timing Tower**: Position, Team, Gap, letzte Rundenzeit, Box-/Out-Status (unterhalb Karte)
- **Streckenstatus-Banner**: Live-Flaggenstatus mit Farb-Coding

---

### Letztes Rennen

```yaml
type: custom:f1-race-recap-card
entity: sensor.f1_dashboard_rennrueckblick
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
| `live_track_entity` | string | ❌ | — | Live-Streckenstatus (Flags) |
| `live_timing_entity` | string | ❌ | — | Live-Timing-Tower (Fahrer-Liste) |
| `live_positions_entity` | string | ❌ | — | **[NEU v0.3.0]** Live-Track-Positionen (X/Y/Z, Bounds, Status) |
| `weather_entity` | string | ❌ | — | Wetter-Vorhersage-Sensor |

### Minimale Konfiguration

```yaml
type: custom:f1-session-card
entity: sensor.f1_dashboard_session_status
```

→ Zeigt nur Streckenlayout, Fakten, Countdown

### Vollständige Konfiguration (empfohlen)

```yaml
type: custom:f1-session-card
entity: sensor.f1_dashboard_session_status
live_track_entity: sensor.f1_dashboard_live_streckenstatus
live_timing_entity: sensor.f1_dashboard_live_timing_tower
live_positions_entity: sensor.f1_dashboard_live_track_positionen
weather_entity: sensor.f1_dashboard_wetter_vorhersage
```

→ Komplette Live-Unterstützung mit Streckenkarte + Timing + Wetter

---

## Live-Streckenkarte verstehen (v0.3.0)

### Wie funktioniert es?

1. **Positionsdaten**: Die Integration (`ha-f1-dashboard` v0.3.0) abonniert das `Position.z`-Topic des F1-Live-Timing-Feeds und dekodiert die base64/DEFLATE-Payloads
2. **Sensor**: Neue Entity `sensor.f1_dashboard_live_track_positionen` speichert:
   - `positions[]`: Array mit allen 22 Fahrern (X, Y, Startnummer, TLA, Teamfarbe, Status)
   - `bounds`: Auto-berechnete Min/Max-Grenzen
   - `track_status`: Aktueller Flaggenstatus

3. **Rendering**: Die Card liest den Sensor, erstellt ein Canvas und rendert:
   - Fahrzeug-Kreise in Teamfarbe + Nummer
   - Trail-Canvas (Fahrspuren) mit Interpolation zwischen Updates
   - Flags-Overlay je nach `track_status`

### Flaggen-Logik

| Status | Rendering | Overlay |
|--------|-----------|----------|
| 1 (Grün) | Normal | Keine |
| 2 (Gelb) | Normal | Keine |
| 4 (SC) | 35% Opacity, eingefroren | "🚗 SAFETY CAR" |
| 5 (Rot) | Fahrer ausgeblendet | "🚨 RED FLAG" |
| 6 (VSC) | 35% Opacity, eingefroren | "🟡 VSC" |
| 7 (VSC-Ende) | Normal | Keine |

### Performance-Optimierungen

- **ResizeObserver**: Karte passt sich automatisch an Viewport an
- **IntersectionObserver**: rAF pausiert, wenn Karte off-screen
- **DPR-Skalierung**: Scharfes Rendering auf High-DPI-Displays
- **Trail-Redraw bei Bounds-Änderung**: Nur wenn nötig
- **Teleport-Filter**: Sprünge > 20% Canvas-Diagonale werden übersprungen (vermeidet Fehler)

---

## Troubleshooting

### Live-Streckenkarte bleibt leer

1. **Session aktiv?** Live-Karte zeigt nur während aktiven Sessions (FP1–Rennen)
2. **Sensor konfiguriert?** Card-YAML sollte `live_positions_entity: sensor.f1_dashboard_live_track_positionen` haben
3. **Browser hart neu laden**: Strg+Shift+R
4. **Sensor-Attribute prüfen**:
   - Im HA-Dashboard: **Entwickler-Tools → Zustände → `sensor.f1_dashboard_live_track_positionen`**
   - Sollte ein Array in `positions` mit Einträgen zeigen
5. **HA-Logs**: `custom_components.f1_dashboard` auf Debug setzen und nach Fehlern in Position.z suchen

### Karte zeigt nur Fakten, kein Live-Content

- Vermutlich keine Session aktiv. Live-Daten sind nur während FP1–Rennen verfügbar
- Oder: `live_timing_entity` ist nicht konfiguriert (nur Timing Tower wird dann nicht gezeigt)

### Fahrzeuge animieren nicht flüssig

- Interpolation läuft auf dem Client. Weniger CPU-Last ermöglicht flüssigere Animation
- Canvas wird mit requestAnimationFrame gerendert (60 FPS möglich)
- **Netzwerklatenz**: Bei schlechtem Signal können Updates ausfallen

### Trail überlappt sich oder sieht falsch aus

- Position.z-Daten haben möglicherweise Anomalien in dieser Runde
- **Workaround**: Page neu laden oder auf nächste Runde warten
- [Issue öffnen](https://github.com/alexw8702/ha-f1-dashboard-card/issues) mit Session-Details

---

## Dashboard-Beispiel (vollständig)

```yaml
type: vertical-stack
title: Formel 1
cards:
  - type: custom:f1-session-card
    entity: sensor.f1_dashboard_session_status
    live_track_entity: sensor.f1_dashboard_live_streckenstatus
    live_timing_entity: sensor.f1_dashboard_live_timing_tower
    live_positions_entity: sensor.f1_dashboard_live_track_positionen
    weather_entity: sensor.f1_dashboard_wetter_vorhersage

  - type: horizontal-stack
    cards:
      - type: custom:f1-drivers-card
        entity: sensor.f1_dashboard_fahrerwertung
        max: 5

      - type: custom:f1-constructors-card
        entity: sensor.f1_dashboard_konstrukteurswertung
        max: 5

  - type: custom:f1-race-recap-card
    entity: sensor.f1_dashboard_rennrueckblick
```

---

## Browser-Kompatibilität

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 15+
- ❌ Internet Explorer (nicht unterstützt)

---

## Changelog

### v0.3.0 (Live-Streckenkarte)
- ✨ **Canvas-basierte Live-Streckenkarte** in der Session Card
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
