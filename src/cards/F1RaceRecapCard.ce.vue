<script setup>
/**
 * F1 Race Recap Card (v0.4.0) — Letztes Rennen
 * Design: Podium + Ergebnis, Reifen-Strategie, Boxenstopps
 */
import { computed } from 'vue'
import { TEAM_COLORS } from '../data/teams.js'

const props = defineProps({
  hass: { type: Object, default: null },
  config: { type: Object, default: () => ({}) },
})

const entity = computed(() =>
  props.config?.entity || 'sensor.f1_dashboard_letztes_rennen_detail')

const state = computed(() =>
  props.hass?.states?.[entity.value] ?? null)

const recap = computed(() => state.value?.attributes ?? {})

const raceName = computed(() => recap.value.circuit_short_name || recap.value.raceName || 'Rennen')
const raceDate = computed(() => recap.value.date || recap.value.country_name || '–')

const results = computed(() => {
  const raw = recap.value.results || []
  return raw.slice(0, 10).map(r => ({
    pos: r.position || 0,
    name: r.driver?.name || '–',
    teamId: r.constructor?.constructorId || '',
    team: r.constructor?.name || '–',
    points: r.points || 0,
    time: r.time || '+1 Lap',
  }))
})

const podium = computed(() => results.value.slice(0, 3))

const stints = computed(() => recap.value.stints || [])
const pitStops = computed(() => recap.value.pit_stops || [])

function teamColor(teamId) {
  return TEAM_COLORS[teamId] || '#7a7a80'
}

function tireColor(tire) {
  const t = (tire || '').toLowerCase()
  if (t.includes('soft') || t.includes('red')) return '#e81828'
  if (t.includes('medium') || t.includes('yellow')) return '#ffd700'
  if (t.includes('hard') || t.includes('white')) return '#f2f2f5'
  if (t.includes('inter')) return '#00aa00'
  if (t.includes('wet')) return '#0066ff'
  return '#7a7a80'
}

function tireName(tire) {
  const t = (tire || '').toUpperCase()
  if (t.includes('SOFT')) return 'S'
  if (t.includes('MEDIUM')) return 'M'
  if (t.includes('HARD')) return 'H'
  if (t.includes('INTER')) return 'I'
  if (t.includes('WET')) return 'W'
  return '?'
}
</script>

<template>
  <div class="card carbon recap">
    <!-- Header -->
    <header class="header">
      <div>
        <span class="eyebrow">Ergebnis & Analyse</span>
        <h1>{{ raceName }}</h1>
        <p class="subtitle">{{ raceDate }}</p>
      </div>
    </header>

    <div v-if="!state" class="error">
      Sensor {{ entity }} nicht gefunden
    </div>

    <div v-else class="recap-content">
      <div class="recap-left">
        <!-- ================= PODIUM ================= -->
        <section v-if="podium.length > 0" class="podium-section">
          <h2>Podium</h2>
          <div class="podium">
            <div v-for="driver in podium" :key="driver.pos" class="podium-place" :class="`place-${driver.pos}`">
              <div class="podium-num">{{ driver.pos }}</div>
              <div class="podium-name">{{ driver.name }}</div>
              <div class="podium-team" :style="{ color: teamColor(driver.teamId) }">{{ driver.team }}</div>
              <div class="podium-points">{{ driver.points }} Pts</div>
            </div>
          </div>
        </section>

        <!-- ================= ERGEBNISSE 4-10 ================= -->
        <section v-if="results.length > 3" class="results-section">
          <h2>Klassement</h2>
          <div class="results-list">
            <div v-for="r in results.slice(3)" :key="r.pos" class="result-row">
              <span class="result-pos">{{ r.pos }}</span>
              <span class="result-name">{{ r.name }}</span>
              <span class="result-team">{{ r.team }}</span>
              <span class="result-points">{{ r.points }}</span>
            </div>
          </div>
        </section>
      </div>

      <div class="recap-right">
        <!-- ================= REIFEN-STRATEGIE ================= -->
        <section v-if="stints.length > 0" class="stints-section">
          <h2>Reifen-Strategie (Top 5)</h2>
          <div class="stints-list">
            <div v-for="(stint, idx) in stints.slice(0, 5)" :key="idx" class="stint-row">
              <span class="stint-driver">{{ stint.driver?.name || 'P' + stint.position }}</span>
              <div class="stint-tires" :style="{ borderColor: teamColor(stint.constructor?.constructorId) }">
                <span
                  v-for="(tire, ti) in stint.compound"
                  :key="ti"
                  class="tire"
                  :style="{ backgroundColor: tireColor(tire), color: tireColor(tire) === '#f2f2f5' ? '#000' : '#fff' }"
                >
                  {{ tireName(tire) }}
                </span>
              </div>
              <span class="stint-laps">{{ stint.laps || '–' }} Rd</span>
            </div>
          </div>
        </section>

        <!-- ================= BOXENSTOPPS ================= -->
        <section v-if="pitStops.length > 0" class="pits-section">
          <h2>Boxenstopps (Top 5)</h2>
          <div class="pits-list">
            <div v-for="(pit, idx) in pitStops.slice(0, 5)" :key="idx" class="pit-row">
              <span class="pit-driver">{{ pit.driver?.name || '–' }}</span>
              <span class="pit-stop">Stop {{ pit.stop }}</span>
              <span class="pit-lap">R{{ pit.lap }}</span>
              <span class="pit-time">{{ pit.duration || '–' }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Footer -->
    <footer class="foot">
      Daten aus OpenF1 | Letzte Aktualisierung
    </footer>
  </div>
</template>

<style>
:host { display: block; }
* { box-sizing: border-box; margin: 0; padding: 0; }

.card {
  --text: #f2f2f5;
  --text-dim: #9a9aa6;
  --bg: #101017;
  --panel: rgba(255, 255, 255, 0.035);
  --panel-border: rgba(255, 255, 255, 0.07);
  --red: #e10600;
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute; inset: 0;
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 6px),
    repeating-linear-gradient(-45deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 6px);
  pointer-events: none;
  z-index: 0;
}

.header {
  position: relative; z-index: 1;
  margin-bottom: 20px;
}
.eyebrow {
  color: var(--red);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
}
.header h1 {
  font-size: 24px; font-weight: 700; margin: 6px 0 2px;
}
.subtitle {
  color: var(--text-dim); font-size: 13px;
}

.error {
  color: var(--text-dim); padding: 24px; text-align: center;
}

.recap-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 16px;
}
.recap-left, .recap-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 600px) {
  .recap-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

/* ========== Sections ========== */
section h2 {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: #00e6c3;
  margin-bottom: 10px;
}

/* ========== Podium ========== */
.podium {
  display: flex; justify-content: center; gap: 12px; align-items: flex-end;
}
.podium-place {
  flex: 1; max-width: 100px;
  text-align: center;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 12px 8px;
  display: flex; flex-direction: column; gap: 4px;
}
.place-1 { order: 2; transform: scale(1.05); }
.place-2 { order: 1; }
.place-3 { order: 3; }
.podium-num {
  font-size: 24px; font-weight: 700;
}
.place-1 .podium-num { color: #ffd700; }
.place-2 .podium-num { color: #c0c0c0; }
.place-3 .podium-num { color: #cd7f32; }
.podium-name {
  font-size: 11px; font-weight: 600;
}
.podium-team {
  font-size: 9px; opacity: 0.7;
}
.podium-points {
  font-size: 10px; color: #ffd700; font-weight: 600; margin-top: 2px;
}

/* ========== Results ========== */
.results-list {
  display: flex; flex-direction: column; gap: 6px;
}
.result-row {
  display: grid; grid-template-columns: 28px 1fr 1fr 36px;
  gap: 10px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  align-items: center;
  font-size: 12px;
}
.result-pos {
  font-weight: 700; text-align: center;
}
.result-name { font-weight: 600; }
.result-team { color: var(--text-dim); font-size: 11px; }
.result-points { font-weight: 700; text-align: right; }

/* ========== Stints ========== */
.stints-list {
  display: flex; flex-direction: column; gap: 8px;
}
.stint-row {
  display: flex; align-items: center; gap: 10px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
}
.stint-driver {
  flex-shrink: 0;
  width: 90px;
  font-size: 12px; font-weight: 600;
}
.stint-tires {
  flex: 1;
  display: flex; gap: 2px;
  border: 1px solid; border-radius: 4px; padding: 2px 4px;
}
.tire {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  border-radius: 4px;
}
.stint-laps {
  flex-shrink: 0;
  width: 50px;
  text-align: right;
  font-size: 11px; color: var(--text-dim);
}

/* ========== Pit Stops ========== */
.pits-list {
  display: flex; flex-direction: column; gap: 6px;
}
.pit-row {
  display: grid; grid-template-columns: 90px 50px 40px 1fr;
  gap: 10px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  align-items: center;
  font-size: 12px;
}
.pit-driver { font-weight: 600; }
.pit-stop { color: var(--text-dim); font-size: 11px; }
.pit-lap { color: var(--text-dim); text-align: center; }
.pit-time { font-weight: 600; text-align: right; }

.foot {
  position: relative; z-index: 1;
  margin-top: 16px; text-align: center;
  font-size: 9.5px; color: var(--text-dim);
  letter-spacing: 0.12em; text-transform: uppercase;
}

@media (max-width: 360px) {
  .podium { gap: 6px; }
  .podium-place { padding: 8px 4px; }
  .result-row { grid-template-columns: 24px 1fr 48px; }
}
</style>
