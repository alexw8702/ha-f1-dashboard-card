# F1 Dashboard Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Add Repo](https://img.shields.io/badge/HACS-Repo%20hinzuf%C3%BCgen-41BDF5.svg?style=for-the-badge)](https://my.home-assistant.io/redirect/hacs_repository/?owner=alexw8702&repository=ha-f1-dashboard-card&category=plugin)

Vier eigenständige, dunkle Custom Cards für ein **Formel-1-Dashboard** in Home Assistant.

| Karte | Element | Zeigt |
|-------|---------|-------|
| Fahrerwertung | `f1-drivers-card` | WM-Stand der Fahrer, Teamfarben, Klick-Details, Wikipedia-Link |
| Konstrukteurswertung | `f1-constructors-card` | WM-Stand der Teams, Teamfarben, Klick-Details |
| Rennwochenende | `f1-session-card` | Streckenlayout (SVG), Fakten, Countdown, Session-Zeitplan, Wetter – schaltet live auf Timing Tower um, wenn eine Session läuft |
| Letztes Rennen | `f1-race-recap-card` | Ergebnis (inkl. DNF/DSQ), Reifenstrategie, Boxenstopps (OpenF1) |

---

## Voraussetzung: Sensoren

Diese Karten brauchen passende Sensoren mit bestimmten Attributen. Die einfachste Quelle dafür ist die begleitende **[F1 Dashboard Integration](https://github.com/alexw8702/ha-f1-dashboard)** (separates Repo, HACS-Kategorie *Integration*, UI-Setup ohne YAML).

---

## Installation

1. HACS → **Frontend** (bzw. „Dashboard") → oben rechts ⋮ → **Benutzerdefinierte Repositories**
2. Diese Repo-URL einfügen, Kategorie **Dashboard/Plugin** wählen, hinzufügen
3. „F1 Dashboard Card" suchen und **herunterladen**
4. Browser hart neu laden (Strg+Shift+R)

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

### Konstrukteurswertung

```yaml
type: custom:f1-constructors-card
entity: sensor.f1_dashboard_konstrukteurswertung
max: 10          # optional
```

### Rennwochenende

```yaml
type: custom:f1-session-card
entity: sensor.f1_dashboard_session_status
weather_entity: sensor.f1_dashboard_wetter_vorhersage   # optional (Tages-Wetter)
hourly_entity: sensor.f1_dashboard_wetter_stuendlich    # optional (stündlicher Renntag)
live_track_entity: sensor.f1_dashboard_live_streckenstatus   # optional (Live-Modus)
live_timing_entity: sensor.f1_dashboard_live_timing_tower     # optional (Live-Modus)
```

> Ohne `weather_entity`/`hourly_entity` blendet die Karte den jeweiligen Wetterblock einfach aus. Sind `live_track_entity` und `live_timing_entity` gesetzt und läuft gerade eine Session, schaltet die Karte automatisch auf eine Live-Ansicht mit Streckenstatus-Banner und komplettem Timing Tower (Position, Team, Gap, letzte Rundenzeit, Boxenstopp-Status) – sonst zeigt sie weiterhin Countdown und Session-Zeitplan.

### Letztes Rennen (Ergebnis, Reifen, Boxenstopps)

```yaml
type: custom:f1-race-recap-card
entity: sensor.f1_dashboard_letztes_rennen_detail
drivers_entity: sensor.f1_dashboard_fahrerwertung   # optional, für Fahrernamen
```

### Komplettes Dashboard (Beispiel)

```yaml
title: Formel 1
views:
  - title: Übersicht
    type: sections
    sections:
      - type: grid
        cards:
          - type: custom:f1-session-card
            entity: sensor.f1_dashboard_session_status
            weather_entity: sensor.f1_dashboard_wetter_vorhersage
            hourly_entity: sensor.f1_dashboard_wetter_stuendlich
      - type: grid
        cards:
          - type: custom:f1-drivers-card
            entity: sensor.f1_dashboard_fahrerwertung
          - type: custom:f1-constructors-card
            entity: sensor.f1_dashboard_konstrukteurswertung
      - type: grid
        cards:
          - type: custom:f1-race-recap-card
            entity: sensor.f1_dashboard_letztes_rennen_detail
            drivers_entity: sensor.f1_dashboard_fahrerwertung
```

---

## Konfigurationsoptionen

| Option | Karte | Pflicht | Standard | Beschreibung |
|--------|-------|---------|----------|--------------|
| `entity` | alle | ✅ | – | Zugehöriger Sensor |
| `max` | drivers/constructors | – | `10` | Maximale Anzahl Zeilen |
| `weather_entity` | session | – | – | Tages-Wetter-Sensor |
| `hourly_entity` | session | – | – | Stündlicher Wetter-Sensor |
| `drivers_entity` | race-recap | – | – | Fahrerwertungs-Sensor (für Namen statt Startnummern) |

---

## Datenquellen & Lizenz

Die Karten selbst benötigen keine eigenen API-Aufrufe – sie rendern, was der Sensor liefert. Datenherkunft (via [F1 Dashboard Integration](https://github.com/alexw8702/ha-f1-dashboard)):

- **Jolpica-F1** (Ergast-kompatibel) – Standings, Kalender, Ergebnisse
- **Open-Meteo** – Wettervorhersage
- **OpenF1** – Rennergebnis, Reifenstrategie, Boxenstopps
- **Streckenlayouts** – [julesr0y/f1-circuits-svg](https://github.com/julesr0y/f1-circuits-svg), lizenziert unter CC-BY-4.0

Dieses Projekt ist inoffiziell und steht in keiner Verbindung zu Formula 1, der FIA oder verbundenen Unternehmen. F1, FORMULA 1 und zugehörige Marken sind Eigentum von Formula One Licensing B.V.

Code lizenziert unter MIT.
