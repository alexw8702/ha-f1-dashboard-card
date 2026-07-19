/** JSDOM-Test: f1-session-card (Vue 3) mit realen Sensor-Daten */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});
const { window } = dom;

// Fetch-Mock: Open-Meteo liefert Wochenend-Wetter, Wikipedia liefert Fahrerbild/Team-Logo
window.fetch = async (url) => {
  if (url.includes('wikipedia.org')) {
    return {
      ok: true,
      json: async () => ({ thumbnail: { source: 'https://example.test/photo.jpg' } }),
    };
  }
  return {
    ok: true,
    json: async () => ({
      daily: {
        time: ['2026-07-16','2026-07-17','2026-07-18','2026-07-19','2026-07-20'],
        temperature_2m_max: [30.6,26.9,24.5,21.6,20.7],
        temperature_2m_min: [18.7,18.1,16.9,14.6,13.0],
        precipitation_probability_max: [41,45,49,49,40],
        weather_code: [95,95,53,53,3],
        wind_speed_10m_max: [18,22,15,20,12],
      },
    }),
  };
};

const bundle = fs.readFileSync('./dist/f1-dashboard-card.js', 'utf8');
window.eval(bundle);

// Reale Sensor-Struktur aus HA
const hass = {
  states: {
    'sensor.f1_dashboard_session_status': {
      state: 'upcoming',
      attributes: {
        next_race: {
          season: '2026', round: '10', raceName: 'Belgian Grand Prix',
          Circuit: {
            circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps',
            Location: { lat: '50.4372', long: '5.97139', locality: 'Spa', country: 'Belgium' },
          },
          date: '2026-07-19', time: '13:00:00Z',
          FirstPractice: { date: '2026-07-17', time: '11:30:00Z' },
          SecondPractice: { date: '2026-07-17', time: '15:00:00Z' },
          ThirdPractice: { date: '2026-07-18', time: '10:30:00Z' },
          Qualifying: { date: '2026-07-18', time: '14:00:00Z' },
        },
        active_session: null,
      },
    },
  },
};

const el = window.document.createElement('f1-session-card');
el.setConfig({ entity: 'sensor.f1_dashboard_session_status' });
el.hass = hass;
window.document.body.appendChild(el);

// Zusatz-Sensoren: Live-Timing, letzte Session, Startaufstellung
const extraHass = {
  states: {
    ...hass.states,
    'sensor.f1_dashboard_live_timing_tower': {
      state: 'active',
      attributes: {
        drivers: [
          { position: 1, driver_code: 'VER', driver_name: 'Max Verstappen', team: 'Red Bull', team_color: '#4781D7', gap: 'Leader' },
          { position: 2, driver_code: 'NOR', driver_name: 'Lando Norris', team: 'McLaren', gap: '+1.204' },
        ],
      },
    },
    'sensor.f1_dashboard_letzte_session': {
      state: 'complete',
      attributes: {
        session_type: 'Qualifying',
        session_name: 'Qualifying',
        date: '2026-07-18',
        results: [
          { position: 1, driver_code: 'VER', driver_name: 'Max Verstappen', team: 'Red Bull', team_color: '#4781D7', time_or_gap: '1:42.741' },
          { position: 2, driver_code: 'NOR', driver_name: 'Lando Norris', team: 'McLaren', team_color: '#F47600', time_or_gap: '+0.241' },
        ],
      },
    },
    'sensor.f1_dashboard_fahrerwertung': {
      state: '2026',
      attributes: {
        standings: [
          { name: 'Max Verstappen', team: 'Red Bull', tla: 'VER', points: 320, url: 'https://de.wikipedia.org/wiki/Max_Verstappen' },
        ],
      },
    },
    'sensor.f1_dashboard_konstrukteurswertung': {
      state: '2026',
      attributes: {
        standings: [
          { name: 'Red Bull', points: 401, url: 'https://de.wikipedia.org/wiki/Red_Bull_Racing' },
        ],
      },
    },
    'sensor.f1_dashboard_startaufstellung': {
      state: '2026',
      attributes: {
        season: '2026', round: '13', raceName: 'Belgian Grand Prix',
        provisional: true,
        grid: [
          { grid_position: 1, quali_position: 1, driver_code: 'VER', driver_name: 'Max Verstappen', team: 'Red Bull', penalty: false, penalty_note: null, sector_1: '28.421', sector_2: '31.098', sector_3: '27.665', quali_time: '1:27.184' },
          { grid_position: 2, quali_position: 3, driver_code: 'NOR', driver_name: 'Lando Norris', team: 'McLaren', penalty: true, penalty_note: '5-Sekunden-Strafe wegen Kollisionsverursachung', sector_1: '28.512', sector_2: '31.145', sector_3: '27.701', quali_time: '1:27.358' },
          { grid_position: 3, quali_position: 3, driver_code: 'RUS', driver_name: 'George Russell', team: 'Mercedes', penalty: true, penalty_note: null, sector_1: null, sector_2: null, sector_3: null, quali_time: null },
        ],
      },
    },
  },
};
const extraEl = window.document.createElement('f1-session-card');
extraEl.setConfig({ entity: 'sensor.f1_dashboard_session_status' });
extraEl.hass = extraHass;
window.document.body.appendChild(extraEl);

// Separater aktiver Session-Zustand: Der LIVE-Badge muss ohne einen
// zusätzlichen Live-Track-Sensor allein aus active_session erscheinen.
const liveEl = window.document.createElement('f1-session-card');
liveEl.setConfig({ entity: 'sensor.f1_dashboard_session_status' });
liveEl.hass = {
  states: {
    'sensor.f1_dashboard_session_status': {
      ...hass.states['sensor.f1_dashboard_session_status'],
      state: 'active',
      attributes: {
        ...hass.states['sensor.f1_dashboard_session_status'].attributes,
        active_session: 'Quali',
      },
    },
  },
};
window.document.body.appendChild(liveEl);

setTimeout(() => {
  const root = el.shadowRoot;
  const text = root ? root.textContent : '';
  const results = [];
  const check = (name, ok) => { results.push([name, ok]); };

  check('Shadow-Root existiert', !!root);
  check('Rennname gerendert', text.includes('Belgian Grand Prix'));
  check('Circuit-Name gerendert', text.includes('Spa-Francorchamps'));
  check('Fakten-Chip km', text.includes('7,004'));
  check('Fakten-Chip Runden (44)', text.includes('44'));
  check('Fakten-Chip Rekord', text.includes('1:44.701'));
  check('Zeitplan: FP1..Quali+Rennen', ['FP1','FP2','FP3','Quali','Rennen'].every(s => text.includes(s)));
  check('Countdown vorhanden', /\d+T \d{2}:\d{2}:\d{2}|\d{2}:\d{2}:\d{2}/.test(text));
  check('Badge ANSTEHEND', text.includes('ANSTEHEND'));
  const liveBadge = liveEl.shadowRoot?.querySelector('.badge');
  check('Live-Session zeigt LIVE-Badge', liveBadge?.textContent.trim() === 'LIVE');
  check('Live-Session verwendet Live-Styling', liveBadge?.classList.contains('live'));
  check('Track-SVG (outline path)', !!root.querySelector('.track-outline'));
  check('Track-SVG: Straight-Mode-Zonen (Spa)', root.querySelectorAll('.track-straight-mode').length > 0);
  check('Track-SVG: Turn-Marker (Spa)', root.querySelectorAll('.turn-label').length > 0);
  check('Wetter Fr/Sa/So gerendert', (root.querySelectorAll('.weather-day').length === 3));
  check('Renntag-Highlight im Wetter', !!root.querySelector('.weather-day.race'));

  // Backward compatibility: ohne neue Sensoren dürfen Timing/Grid-Sections nicht erscheinen
  check('Ohne Sensor: keine Timing-Tabelle', !root.querySelector('.timing'));
  check('Ohne Sensor: keine Startaufstellung', !root.querySelector('.grid-list'));

  // Neue Sections mit Zusatz-Sensoren: Wenn eine Startaufstellung vorliegt, ersetzt
  // sie die generische Timing-Tabelle vollständig (kein doppeltes Rendering).
  const extraRoot = extraEl.shadowRoot;
  const extraText = extraRoot ? extraRoot.textContent : '';
  check('Nur EINE Tabelle: keine separate Timing-Tabelle bei vorhandener Startaufstellung', !extraRoot.querySelector('.timing'));
  check('Startaufstellung gerendert', !!extraRoot.querySelector('.grid-list'));
  check('Startaufstellung zeigt Fahrer VER/NOR', extraText.includes('VER') && extraText.includes('NOR'));
  check('Provisorisch-Hinweis gerendert', !!extraRoot.querySelector('.provisional-note'));
  const gridRows = extraRoot.querySelectorAll('.grid-row');
  check('Drei Grid-Zeilen gerendert', gridRows.length === 3);
  check('Penalty-Warnung nur auf Strafe-Zeilen', !!gridRows[1]?.querySelector('.g-warn') && !gridRows[0]?.querySelector('.g-warn'));

  // Click-to-expand: Klick auf eine Zeile klappt Detail-Panel mit Sektorzeiten auf
  check('Vor Klick: kein Detail-Panel offen', !extraRoot.querySelector('.grid-detail'));
  gridRows[0].dispatchEvent(new window.Event('click', { bubbles: true }));

  // Vue-DOM-Update nach dem Klick ist async (nextTick) - kurz warten, bevor der
  // Rest der Prüfungen und die Zusammenfassung laufen.
  setTimeout(() => {
    const detail = extraRoot.querySelector('.grid-detail');
    check('Klick auf Zeile öffnet Detail-Panel', !!detail);
    check('Detail-Panel zeigt Sektorzeiten', detail?.textContent.includes('28.421') && detail?.textContent.includes('1:27.184'));

    // Fahrerbild/Team-Logo werden per Wikipedia-Fetch nachgeladen (async, on-demand
    // beim Aufklappen) - zusätzliche Wartezeit für Promise-Resolution + Re-Render.
    setTimeout(() => {
      check('Fahrerbild geladen (VER)', !!extraRoot.querySelector('.g-driver-photo'));
      check('Team-Logo geladen (Red Bull)', !!extraRoot.querySelector('.g-team-logo'));

      // Dritte Zeile (RUS) hat penalty:true aber penalty_note:null -> Fallback-Text
      gridRows[2].dispatchEvent(new window.Event('click', { bubbles: true }));
      setTimeout(() => {
        const detail3 = extraRoot.querySelectorAll('.grid-detail');
        const fallbackText = [...detail3].some(d => d.textContent.includes('Strafe bekannt, Begründung nicht verfügbar'));
        check('Fehlende penalty_note zeigt ehrlichen Fallback-Text', fallbackText);
        check('Fehlende Sektorzeiten zeigen "–"', [...detail3].some(d => d.textContent.includes('–')));
        // RUS ist nicht in den (in diesem Test knappen) Wertungs-Sensoren enthalten -> kein Bild/Logo, kein kaputtes <img>.
        check('Kein Bild ohne Wertungs-Match (RUS)', ![...detail3].some(d => d.querySelector('.g-driver-photo')));

        let pass = 0;
        for (const [name, ok] of results) {
          console.log(`${ok ? '✅' : '❌'} ${name}`);
          if (ok) pass++;
        }
        console.log(`\n${pass}/${results.length} Tests bestanden`);
        process.exit(pass === results.length ? 0 : 1);
      }, 50);
    }, 80);
  }, 50);
}, 400);
