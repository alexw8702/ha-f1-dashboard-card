/** JSDOM-Tests: Alle 4 F1-Karten (Vue 3 v0.4.0) */
const { JSDOM } = require('/home/claude/f1/node_modules/jsdom');
const fs = require('fs');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});
const { window } = dom;

// Fetch-Mock
window.fetch = async (url) => ({
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
});

const bundle = fs.readFileSync('/home/claude/f1-vue-redesign/dist/f1-dashboard-card.js', 'utf8');
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
          { name: 'Andrea Kimi Antonelli', team: 'Mercedes', teamId: 'mercedes', points: 179, wins: 5 },
          { name: 'George Russell', team: 'Mercedes', teamId: 'mercedes', points: 154, wins: 2 },
          { name: 'Lewis Hamilton', team: 'Ferrari', teamId: 'ferrari', points: 147, wins: 1 },
        ],
      },
    },
    'sensor.f1_dashboard_konstrukteurswertung': {
      state: '2026',
      last_updated: '2026-07-11T08:30:00+00:00',
      attributes: {
        standings: [
          { name: 'Mercedes', constructorId: 'mercedes', points: 333, wins: 7 },
          { name: 'Ferrari', constructorId: 'ferrari', points: 255, wins: 2 },
          { name: 'McLaren', constructorId: 'mclaren', points: 179, wins: 0 },
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
        ],
        stints: [
          { driver: { name: 'Antonelli' }, constructor: { constructorId: 'mercedes' }, position: 1, compound: ['SOFT', 'HARD'], laps: 34 },
          { driver: { name: 'Russell' }, constructor: { constructorId: 'mercedes' }, position: 2, compound: ['MEDIUM', 'HARD'], laps: 34 },
        ],
        pit_stops: [
          { driver: { name: 'Antonelli' }, stop: 1, lap: 24, duration: '2.156' },
          { driver: { name: 'Russell' }, stop: 1, lap: 25, duration: '2.341' },
        ],
      },
    },
  },
};

// Teste jede Karte
const cards = ['f1-session-card', 'f1-drivers-card', 'f1-constructors-card', 'f1-race-recap-card'];
const results = [];

cards.forEach(tag => {
  const el = window.document.createElement(tag);
  
  // Config + hass setzen
  if (tag === 'f1-session-card') {
    el.setConfig({ entity: 'sensor.f1_dashboard_session_status' });
  } else if (tag === 'f1-drivers-card') {
    el.setConfig({ entity: 'sensor.f1_dashboard_fahrerwertung' });
  } else if (tag === 'f1-constructors-card') {
    el.setConfig({ entity: 'sensor.f1_dashboard_konstrukteurswertung' });
  } else if (tag === 'f1-race-recap-card') {
    el.setConfig({ entity: 'sensor.f1_dashboard_letztes_rennen_detail' });
  }
  
  el.hass = hass;
  window.document.body.appendChild(el);

  setTimeout(() => {
    const root = el.shadowRoot;
    const text = root ? root.textContent : '';
    const ok = text.length > 50 && !text.includes('Sensor');
    results.push([tag, ok]);
    console.log(`${ok ? '✅' : '❌'} ${tag}`);

    if (results.length === cards.length) {
      const pass = results.filter(r => r[1]).length;
      console.log(`\n${pass}/${cards.length} Karten erfolgreich gerendert`);
      process.exit(pass === cards.length ? 0 : 1);
    }
  }, 300);
});
