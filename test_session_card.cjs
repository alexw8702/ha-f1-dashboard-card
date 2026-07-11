/** JSDOM-Test: f1-session-card (Vue 3) mit realen Sensor-Daten */
const { JSDOM } = require('/home/claude/f1/node_modules/jsdom');
const fs = require('fs');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});
const { window } = dom;

// Fetch-Mock: Open-Meteo liefert Wochenend-Wetter
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
  check('Track-SVG (outline path)', !!root.querySelector('.track-outline'));
  check('Wetter Fr/Sa/So gerendert', (root.querySelectorAll('.weather-day').length === 3));
  check('Renntag-Highlight im Wetter', !!root.querySelector('.weather-day.race'));

  let pass = 0;
  for (const [name, ok] of results) {
    console.log(`${ok ? '✅' : '❌'} ${name}`);
    if (ok) pass++;
  }
  console.log(`\n${pass}/${results.length} Tests bestanden`);
  process.exit(pass === results.length ? 0 : 1);
}, 400);
