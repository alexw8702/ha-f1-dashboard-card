<script setup>
/**
 * F1 Drivers Card (v0.4.0) — Fahrerwertung
 * Design: Carbon-Dark, Ranking-Liste mit Teamfarben, Fortschrittsbalken, Punkte-Differenzen
 */
import { computed } from 'vue'
import { TEAM_COLORS } from '../data/teams.js'

const props = defineProps({
  hass: { type: Object, default: null },
  config: { type: Object, default: () => ({}) },
})

const entity = computed(() =>
  props.config?.entity || 'sensor.f1_dashboard_fahrerwertung')

const state = computed(() =>
  props.hass?.states?.[entity.value] ?? null)

const drivers = computed(() => {
  const attrs = state.value?.attributes ?? {}
  const raw = attrs.standings || []
  
  // Sortieren nach Punkten (absteigend), Länderflags zuweisen
  return raw
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .map((d, i) => ({
      pos: i + 1,
      name: d.name || '–',
      team: d.team || '–',
      teamId: d.teamId || d.constructor_id || '',
      tla: d.tla || d.abbreviation || '',
      points: d.points || 0,
      wins: d.wins || 0,
      diff: i === 0 ? 0 : (raw[0]?.points || 0) - (d.points || 0),
      nationality: d.nationality || '',
    }))
})

const maxPoints = computed(() => drivers.value[0]?.points || 1)

function teamColor(teamId) {
  return TEAM_COLORS[teamId] || '#7a7a80'
}

function countryEmoji(nationality) {
  if (!nationality) return ''
  const map = {
    'Dutch': '🇳🇱', 'British': '🇬🇧', 'German': '🇩🇪', 'Spanish': '🇪🇸',
    'French': '🇫🇷', 'Italian': '🇮🇹', 'American': '🇺🇸', 'Mexican': '🇲🇽',
    'Australian': '🇦🇺', 'Japanese': '🇯🇵', 'Finnish': '🇫🇮', 'Monegasque': '🇲🇨',
    'Thai': '🇹🇭', 'Canadian': '🇨🇦', 'Danish': '🇩🇰', 'Indian': '🇮🇳',
    'Lebanese': '🇱🇧', 'Chinese': '🇨🇳', 'Brazilian': '🇧🇷', 'Argentine': '🇦🇷',
    'New Zealander': '🇳🇿', 'South African': '🇿🇦', 'Swedish': '🇸🇪', 'Swiss': '🇨🇭',
    'Belgian': '🇧🇪', 'Norwegian': '🇳🇴', 'Polish': '🇵🇱', 'Turkish': '🇹🇷',
  }
  return map[nationality] || ''
}
</script>

<template>
  <div class="card carbon drivers">
    <!-- Header -->
    <header class="header">
      <div>
        <span class="eyebrow">Saison 2026</span>
        <h1>Fahrerwertung</h1>
        <p class="subtitle">Weltmeisterschaft</p>
      </div>
    </header>

    <!-- Error-State -->
    <div v-if="!state" class="error">
      Sensor {{ entity }} nicht gefunden
    </div>

    <!-- Rankings -->
    <div v-else class="rankings">
      <div v-for="driver in drivers" :key="driver.pos" class="driver-row">
        <!-- Position + Name -->
        <div class="driver-info">
          <span class="position" :class="{ podium: driver.pos <= 3 }">{{ driver.pos }}</span>
          <div class="driver-text">
            <span class="name">{{ driver.name }}</span>
            <span class="team" :style="{ color: teamColor(driver.teamId) }">
              {{ countryEmoji(driver.nationality) }} {{ driver.team }}
            </span>
          </div>
        </div>

        <!-- Progress-Bar (Punkte) -->
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${(driver.points / maxPoints) * 100}%`,
                backgroundColor: teamColor(driver.teamId),
              }"
            ></div>
          </div>
        </div>

        <!-- Punkte + Differenz -->
        <div class="driver-stats">
          <span class="points">{{ driver.points }}</span>
          <span class="diff" v-if="driver.diff > 0">-{{ driver.diff }}</span>
          <span class="wins" v-if="driver.wins > 0">🏆 {{ driver.wins }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="foot">
      {{ drivers.length }} Fahrer | Aktualisiert: {{ state?.last_updated?.slice(11, 16) || '–' }}
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
  --teal: #00e6c3;
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

/* ---------- Header ---------- */
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
  letter-spacing: 0.04em; text-transform: uppercase;
}

.error {
  color: var(--text-dim); padding: 24px; text-align: center;
}

/* ---------- Rankings ---------- */
.rankings {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 8px;
}

.driver-row {
  display: flex; align-items: center; gap: 12px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 10px 12px;
}

/* Position */
.position {
  flex-shrink: 0;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--panel-border);
}
.position.podium {
  font-size: 16px;
}
.position.podium:nth-child(1) { background: rgba(255, 215, 0, 0.15); color: #ffd700; border-color: rgba(255, 215, 0, 0.3); }
.position.podium:nth-child(2) { background: rgba(192, 192, 192, 0.15); color: #c0c0c0; border-color: rgba(192, 192, 192, 0.3); }
.position.podium:nth-child(3) { background: rgba(205, 127, 50, 0.15); color: #cd7f32; border-color: rgba(205, 127, 50, 0.3); }

/* Driver Info */
.driver-info {
  flex-shrink: 0;
  display: flex; gap: 8px; align-items: center;
  width: 140px;
}
.driver-text {
  display: flex; flex-direction: column; gap: 1px;
}
.name {
  font-size: 13px; font-weight: 600;
}
.team {
  font-size: 10.5px; opacity: 0.75;
  letter-spacing: 0.02em;
}

/* Progress Bar */
.progress-container {
  flex: 1;
}
.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 999px;
}

/* Stats */
.driver-stats {
  flex-shrink: 0;
  display: flex; gap: 6px; align-items: center;
  min-width: 80px;
  justify-content: flex-end;
}
.points {
  font-size: 14px; font-weight: 700;
  min-width: 30px; text-align: right;
}
.diff {
  font-size: 11px; color: var(--text-dim);
  min-width: 32px; text-align: right;
}
.wins {
  font-size: 10px; color: #ffd700;
  min-width: 36px; text-align: right;
}

/* ---------- Footer ---------- */
.foot {
  position: relative; z-index: 1;
  margin-top: 16px; text-align: center;
  font-size: 9.5px; color: var(--text-dim);
  letter-spacing: 0.12em; text-transform: uppercase;
}

@media (max-width: 360px) {
  .driver-info { width: 100px; }
  .name { font-size: 12px; }
  .driver-stats { min-width: 60px; }
}
</style>
