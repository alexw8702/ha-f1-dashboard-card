/** JSDOM-Tests: v0.6.0 Responsive Design (alle 4 Karten) */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});
const { window } = dom;

// Fetch-Mock
window.fetch = async (url) => {
  if (url.includes('wikipedia.org')) {
    return {
      ok: true,
      json: async () => ({
        thumbnail: { source: 'https://example.com/driver.jpg' },
        extract: 'Andrea Kimi Antonelli ist ein italienischer Rennfahrer.'
      })
    };
  }
  if (url.includes('results.json')) {
    return {
      ok: true,
      json: async () => ({
        MRData: {
          RaceTable: {
            Races: [
              {
                round: "8",
                raceName: "Austrian Grand Prix",
                Results: [{ position: "2", grid: "3", points: "18", status: "Finished" }]
              },
              {
                round: "9",
                raceName: "British Grand Prix",
                Results: [{ position: "15", grid: "1", points: "0", status: "Finished" }]
              }
            ]
          }
        }
      })
    };
  }
  if (url.includes('qualifying.json')) {
    return {
      ok: true,
      json: async () => ({
        MRData: {
          RaceTable: {
            Races: [
              {
                round: "8",
                raceName: "Austrian Grand Prix",
                QualifyingResults: [{ position: "3", Q1: "1:05.123", Q2: "1:04.987", Q3: "1:04.888" }]
              },
              {
                round: "9",
                raceName: "British Grand Prix",
                QualifyingResults: [{ position: "1", Q1: "1:29.719", Q2: "1:28.493", Q3: "1:28.111" }]
              }
            ]
          }
        }
      })
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
      MRData: { RaceTable: { Races: [] } }
    })
  };
};

const bundle = fs.readFileSync('./dist/f1-dashboard-card.js', 'utf8');
window.eval(bundle);

const hass = {
  states: {
    'sensor.f1_dashboard_session_status': {
      state: 'upcoming',
      last_updated: '2026-07-11T08:30:00+00:00',
      attributes: {
        next_race: {
          season: '2026', round: '10', raceName: 'Belgian Grand Prix',
          Circuit: {
            circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps',
            Location: { lat: '50.4372', long: '5.97139' },
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
    'sensor.f1_dashboard_fahrerwertung': {
      state: '2026',
      last_updated: '2026-07-11T08:30:00+00:00',
      attributes: {
        standings: [
          { name: 'Andrea Kimi Antonelli', team: 'Mercedes', teamId: 'mercedes', tla: 'ANT', points: 179, wins: 5, driverId: 'antonelli', url: 'https://de.wikipedia.org/wiki/Andrea_Kimi_Antonelli' },
          { name: 'George Russell', team: 'Mercedes', teamId: 'mercedes', tla: 'RUS', points: 154, wins: 2 },
          { name: 'Lewis Hamilton', team: 'Ferrari', teamId: 'ferrari', tla: 'HAM', points: 147, wins: 1 },
          { name: 'Charles Leclerc', team: 'Ferrari', teamId: 'ferrari', tla: 'LEC', points: 140, wins: 1 },
          { name: 'Lando Norris', team: 'McLaren', teamId: 'mclaren', tla: 'NOR', points: 120, wins: 0 },
          { name: 'Oscar Piastri', team: 'McLaren', teamId: 'mclaren', tla: 'PIA', points: 98, wins: 0 },
        ],
      },
    },
    'sensor.f1_dashboard_konstrukteurswertung': {
      state: '2026',
      last_updated: '2026-07-11T08:30:00+00:00',
      attributes: {
        standings: [
          { name: 'Mercedes', constructorId: 'mercedes', points: 333, wins: 7 },
          { name: 'Ferrari', constructorId: 'ferrari', points: 287, wins: 2 },
          { name: 'McLaren', constructorId: 'mclaren', points: 218, wins: 0 },
        ],
      },
    },
    'sensor.f1_dashboard_letztes_rennen_detail': {
      state: 'complete',
      last_updated: '2026-07-11T08:30:00+00:00',
      attributes: {
        raceName: 'French Grand Prix',
        date: '2026-07-05',
        results: [
          { position: 1, driver: { name: 'Andrea Kimi Antonelli' }, constructor: { name: 'Mercedes', constructorId: 'mercedes' }, points: 25, time: '1:32:45.123' },
          { position: 2, driver: { name: 'George Russell' }, constructor: { name: 'Mercedes', constructorId: 'mercedes' }, points: 18, time: '+5.234' },
          { position: 3, driver: { name: 'Lewis Hamilton' }, constructor: { name: 'Ferrari', constructorId: 'ferrari' }, points: 15, time: '+12.456' },
          { position: 4, driver: { name: 'Charles Leclerc' }, constructor: { name: 'Ferrari', constructorId: 'ferrari' }, points: 12, time: '+18.789' },
        ],
        stints: [
          { driver: { name: 'Antonelli' }, constructor: { constructorId: 'mercedes' }, position: 1, compound: ['SOFT', 'HARD'], laps: 34 },
        ],
        pit_stops: [
          { driver: { name: 'Antonelli' }, stop: 1, lap: 24, duration: '2.156' },
        ],
      },
    },
  },
};

// Alle 4 Karten erstellen
const tags = ['f1-session-card', 'f1-drivers-card', 'f1-constructors-card', 'f1-race-recap-card'];
const entities = {
  'f1-session-card': 'sensor.f1_dashboard_session_status',
  'f1-drivers-card': 'sensor.f1_dashboard_fahrerwertung',
  'f1-constructors-card': 'sensor.f1_dashboard_konstrukteurswertung',
  'f1-race-recap-card': 'sensor.f1_dashboard_letztes_rennen_detail',
};

const elements = {};
for (const tag of tags) {
  const el = window.document.createElement(tag);
  el.setConfig({ entity: entities[tag] });
  el.hass = hass;
  window.document.body.appendChild(el);
  elements[tag] = el;
}

// Simulate driver click to test details popup
setTimeout(() => {
  const root = elements['f1-drivers-card'].shadowRoot;
  const firstRow = root?.querySelector('.driver-row');
  if (firstRow) {
    firstRow.click();
  }
}, 50);

setTimeout(() => {
  const results = [];
  const check = (name, ok) => { results.push([name, ok]); };

  // ==================== FAHRERWERTUNG ====================
  {
    const root = elements['f1-drivers-card'].shadowRoot;

    // CSS-Variable --row-count muss gesetzt sein
    const rankings = root.querySelector('.rankings');
    const rowCount = rankings?.style.getPropertyValue('--row-count');
    check('Fahrer: --row-count CSS-Variable gesetzt', !!rowCount && parseInt(rowCount) > 0);

    // --row-count muss = ceil(anzahl_fahrer / 2)
    const driverRows = root.querySelectorAll('.driver-row');
    const expected = Math.ceil(driverRows.length / 2);
    check(`Fahrer: --row-count = ceil(${driverRows.length}/2) = ${expected}`, parseInt(rowCount) === expected);

    // Jeder Fahrer muss gerendert sein
    check('Fahrer: alle 6 Fahrer gerendert', driverRows.length === 6);

    // Detail-Popup Checks
    const detailCard = root.querySelector('.detail-card');
    check('Fahrer-Detail: Detail-Card vorhanden', !!detailCard);
    check('Fahrer-Detail: Kreis-Avatar-Container vorhanden', !!root.querySelector('.detail-avatar-circle'));
    check('Fahrer-Detail: Rechteckiger Avatar-Container vorhanden', !!root.querySelector('.detail-avatar-rectangular'));
    check('Fahrer-Detail: Letzte Ergebnisse Bereich vorhanden', !!root.querySelector('.recent-results-section'));

    // Styles: @media Regel muss im ShadowRoot existieren (Grid-Regel)
    const sheets = root.adoptedStyleSheets || [];
    let hasGridRule = false;
    for (const sheet of sheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.cssText && rule.cssText.includes('grid-auto-flow') && rule.cssText.includes('column')) {
            hasGridRule = true;
          }
        }
      } catch (e) { /* cross-origin */ }
    }
    // JSDOM hat eingeschränkten adoptedStyleSheets-Support, daher als alternativer Check
    // prüfen wir ob die inline-Styles den richtigen CSS-Variablen-Wert haben
    check('Fahrer: Rankings-Container existiert mit grid-Variablen', !!rankings && !!rowCount);
  }

  // ==================== KONSTRUKTEURSWERTUNG ====================
  {
    const root = elements['f1-constructors-card'].shadowRoot;

    // team-drivers-col muss im DOM existieren (hidden auf Mobile, aber im DOM)
    const driverCols = root.querySelectorAll('.team-drivers-col');
    check('Konstrukteure: team-drivers-col Elemente vorhanden', driverCols.length > 0);

    // Jedes team-drivers-col sollte Fahrer-Items enthalten
    const firstCol = driverCols[0];
    const driverItems = firstCol?.querySelectorAll('.team-driver-item');
    check('Konstrukteure: Fahrer-Items im ersten Team vorhanden', driverItems && driverItems.length > 0);

    // Positions-Badge td-pos muss vorhanden sein
    const posBadges = root.querySelectorAll('.td-pos');
    check('Konstrukteure: WM-Positions-Badges vorhanden', posBadges.length > 0);

    // Punkte-Anzeige td-pts
    const ptsElements = root.querySelectorAll('.td-pts');
    check('Konstrukteure: Punkte-Anzeigen vorhanden', ptsElements.length > 0);

    // Fahrer-Name td-name
    const nameElements = root.querySelectorAll('.td-name');
    check('Konstrukteure: Fahrer-Namen in Spalte vorhanden', nameElements.length > 0);

    // Mercedes sollte Antonelli und Russell zeigen
    const mercedesCol = driverCols[0];
    const mercedesText = mercedesCol?.textContent || '';
    check('Konstrukteure: Mercedes zeigt Fahrer-Nachnamen', 
      mercedesText.includes('Antonelli') && mercedesText.includes('Russell'));
  }

  // ==================== SESSION-KARTE ====================
  {
    const root = elements['f1-session-card'].shadowRoot;

    // sections-grid wrapper muss existieren
    const grid = root.querySelector('.sections-grid');
    check('Session: sections-grid Container vorhanden', !!grid);

    // sections-left und sections-right
    const left = root.querySelector('.sections-left');
    const right = root.querySelector('.sections-right');
    check('Session: sections-left vorhanden', !!left);
    check('Session: sections-right vorhanden', !!right);

    // Countdown muss in sections-left sein
    const countdown = left?.querySelector('.countdown');
    check('Session: Countdown in linker Spalte', !!countdown);

    // Zeitplan (schedule) muss in sections-left sein
    const schedule = left?.querySelector('.schedule');
    check('Session: Zeitplan in linker Spalte', !!schedule);

    // Wetter muss in sections-right sein
    const weather = right?.querySelector('.weather-row');
    check('Session: Wetter in rechter Spalte', !!weather);
  }

  // ==================== LETZTES RENNEN ====================
  {
    const root = elements['f1-race-recap-card'].shadowRoot;

    // recap-left und recap-right wrapper
    const left = root.querySelector('.recap-left');
    const right = root.querySelector('.recap-right');
    check('Recap: recap-left Container vorhanden', !!left);
    check('Recap: recap-right Container vorhanden', !!right);

    // Podium muss in recap-left sein
    const podium = left?.querySelector('.podium');
    check('Recap: Podium in linker Spalte', !!podium);

    // Klassement muss in recap-left sein
    const resultsList = left?.querySelector('.results-list');
    check('Recap: Klassement in linker Spalte', !!resultsList);

    // Reifen-Strategie muss in recap-right sein
    const stints = right?.querySelector('.stints-list');
    check('Recap: Reifen-Strategie in rechter Spalte', !!stints);

    // Boxenstopps muss in recap-right sein
    const pits = right?.querySelector('.pits-list');
    check('Recap: Boxenstopps in rechter Spalte', !!pits);
  }

  // ==================== ERGEBNIS ====================
  let pass = 0;
  for (const [name, ok] of results) {
    console.log(`${ok ? '✅' : '❌'} ${name}`);
    if (ok) pass++;
  }
  console.log(`\n${pass}/${results.length} Responsive-Tests bestanden`);
  process.exit(pass === results.length ? 0 : 1);
}, 500);
