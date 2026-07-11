<script setup>
/**
 * F1 Session Card (v0.4.0) — Rennwochenende
 * Design: Carbon-Dark, F1-Rot-Akzente, kollabierbare Sections, Daten-Chips.
 * Datenfluss: HA-Sensor (session_status) als Trigger → Streckenfakten lokal,
 * Wetter direkt via Open-Meteo, Live-Daten über HA-Sensoren.
 */
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { CIRCUITS } from '../data/circuits.js'
import { useWeather, weatherIcon } from '../composables/useWeather.js'

const props = defineProps({
  hass: { type: Object, default: null },
  config: { type: Object, default: () => ({}) },
})

/* ---------- Sensor-Zugriff (Trigger) ---------- */
const sessionEntity = computed(() =>
  props.config?.entity || 'sensor.f1_dashboard_session_status')

const sessionState = computed(() =>
  props.hass?.states?.[sessionEntity.value] ?? null)

const nextRace = computed(() => sessionState.value?.attributes?.next_race ?? null)
const activeSession = computed(() => sessionState.value?.attributes?.active_session ?? null)

const circuit = computed(() => nextRace.value?.Circuit ?? null)
const circuitData = computed(() => CIRCUITS[circuit.value?.circuitId] ?? null)

/* ---------- Zeitplan ---------- */
const SESSION_LABELS = [
  ['FirstPractice', 'FP1'],
  ['SecondPractice', 'FP2'],
  ['ThirdPractice', 'FP3'],
  ['SprintQualifying', 'Sprint-Quali'],
  ['Sprint', 'Sprint'],
  ['Qualifying', 'Quali'],
]

const schedule = computed(() => {
  const race = nextRace.value
  if (!race) return []
  const rows = []
  for (const [key, label] of SESSION_LABELS) {
    if (race[key]?.date) rows.push({ label, ...toLocal(race[key]) })
  }
  rows.push({ label: 'Rennen', ...toLocal(race), highlight: true })
  return rows
})

function toLocal({ date, time }) {
  const d = new Date(`${date}T${time || '00:00:00Z'}`)
  return {
    dt: d,
    day: d.toLocaleDateString('de-DE', { weekday: 'short' }),
    date: d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }),
    time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
  }
}

const dateRange = computed(() => {
  const s = schedule.value
  if (!s.length) return ''
  const first = s[0].dt, last = s[s.length - 1].dt
  const opts = { day: 'numeric', month: 'short' }
  return `${first.toLocaleDateString('de-DE', opts)} – ${last.toLocaleDateString('de-DE', opts)} ${last.getFullYear()}`
})

/* ---------- Countdown ---------- */
const now = ref(Date.now())
let tick = null
onMounted(() => { tick = setInterval(() => (now.value = Date.now()), 1000) })
onUnmounted(() => clearInterval(tick))

const nextSession = computed(() =>
  schedule.value.find(s => s.dt.getTime() > now.value) ?? null)

const countdown = computed(() => {
  if (!nextSession.value) return null
  let diff = Math.max(0, nextSession.value.dt.getTime() - now.value) / 1000
  const d = Math.floor(diff / 86400); diff -= d * 86400
  const h = Math.floor(diff / 3600); diff -= h * 3600
  const m = Math.floor(diff / 60)
  const s = Math.floor(diff - m * 60)
  const p = n => String(n).padStart(2, '0')
  return (d > 0 ? `${d}T ` : '') + `${p(h)}:${p(m)}:${p(s)}`
})

/* ---------- Wetter (direkt, Open-Meteo) ---------- */
const coords = computed(() => {
  const loc = circuit.value?.Location
  return loc ? { lat: loc.lat, lon: loc.long } : null
})
const { daily: weather, updatedAt } = useWeather(coords)

/** Wetter für Fr/Sa/So des Rennwochenendes */
const weekendWeather = computed(() => {
  if (!weather.value || !nextRace.value?.date) return []
  const raceDate = new Date(`${nextRace.value.date}T12:00:00Z`)
  const out = []
  for (const offset of [-2, -1, 0]) {
    const d = new Date(raceDate); d.setDate(d.getDate() + offset)
    const iso = d.toISOString().slice(0, 10)
    const i = weather.value.time.indexOf(iso)
    if (i < 0) continue
    out.push({
      label: d.toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase(),
      icon: weatherIcon(weather.value.code[i]),
      tMax: Math.round(weather.value.tMax[i]),
      tMin: Math.round(weather.value.tMin[i]),
      rain: weather.value.rain[i],
      wind: Math.round(weather.value.wind?.[i] ?? 0),
      isRaceDay: offset === 0,
    })
  }
  return out
})

/* ---------- Sections (kollabierbar) ---------- */
const openSections = ref({ schedule: true, conditions: true })
const toggle = key => (openSections.value[key] = !openSections.value[key])

/* ---------- Status-Badge ---------- */
const statusLabel = computed(() => {
  if (activeSession.value) return { text: 'LIVE', cls: 'live' }
  if (sessionState.value?.state === 'upcoming') return { text: 'ANSTEHEND', cls: 'upcoming' }
  return { text: sessionState.value?.state?.toUpperCase() ?? '–', cls: 'idle' }
})

const updatedLabel = computed(() =>
  updatedAt.value
    ? updatedAt.value.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '–')
</script>

<template>
  <div class="card carbon">
    <!-- Fehlerzustand -->
    <div v-if="!sessionState" class="error">
      Sensor {{ sessionEntity }} nicht gefunden
    </div>

    <template v-else>
      <!-- ================= HEADER ================= -->
      <header class="hero">
        <div class="hero-text">
          <span class="eyebrow">Nächstes Rennen</span>
          <h1>{{ nextRace?.raceName ?? 'Kein Rennen' }}</h1>
          <div class="circuit-line" v-if="circuit">
            <span class="circuit-name">{{ circuit.circuitName }}</span>
          </div>
          <div class="date-range">{{ dateRange }}</div>
          <span class="badge" :class="statusLabel.cls">{{ statusLabel.text }}</span>
        </div>
        <div class="hero-track" v-if="circuitData">
          <svg :viewBox="circuitData.vb" preserveAspectRatio="xMidYMid meet">
            <path :d="circuitData.outline" class="track-outline" />
            <path v-if="circuitData.sf" :d="circuitData.sf" class="track-sf" />
            <path v-if="circuitData.arrow" :d="circuitData.arrow" class="track-arrow" />
          </svg>
        </div>
      </header>

      <!-- ================= FAKTEN-CHIPS ================= -->
      <div class="chips" v-if="circuitData">
        <div class="chip">
          <span class="chip-value">{{ circuitData.km.toLocaleString('de-DE', { minimumFractionDigits: 3 }) }}</span>
          <span class="chip-label">km Strecke</span>
        </div>
        <div class="chip">
          <span class="chip-value">{{ circuitData.laps }}</span>
          <span class="chip-label">Runden</span>
        </div>
        <div class="chip">
          <span class="chip-value">{{ circuitData.corners }}</span>
          <span class="chip-label">Kurven</span>
        </div>
        <div class="chip" v-if="circuitData.record">
          <span class="chip-value">{{ circuitData.record }}</span>
          <span class="chip-label">Rundenrekord</span>
        </div>
        <div class="chip">
          <span class="chip-value">{{ circuitData.elev }} m</span>
          <span class="chip-label">Höhenmeter</span>
        </div>
      </div>

      <!-- ================= COUNTDOWN ================= -->
      <div class="countdown" v-if="countdown && nextSession">
        <span class="countdown-label">Nächste Session · {{ nextSession.label }}</span>
        <span class="countdown-value">{{ countdown }}</span>
      </div>

      <!-- ================= ZEITPLAN ================= -->
      <section class="section">
        <button class="section-head" @click="toggle('schedule')">
          <span>Wochenende Zeitplan</span>
          <span class="chevron" :class="{ open: openSections.schedule }">⌃</span>
        </button>
        <table v-if="openSections.schedule" class="schedule">
          <tbody>
            <tr v-for="row in schedule" :key="row.label" :class="{ highlight: row.highlight, past: row.dt.getTime() < now }">
              <td class="s-label">{{ row.label }}</td>
              <td class="s-date">{{ row.day }}, {{ row.date }}</td>
              <td class="s-time">{{ row.time }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- ================= WETTER AM CIRCUIT ================= -->
      <section class="section">
        <button class="section-head" @click="toggle('conditions')">
          <span>Strecken-Bedingungen</span>
          <span class="chevron" :class="{ open: openSections.conditions }">⌃</span>
        </button>
        <div v-if="openSections.conditions" class="weather-row">
          <div v-for="w in weekendWeather" :key="w.label" class="weather-day" :class="{ race: w.isRaceDay }">
            <span class="w-label">{{ w.label }}</span>
            <span class="w-icon">{{ w.icon }}</span>
            <span class="w-temp">{{ w.tMax }}°<small>/{{ w.tMin }}°</small></span>
            <span class="w-detail">💧 {{ w.rain ?? '–' }}%</span>
            <span class="w-detail">💨 {{ w.wind }} km/h</span>
          </div>
          <div v-if="!weekendWeather.length" class="w-empty">Wetterdaten werden geladen …</div>
        </div>
      </section>

      <!-- ================= FOOTER ================= -->
      <footer class="foot">
        Wetter aktualisiert: {{ updatedLabel }}
      </footer>
    </template>
  </div>
</template>

<style>
:host { display: block; }
* { box-sizing: border-box; margin: 0; padding: 0; }

.card {
  --red: #e10600;
  --teal: #00e6c3;
  --bg: #101017;
  --panel: rgba(255, 255, 255, 0.035);
  --panel-border: rgba(255, 255, 255, 0.07);
  --text: #f2f2f5;
  --text-dim: #9a9aa6;
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  position: relative;
}

/* Carbon-Textur */
.carbon::before {
  content: '';
  position: absolute; inset: 0;
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 6px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 6px);
  pointer-events: none;
}

.error { color: var(--text-dim); padding: 24px; text-align: center; }

/* ---------- Header ---------- */
.hero { display: flex; gap: 16px; align-items: flex-start; }
.hero-text { flex: 1 1 55%; min-width: 0; }
.eyebrow {
  color: var(--red);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
}
.hero h1 { font-size: 24px; font-weight: 700; margin: 6px 0 4px; line-height: 1.15; }
.circuit-name { color: var(--text-dim); font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; }
.date-range { color: var(--text); font-size: 13px; margin-top: 6px; letter-spacing: 0.06em; }
.badge {
  display: inline-block; margin-top: 10px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
  padding: 4px 10px; border-radius: 999px;
  border: 1px solid var(--panel-border);
}
.badge.upcoming { color: #7fb2ff; border-color: rgba(127, 178, 255, 0.4); background: rgba(127, 178, 255, 0.08); }
.badge.live { color: #fff; background: var(--red); border-color: var(--red); animation: pulse 1.6s infinite; }
.badge.idle { color: var(--text-dim); }
@keyframes pulse { 50% { opacity: 0.6; } }

.hero-track { flex: 0 0 40%; max-width: 190px; }
.hero-track svg { width: 100%; height: auto; display: block; }
.track-outline { fill: none; stroke: #fff; stroke-width: 9; stroke-linejoin: round; opacity: 0.92; }
.track-sf { fill: var(--red); }
.track-arrow { fill: none; stroke: var(--teal); stroke-width: 5; }

/* ---------- Chips ---------- */
.chips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 8px; margin-top: 18px;
}
.chip {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 10px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.chip-value { font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
.chip-label { font-size: 9.5px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }

/* ---------- Countdown ---------- */
.countdown {
  margin-top: 14px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-left: 3px solid var(--red);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex; flex-direction: column; gap: 4px;
}
.countdown-label { font-size: 10px; color: var(--text-dim); letter-spacing: 0.14em; text-transform: uppercase; }
.countdown-value { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 0.03em; }

/* ---------- Sections ---------- */
.section {
  margin-top: 14px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
}
.section-head {
  width: 100%;
  display: flex; justify-content: space-between; align-items: center;
  background: none; border: none; cursor: pointer;
  color: var(--teal);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  padding: 12px 16px;
  font-family: inherit;
}
.chevron { transition: transform 0.25s; transform: rotate(180deg); color: var(--text-dim); }
.chevron.open { transform: rotate(0deg); }

/* ---------- Zeitplan ---------- */
.schedule { width: 100%; border-collapse: collapse; }
.schedule td { padding: 9px 16px; font-size: 13px; border-top: 1px solid var(--panel-border); }
.schedule .s-label { font-weight: 600; }
.schedule .s-date { color: var(--text-dim); }
.schedule .s-time { text-align: right; font-variant-numeric: tabular-nums; }
.schedule tr.past td { opacity: 0.45; }
.schedule tr.highlight td { color: var(--red); font-weight: 700; background: rgba(225, 6, 0, 0.06); }

/* ---------- Wetter ---------- */
.weather-row {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; padding: 4px 12px 12px;
}
.weather-day {
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 10px 6px;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.weather-day.race { border-color: rgba(225, 6, 0, 0.5); }
.w-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--text-dim); }
.w-icon { font-size: 20px; }
.w-temp { font-size: 14px; font-weight: 700; }
.w-temp small { color: var(--text-dim); font-weight: 400; }
.w-detail { font-size: 10.5px; color: var(--text-dim); }
.w-empty { grid-column: 1 / -1; color: var(--text-dim); font-size: 12px; text-align: center; padding: 8px; }

/* ---------- Footer ---------- */
.foot {
  margin-top: 14px; text-align: center;
  font-size: 9.5px; color: var(--text-dim);
  letter-spacing: 0.12em; text-transform: uppercase;
}

@media (max-width: 420px) {
  .hero { flex-direction: column-reverse; }
  .hero-track { max-width: 150px; align-self: center; }
}
</style>
