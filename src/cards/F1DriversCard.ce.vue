<script setup>
/**
 * F1 Drivers Card (v0.4.0) — Fahrerwertung
 * Design: Carbon-Dark, Ranking-Liste mit Teamfarben, Fortschrittsbalken, Punkte-Differenzen
 */
import { computed, ref, watch } from 'vue'
import { TEAM_COLORS } from '../data/teams.js'

const props = defineProps({
  hass: { type: Object, default: null },
  config: { type: Object, default: () => ({}) },
})

const entity = computed(() =>
  props.config?.entity || 'sensor.f1_dashboard_fahrerwertung')

const state = computed(() =>
  props.hass?.states?.[entity.value] ?? null)

const selectedDriver = ref(null)
const driverImage = ref('')
const p2Count = ref(0)
const p3Count = ref(0)
const wikiSummary = ref('')

watch(selectedDriver, async (newVal) => {
  driverImage.value = ''
  p2Count.value = 0
  p3Count.value = 0
  wikiSummary.value = ''
  if (!newVal) return
  
  if (newVal.url) {
    try {
      const urlObj = new URL(newVal.url)
      const hostParts = urlObj.hostname.split('.')
      const lang = hostParts[0] || 'de'
      const pathParts = urlObj.pathname.split('/')
      const title = pathParts[pathParts.length - 1]
      
      if (title) {
        fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              driverImage.value = data.thumbnail?.source || data.originalimage?.source || ''
              wikiSummary.value = data.extract || ''
            }
          })
          .catch(e => console.error('Fehler beim Abrufen des Wikipedia-Bildes:', e))
      }
    } catch (e) {
      console.error('Ungültige Wikipedia-URL:', e)
    }
  }
  
  if (newVal.driverId) {
    try {
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/current/drivers/${newVal.driverId}/results.json`)
      if (response.ok) {
        const data = await response.json()
        const races = data.MRData?.RaceTable?.Races || []
        let p2 = 0
        let p3 = 0
        for (const race of races) {
          const res = race.Results?.[0]
          if (res) {
            if (res.position === "2") p2++
            else if (res.position === "3") p3++
          }
        }
        p2Count.value = p2
        p3Count.value = p3
      }
    } catch (e) {
      console.error('Fehler beim Abrufen der Fahrer-Ergebnisse:', e)
    }
  }
})

const drivers = computed(() => {
  const attrs = state.value?.attributes ?? {}
  const raw = attrs.standings || []
  const rawLegacy = attrs.DriverStandings || []
  
  // Sortieren nach Punkten (absteigend), Länderflags zuweisen
  return raw
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .map((d, i) => {
      const leg = rawLegacy.find(l => 
        (l.Driver?.givenName && l.Driver?.familyName && 
         `${l.Driver.givenName} ${l.Driver.familyName}`.trim().toLowerCase() === d.name.toLowerCase()) ||
        (l.Driver?.code && d.tla && l.Driver.code.toLowerCase() === d.tla.toLowerCase())
      )
      
      return {
        pos: i + 1,
        name: d.name || '–',
        team: d.team || '–',
        teamId: d.teamId || d.constructor_id || '',
        tla: d.tla || d.abbreviation || '',
        points: d.points || 0,
        wins: d.wins || 0,
        diff: i === 0 ? 0 : (raw[0]?.points || 0) - (d.points || 0),
        nationality: d.nationality || '',
        permanentNumber: leg?.Driver?.permanentNumber || d.permanentNumber || '',
        dateOfBirth: leg?.Driver?.dateOfBirth || d.dateOfBirth || '',
        url: leg?.Driver?.url || d.url || '',
        driverId: leg?.Driver?.driverId || '',
      }
    })
})

const rowCount = computed(() => Math.ceil(drivers.value.length / 2))

function selectDriver(driver) {
  selectedDriver.value = driver
}

function closeDetail() {
  selectedDriver.value = null
}

function formatDate(dobStr) {
  const d = new Date(dobStr)
  if (isNaN(d.getTime())) return dobStr
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function calcAge(dobStr) {
  const dob = new Date(dobStr)
  if (isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
  return age
}

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
    <div v-else class="rankings" :style="{ '--row-count': rowCount }">
      <div v-for="driver in drivers" :key="driver.pos" class="driver-row" @click="selectDriver(driver)">
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

    <!-- Overlay/Detail-Card -->
    <div class="overlay" :class="{ open: selectedDriver }" @click="closeDetail">
      <div class="overlay-content" @click.stop v-if="selectedDriver">
        <div class="detail-card" :style="{ borderTop: `3px solid ${teamColor(selectedDriver.teamId)}` }">
          <button class="overlay-close" @click="closeDetail" aria-label="Schließen">&times;</button>
          
          <div class="detail-head">
            <div class="detail-accent" :style="{ backgroundColor: teamColor(selectedDriver.teamId) }"></div>
            <div class="detail-head-text">
              <div class="detail-name">{{ selectedDriver.name }}</div>
              <div class="detail-team-sub" :style="{ color: teamColor(selectedDriver.teamId) }">
                {{ selectedDriver.team }}
              </div>
            </div>
            <div class="detail-avatar" v-if="driverImage">
              <img :src="driverImage" :alt="selectedDriver.name" />
            </div>
          </div>
          
          <!-- Compact Stats Grid -->
          <div class="detail-stats-grid">
            <div class="stat-box">
              <div class="stat-val">{{ selectedDriver.pos }}.</div>
              <div class="stat-lbl">WM-Rang</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ selectedDriver.points }}</div>
              <div class="stat-lbl">Punkte</div>
            </div>
            <div class="stat-box">
              <div class="stat-val podiums-row">
                <span class="p-gold" title="Siege (P1)">
                  <svg class="trophy-icon" viewBox="0 0 24 24"><path d="M18 2H6v1a6 6 0 00-6 6v1c0 2.2 1.3 4.1 3.2 4.9.8 1.6 2.3 2.8 4.2 3.1V20H5v2h14v-2h-2.4v-2c1.9-.3 3.4-1.5 4.2-3.1 1.9-.8 3.2-2.7 3.2-4.9V9a6 6 0 00-6-6V2zM2 9a4 4 0 014-4v6a4 4 0 01-4-4zm16 2V5a4 4 0 014 4v2a4 4 0 01-4-4z"/></svg>
                  {{ selectedDriver.wins }}
                </span>
                <span class="p-silver" title="2. Plätze (P2)">
                  <svg class="trophy-icon" viewBox="0 0 24 24"><path d="M18 2H6v1a6 6 0 00-6 6v1c0 2.2 1.3 4.1 3.2 4.9.8 1.6 2.3 2.8 4.2 3.1V20H5v2h14v-2h-2.4v-2c1.9-.3 3.4-1.5 4.2-3.1 1.9-.8 3.2-2.7 3.2-4.9V9a6 6 0 00-6-6V2zM2 9a4 4 0 014-4v6a4 4 0 01-4-4zm16 2V5a4 4 0 014 4v2a4 4 0 01-4-4z"/></svg>
                  {{ p2Count }}
                </span>
                <span class="p-bronze" title="3. Plätze (P3)">
                  <svg class="trophy-icon" viewBox="0 0 24 24"><path d="M18 2H6v1a6 6 0 00-6 6v1c0 2.2 1.3 4.1 3.2 4.9.8 1.6 2.3 2.8 4.2 3.1V20H5v2h14v-2h-2.4v-2c1.9-.3 3.4-1.5 4.2-3.1 1.9-.8 3.2-2.7 3.2-4.9V9a6 6 0 00-6-6V2zM2 9a4 4 0 014-4v6a4 4 0 01-4-4zm16 2V5a4 4 0 014 4v2a4 4 0 01-4-4z"/></svg>
                  {{ p3Count }}
                </span>
              </div>
              <div class="stat-lbl">Podestplätze</div>
            </div>
          </div>

          <div class="detail-rows">
            <div class="drow" v-if="selectedDriver.permanentNumber">
              <span class="dk">Startnummer</span>
              <span class="dv">#{{ selectedDriver.permanentNumber }}</span>
            </div>
            <div class="drow" v-if="selectedDriver.nationality">
              <span class="dk">Nationalität</span>
              <span class="dv">{{ selectedDriver.nationality }} {{ countryEmoji(selectedDriver.nationality) }}</span>
            </div>
            <div class="drow" v-if="selectedDriver.dateOfBirth">
              <span class="dk">Geburtsdatum</span>
              <span class="dv">{{ formatDate(selectedDriver.dateOfBirth) }} ({{ calcAge(selectedDriver.dateOfBirth) }} Jahre)</span>
            </div>
            <div class="drow" v-if="selectedDriver.team">
              <span class="dk">Team</span>
              <span class="dv" :style="{ color: teamColor(selectedDriver.teamId) }">{{ selectedDriver.team }}</span>
            </div>
          </div>
          
          <p class="detail-extract" v-if="wikiSummary">{{ wikiSummary }}</p>
          
          <a v-if="selectedDriver.url" class="wiki-link" :href="selectedDriver.url" target="_blank" rel="noopener noreferrer">
            Wikipedia-Artikel &rarr;
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:host { display: block; container-type: inline-size; }
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
@container (min-width: 600px) {
  .rankings {
    display: grid;
    grid-template-rows: repeat(var(--row-count, 11), auto);
    grid-auto-flow: column;
    column-gap: 16px;
    row-gap: 8px;
  }
}

.driver-row {
  display: flex; align-items: center; gap: 12px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.18s ease;
}
.driver-row:hover {
  background: rgba(255, 255, 255, 0.06);
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

/* ---------- Overlay / Detail Card ---------- */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 8, 11, 0);
  pointer-events: none;
  transition: background 0.22s ease;
  padding: 16px;
}
.overlay.open {
  background: rgba(8, 8, 11, 0.75);
  pointer-events: auto;
}
.overlay-content {
  width: 100%;
  max-width: 340px;
  transform: scale(0.9);
  opacity: 0;
  transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.24s ease;
}
.overlay.open .overlay-content {
  transform: scale(1);
  opacity: 1;
}
.detail-card {
  background: linear-gradient(160deg, #1c1c25 0%, #232330 100%);
  border-radius: 16px;
  border: 1px solid var(--panel-border);
  padding: 20px 18px 22px;
  position: relative;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

/* Compact Stats Grid */
.detail-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
}
.stat-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}
.stat-box:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
.stat-val {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 24px;
}
.stat-lbl {
  font-size: 9.5px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.podiums-row {
  display: flex;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}
.podiums-row span {
  display: flex;
  align-items: center;
  gap: 3px;
}
.trophy-icon {
  width: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
}
.p-gold { color: #FFD700; fill: #FFD700; }
.p-silver { color: #E6E8EC; fill: #E6E8EC; }
.p-bronze { color: #EE9A49; fill: #EE9A49; }
.overlay-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #c9cdd4;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.overlay-close:hover {
  background: rgba(255, 255, 255, 0.15);
}
.detail-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding-right: 36px;
}
.detail-head-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-accent {
  width: 5px;
  height: 52px;
  border-radius: 4px;
  flex: none;
}
.detail-name {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}
.detail-team-sub {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 0.02em;
}
.detail-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--panel-border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}
.detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 14px;
}
.drow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
}
.drow:last-child {
  border-bottom: none;
}
.dk {
  color: var(--text-dim);
}
.dv {
  color: var(--text);
  font-weight: 600;
}
.wiki-link {
  display: block;
  text-align: center;
  margin-top: 4px;
  padding: 11px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #7ab0ff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s ease;
}
.wiki-link:hover {
  background: rgba(122, 176, 255, 0.14);
}

.detail-extract {
  font-size: 11.5px;
  color: var(--text-dim);
  line-height: 1.5;
  margin-top: 10px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 10px 12px;
  text-align: left;
}

@container (max-width: 360px) {
  .driver-info { width: 100px; }
  .name { font-size: 12px; }
  .driver-stats { min-width: 60px; }
}
</style>
