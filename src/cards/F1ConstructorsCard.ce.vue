<script setup>
/**
 * F1 Constructors Card (v0.4.0) — Konstrukteurswertung
 * Design: wie Drivers, aber Teams mit größeren Fortschrittsbalken
 */
import { computed } from 'vue'
import { TEAM_COLORS } from '../data/teams.js'

const props = defineProps({
  hass: { type: Object, default: null },
  config: { type: Object, default: () => ({}) },
})

const entity = computed(() =>
  props.config?.entity || 'sensor.f1_dashboard_konstrukteurswertung')

const state = computed(() =>
  props.hass?.states?.[entity.value] ?? null)

const teams = computed(() => {
  const attrs = state.value?.attributes ?? {}
  const raw = attrs.standings || []
  
  return raw
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .map((t, i) => ({
      pos: i + 1,
      name: t.name || '–',
      teamId: t.constructorId || '',
      points: t.points || 0,
      wins: t.wins || 0,
      diff: i === 0 ? 0 : (raw[0]?.points || 0) - (t.points || 0),
    }))
})

const maxPoints = computed(() => teams.value[0]?.points || 1)

function teamColor(teamId) {
  return TEAM_COLORS[teamId] || '#7a7a80'
}
</script>

<template>
  <div class="card carbon teams">
    <!-- Header -->
    <header class="header">
      <div>
        <span class="eyebrow">Saison 2026</span>
        <h1>Konstrukteurswertung</h1>
        <p class="subtitle">Team-Meisterschaft</p>
      </div>
    </header>

    <!-- Error -->
    <div v-if="!state" class="error">
      Sensor {{ entity }} nicht gefunden
    </div>

    <!-- Rankings -->
    <div v-else class="rankings">
      <div v-for="team in teams" :key="team.pos" class="team-row">
        <!-- Position + Name -->
        <div class="team-info">
          <span class="position" :class="{ podium: team.pos <= 3 }">{{ team.pos }}</span>
          <span class="name">{{ team.name }}</span>
        </div>

        <!-- Großer Progress-Bar -->
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${(team.points / maxPoints) * 100}%`,
                backgroundColor: teamColor(team.teamId),
              }"
            ></div>
          </div>
        </div>

        <!-- Punkte + Differenz + Siege -->
        <div class="team-stats">
          <span class="points">{{ team.points }}</span>
          <span class="diff" v-if="team.diff > 0">-{{ team.diff }}</span>
          <span class="wins" v-if="team.wins > 0">🏆 {{ team.wins }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="foot">
      {{ teams.length }} Teams | Aktualisiert: {{ state?.last_updated?.slice(11, 16) || '–' }}
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
  letter-spacing: 0.04em; text-transform: uppercase;
}

.error {
  color: var(--text-dim); padding: 24px; text-align: center;
}

.rankings {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 10px;
}

.team-row {
  display: flex; align-items: center; gap: 12px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 12px;
}

.position {
  flex-shrink: 0;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--panel-border);
}
.position.podium {
  font-size: 17px;
}
.position.podium:nth-child(1) { background: rgba(255, 215, 0, 0.15); color: #ffd700; border-color: rgba(255, 215, 0, 0.3); }
.position.podium:nth-child(2) { background: rgba(192, 192, 192, 0.15); color: #c0c0c0; border-color: rgba(192, 192, 192, 0.3); }
.position.podium:nth-child(3) { background: rgba(205, 127, 50, 0.15); color: #cd7f32; border-color: rgba(205, 127, 50, 0.3); }

.team-info {
  flex-shrink: 0;
  display: flex; gap: 10px; align-items: center;
  width: 120px;
}
.name {
  font-size: 13px; font-weight: 600;
}

.progress-container {
  flex: 1;
}
.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 999px;
}

.team-stats {
  flex-shrink: 0;
  display: flex; gap: 8px; align-items: center;
  min-width: 80px;
  justify-content: flex-end;
}
.points {
  font-size: 15px; font-weight: 700;
  min-width: 32px; text-align: right;
}
.diff {
  font-size: 11px; color: var(--text-dim);
  min-width: 32px; text-align: right;
}
.wins {
  font-size: 10px; color: #ffd700;
  min-width: 36px; text-align: right;
}

.foot {
  position: relative; z-index: 1;
  margin-top: 16px; text-align: center;
  font-size: 9.5px; color: var(--text-dim);
  letter-spacing: 0.12em; text-transform: uppercase;
}

@media (max-width: 360px) {
  .team-info { width: 90px; }
}
</style>
