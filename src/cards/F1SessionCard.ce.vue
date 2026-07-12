<script setup>
/**
 * F1 Session Card (v0.4.0) — Rennwochenende
 * Design: Carbon-Dark, F1-Rot-Akzente, kollabierbare Sections, Daten-Chips.
 * Datenfluss: HA-Sensor (session_status) als Trigger → Streckenfakten lokal,
 * Wetter direkt via Open-Meteo, Live-Daten über HA-Sensoren.
 */
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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

/* ---------- Streckenkarte: enger Zuschnitt + Rotation für maximale Größe ---------- */
/* Manche Strecken (z.B. Spa) sind in ihrer Outline sehr hochformatig, während der
 * Anzeigebereich (Hero-Header) eher breit ist - das lässt die Karte winzig und
 * mittig in viel Leerraum wirken. Statt pro Strecke von Hand eine Bounding-Box zu
 * pflegen, wird sie zur Laufzeit per SVG getBBox() gemessen: hochformatige Outlines
 * (Höhe > Breite * 1.15) werden um 90° um ihren eigenen Mittelpunkt gedreht, und das
 * viewBox wird eng auf die (ggf. gedrehte) Bounding-Box zugeschnitten, statt das feste
 * 500x500-Basis-viewBox zu nutzen. So skaliert preserveAspectRatio="meet" die Strecke
 * verzerrungsfrei auf die maximal mögliche Größe im verfügbaren Bereich.
 */
const trackGroup = ref(null)
const trackFit = ref(null)

async function updateTrackFit() {
  trackFit.value = null // zurücksetzen, damit die neue Strecke ungedreht gemessen wird
  await nextTick()
  const el = trackGroup.value
  if (!el || typeof el.getBBox !== 'function') return
  let bbox
  try { bbox = el.getBBox() } catch { return }
  if (!bbox || !bbox.width || !bbox.height) return
  const rotate = bbox.height > bbox.width * 1.15
  const pad = Math.max(bbox.width, bbox.height) * 0.04
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2
  const w = (rotate ? bbox.height : bbox.width) + pad * 2
  const h = (rotate ? bbox.width : bbox.height) + pad * 2
  trackFit.value = {
    viewBox: `${cx - w / 2} ${cy - h / 2} ${w} ${h}`,
    transform: rotate ? `rotate(90 ${cx} ${cy})` : null,
    aspect: w / h,
  }
}
watch(circuitData, updateTrackFit, { immediate: true })

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
          <div class="eyebrow-line">
            <span class="eyebrow">Nächstes Rennen</span>
            <span class="badge" :class="statusLabel.cls">{{ statusLabel.text }}</span>
          </div>
          <h1>{{ nextRace?.raceName ?? 'Kein Rennen' }}</h1>
          <div class="circuit-line" v-if="circuit">
            <span class="circuit-name">{{ circuit.circuitName }}</span>
          </div>
          <div class="date-range">{{ dateRange }}</div>

          <!-- ================= FAKTEN-CHIPS ================= -->
          <!-- Teil der Titelspalte statt eigener Zeile darunter: dadurch bestimmen
               Titel + Fakten gemeinsam die Höhe der Kopfzeile, an der sich die
               Streckenkarte per align-items:stretch orientiert. -->
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
            <div class="chip">
              <span class="chip-value">{{ circuitData.elev }} m</span>
              <span class="chip-label">Höhenmeter</span>
            </div>
            <div class="chip chip-record" v-if="circuitData.record">
              <span class="chip-value">{{ circuitData.record }}</span>
              <span class="chip-label">Rundenrekord</span>
            </div>
          </div>
        </div>
        <div class="hero-track" v-if="circuitData" :style="trackFit ? { aspectRatio: trackFit.aspect } : null">
          <svg :viewBox="trackFit?.viewBox ?? circuitData.vb" preserveAspectRatio="xMidYMid meet">
            <g ref="trackGroup" :transform="trackFit?.transform">
              <path :d="circuitData.outline" class="track-outline" />
              <path v-if="circuitData.sf" :d="circuitData.sf" class="track-sf" />
              <path v-if="circuitData.arrow" :d="circuitData.arrow" class="track-arrow" />
            </g>
          </svg>
        </div>
      </header>

      <!-- ================= RESPONSIVE SECTIONS GRID ================= -->
      <div class="sections-grid">
        <div class="sections-left">
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
        </div>

        <div class="sections-right">
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
        </div>
      </div>

      <!-- ================= FOOTER ================= -->
      <footer class="foot">
        Wetter aktualisiert: {{ updatedLabel }}
      </footer>
    </template>
  </div>
</template>

<style>
:host { display: block; container-type: inline-size; }
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
/* flex-wrap statt fester Breakpoint: der Zeilenumbruch entsteht, sobald Titeltext
 * (min. 240px) und Streckenkarte (min. 130px) nicht mehr nebeneinander passen -
 * abhängig von den tatsächlichen Inhaltsgrößen, nicht von einem willkürlichen
 * Pixel-Schwellwert der Karte selbst. */
.hero { display: flex; flex-wrap: wrap; gap: 16px; align-items: stretch; }
.hero-text { flex: 1 1 240px; min-width: 0; }
.eyebrow-line { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.eyebrow {
  color: var(--red);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
}
.hero h1 { font-size: 24px; font-weight: 700; margin: 6px 0 4px; line-height: 1.15; }
.circuit-name { color: var(--text-dim); font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; }
.date-range { color: var(--text); font-size: 13px; margin-top: 6px; letter-spacing: 0.06em; }
.badge {
  display: inline-block;
  font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
  padding: 3px 10px; border-radius: 999px;
  border: 1px solid var(--panel-border);
}
.badge.upcoming { color: #7fb2ff; border-color: rgba(127, 178, 255, 0.4); background: rgba(127, 178, 255, 0.08); }
.badge.live { color: #fff; background: var(--red); border-color: var(--red); animation: pulse 1.6s infinite; }
.badge.idle { color: var(--text-dim); }
@keyframes pulse { 50% { opacity: 0.6; } }

/* Größe kommt jetzt aus aspect-ratio (per JS aus der echten Track-Bounding-Box
 * berechnet, siehe trackFit) statt aus einer festen Breite - dadurch nutzt die
 * Karte per align-items:stretch die volle Höhe der Titelspalte aus (vorher blieb
 * bei breiten, kurzen Tracks Leerraum unter dem Bild), und die intrinsische Größe
 * fließt korrekt in die flex-wrap-Umbruchberechnung von .hero ein. */
.hero-track { flex: 0 1 auto; min-width: 120px; max-width: 45%; }
.hero-track svg { width: 100%; height: 100%; display: block; }
.track-outline { fill: none; stroke: #fff; stroke-width: 9; stroke-linejoin: round; opacity: 0.92; }
.track-sf { fill: var(--red); }
.track-arrow { fill: none; stroke: var(--teal); stroke-width: 5; }

/* ---------- Chips ---------- */
/* Ein einziger Streifen statt fünf einzeln umrandeter Boxen: bei breiten Karten
 * stretchte vorher jede Box per grid-1fr auf die volle Restbreite und wirkte dadurch
 * winzig und mittig in viel Leerraum. Die Chips wachsen jetzt nicht mehr einzeln,
 * sondern bleiben kompakt (flex: 0 1 auto) und der Streifen bleibt links ausgerichtet -
 * überschüssiger Platz bleibt schlicht als Rand rechts, statt jede Box aufzublähen. */
.chips {
  display: inline-flex;
  flex-wrap: wrap;
  max-width: 100%;
  margin-top: 18px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  overflow: hidden;
}
.chip {
  flex: 0 1 auto;
  min-width: 76px;
  padding: 9px 14px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  border-right: 1px solid var(--panel-border);
}
.chip:last-child { border-right: none; }
.chip-value { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.chip-label { font-size: 9px; color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; text-align: center; white-space: nowrap; }

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
.schedule td { padding: 9px 16px; font-size: 13px; border-top: 1px solid var(--panel-border); white-space: nowrap; }
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
.w-detail { font-size: 10.5px; color: var(--text-dim); white-space: nowrap; }
.w-empty { grid-column: 1 / -1; color: var(--text-dim); font-size: 12px; text-align: center; padding: 8px; }

/* ---------- Footer ---------- */
.foot {
  margin-top: 14px; text-align: center;
  font-size: 9.5px; color: var(--text-dim);
  letter-spacing: 0.12em; text-transform: uppercase;
}

/* ---------- Responsive Sections Grid ---------- */
.sections-grid {
  display: flex;
  flex-direction: column;
}
.sections-left, .sections-right {
  display: flex;
  flex-direction: column;
}

@container (min-width: 680px) {
  .sections-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 4px;
  }
  .weather-row {
    grid-template-columns: 1fr !important;
    gap: 8px !important;
  }
  .weather-day {
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 18px;
    gap: 14px;
  }
  .w-label { min-width: 28px; }
  .w-icon { font-size: 26px; }
  .w-temp { font-size: 17px; }
  .w-detail { font-size: 12px; min-width: 64px; text-align: left; }
}

@container (max-width: 460px) {
  /* Sobald .hero umbricht (organisch via flex-wrap, siehe oben), soll die
   * Streckenkarte weiterhin oberhalb des Titels erscheinen wie zuvor - reine
   * Reihenfolge-/Größenkosmetik, nicht die Umbruch-Entscheidung selbst.
   * max-width ist jetzt relativ (75%) statt eines festen Pixelwerts, damit die
   * Karte den frei gewordenen Platz tatsächlich ausfüllt statt künstlich klein
   * zu bleiben; margin:auto zentriert sie in ihrer eigenen (umgebrochenen) Zeile. */
  .hero-track { order: -1; width: auto; max-width: 75%; height: auto; margin: 0 auto; }
  .hero-track svg { width: 100%; height: auto; }
  /* Die vier übrigen Werte teilen sich gleichmäßig die Zeilenbreite, statt anhand
   * ihrer Mindestbreite einzeln umzubrechen - so bleiben sie zu viert in einer Zeile,
   * bevor der Rundenrekord als eigene zentrierte Zeile darunter folgt. */
  .chip:not(.chip-record) { flex: 1 1 0; min-width: 0; padding: 8px 4px; }
  .chip-value { font-size: 13px; }
  .chip-label { font-size: 8px; }
  .chip-record { flex: 1 1 100%; border-right: none; border-top: 1px solid var(--panel-border); }
  /* Streifen selbst zentrieren statt linksbündig (inline-flex sitzt sonst am Zeilenanfang) */
  .chips { display: flex; width: fit-content; max-width: 100%; margin: 18px auto 0; }
}
</style>
