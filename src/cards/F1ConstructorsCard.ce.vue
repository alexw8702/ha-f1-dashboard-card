<script setup>
/**
 * F1 Constructors Card (v0.4.4) — Konstrukteurswertung
 * Design: Carbon-Dark, Centered Overlay Modal, Wiki integration, Team driver lineups
 */
import { computed, ref, watch } from 'vue'
import { TEAM_COLORS } from '../data/teams.js'

const props = defineProps({
  hass: { type: Object, default: null },
  config: { type: Object, default: () => ({}) },
})

const entity = computed(() =>
  props.config?.entity || 'sensor.f1_dashboard_konstrukteurswertung')

const state = computed(() =>
  props.hass?.states?.[entity.value] ?? null)

const season = computed(() => {
  return state.value?.attributes?.season || state.value?.attributes?.year || 'current'
})

const selectedTeam = ref(null)
const teamLogo = ref('')
const p2Count = ref(0)
const p3Count = ref(0)
const teamDrivers = ref([])
const wikiSummary = ref('')
const dnfCount = ref(0)
const lastRaces = ref([])

watch(selectedTeam, async (newVal) => {
  teamLogo.value = ''
  p2Count.value = 0
  p3Count.value = 0
  teamDrivers.value = []
  wikiSummary.value = ''
  dnfCount.value = 0
  lastRaces.value = []
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
              teamLogo.value = data.thumbnail?.source || data.originalimage?.source || ''
              wikiSummary.value = data.extract || ''
            }
          })
          .catch(e => console.error('Fehler beim Abrufen des Wikipedia-Logos:', e))
      }
    } catch (e) {
      console.error('Ungültige Wikipedia-URL:', e)
    }
  }
  
  if (newVal.teamId) {
    try {
      const fetchSeason = season.value || 'current'
      const response = await fetch(`https://api.jolpi.ca/ergast/f1/${fetchSeason}/constructors/${newVal.teamId}/results.json`)
      if (response.ok) {
        const data = await response.json()
        const races = data.MRData?.RaceTable?.Races || []
        let p2 = 0
        let p3 = 0
        let dnfVal = 0
        const raceList = []
        const uniqueDrivers = {}
        
        for (const race of races) {
          const results = race.Results || []
          const positions = []
          for (const res of results) {
            if (res.Driver) {
              const dId = res.Driver.driverId
              if (!uniqueDrivers[dId]) {
                uniqueDrivers[dId] = {
                  id: dId,
                  name: `${res.Driver.givenName} ${res.Driver.familyName}`.trim(),
                  code: res.Driver.code || '',
                  pos: '–',
                  points: 0
                }
              }
            }
            if (res.position === "2") p2++
            else if (res.position === "3") p3++
            
            // DNF check
            const status = res.status || ''
            const posText = res.positionText || ''
            const retired = posText === 'R' || (status !== 'Finished' && !status.includes('Lap') && !status.includes('Laps'))
            if (retired) {
              dnfVal++
              positions.push('R')
            } else {
              positions.push(res.position || '–')
            }
          }
          
          raceList.push({
            round: parseInt(race.round || '0'),
            name: race.raceName || 'Rennen',
            positions: positions.sort((a, b) => {
              if (a === 'R') return 1
              if (b === 'R') return -1
              return a - b
            })
          })
        }
        
        // Sort and slice last 5 races
        raceList.sort((a, b) => a.round - b.round)
        const last5 = raceList.slice(-5).reverse()
        
        // Fahrer-WM-Positionen und Punkte aus dem Fahrerwertungs-Sensor laden
        const driverStandingsEntity = Object.keys(props.hass?.states || {}).find(
          key => key.includes('fahrerwertung') || key.includes('driver_standings')
        ) || 'sensor.f1_dashboard_fahrerwertung'
        
        const driverState = props.hass?.states?.[driverStandingsEntity]
        const standingsRaw = driverState?.attributes?.standings || []
        
        const driverList = Object.values(uniqueDrivers)
        for (const drv of driverList) {
          const idx = standingsRaw.findIndex(s => 
            s.name.toLowerCase() === drv.name.toLowerCase() ||
            (s.tla && drv.code && s.tla.toLowerCase() === drv.code.toLowerCase())
          )
          if (idx !== -1) {
            drv.pos = idx + 1
            drv.points = standingsRaw[idx].points
          }
        }
        
        // Nach Position sortieren
        driverList.sort((a, b) => {
          if (a.pos === '–') return 1
          if (b.pos === '–') return -1
          return a.pos - b.pos
        })
        
        p2Count.value = p2
        p3Count.value = p3
        teamDrivers.value = driverList
        dnfCount.value = dnfVal
        lastRaces.value = last5
      }
    } catch (e) {
      console.error('Fehler beim Abrufen der Team-Ergebnisse:', e)
    }
  }
})

function getPosClass(pos) {
  if (pos === 'R') return 'pos-dnf'
  const p = parseInt(pos)
  if (isNaN(p)) return 'pos-normal'
  if (p === 1) return 'pos-1'
  if (p === 2) return 'pos-2'
  if (p === 3) return 'pos-3'
  if (p <= 10) return 'pos-points'
  return 'pos-normal'
}

const driverStandingsEntity = computed(() => {
  return Object.keys(props.hass?.states || {}).find(
    key => key.includes('fahrerwertung') || key.includes('driver_standings')
  ) || 'sensor.f1_dashboard_fahrerwertung'
})

const driverState = computed(() =>
  props.hass?.states?.[driverStandingsEntity.value] || null)

const driverStandings = computed(() => {
  return driverState.value?.attributes?.standings || []
})

const teams = computed(() => {
  const attrs = state.value?.attributes ?? {}
  const raw = attrs.standings || []
  const rawLegacy = attrs.ConstructorStandings || []
  
  return raw
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .map((t, i) => {
      const leg = rawLegacy.find(l => 
        (l.Constructor?.constructorId === t.constructorId) ||
        (l.Constructor?.name.toLowerCase() === t.name.toLowerCase())
      )
      
      const teamDriversList = driverStandings.value
        .map((s, idx) => ({ ...s, pos: idx + 1 }))
        .filter(s => 
          (s.teamId && t.constructorId && s.teamId === t.constructorId) || 
          (s.team && t.name && s.team.toLowerCase() === t.name.toLowerCase())
        )
      
      return {
        pos: i + 1,
        name: t.name || '–',
        teamId: t.constructorId || '',
        points: t.points || 0,
        wins: t.wins || 0,
        diff: i === 0 ? 0 : (raw[0]?.points || 0) - (t.points || 0),
        nationality: leg?.Constructor?.nationality || '',
        url: leg?.Constructor?.url || '',
        drivers: teamDriversList,
      }
    })
})

const maxPoints = computed(() => teams.value[0]?.points || 1)

function teamColor(teamId) {
  return TEAM_COLORS[teamId] || '#7a7a80'
}

function selectTeam(team) {
  selectedTeam.value = team
}

function closeDetail() {
  selectedTeam.value = null
}

function countryEmoji(nationality) {
  const map = {
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'British': '🇬🇧',
    'Austrian': '🇦🇹',
    'French': '🇫🇷',
    'American': '🇺🇸',
    'Swiss': '🇨🇭',
    'Japanese': '🇯🇵',
  }
  return map[nationality] || '🏳️'
}
</script>

<template>
  <div class="card carbon teams">
    <!-- Header -->
    <header class="header">
      <div>
        <span class="eyebrow">Saison {{ season === 'current' ? '2026' : season }}</span>
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
      <div v-for="team in teams" :key="team.pos" class="team-row" @click="selectTeam(team)">
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
          <div class="points-row">
            <span class="points">{{ team.points }}</span>
            <span class="pts-unit">PTS</span>
          </div>
          <div class="stats-sub">
            <span class="diff" v-if="team.diff > 0">-{{ team.diff }}</span>
            <span class="diff-placeholder" v-else></span>
            <span class="wins" v-if="team.wins > 0">🏆 {{ team.wins }}</span>
            <span class="wins-placeholder" v-else></span>
          </div>
        </div>

        <!-- Team-Drivers Column (Sichtbar auf größeren Bildschirmen) -->
        <div class="team-drivers-col" v-if="team.drivers && team.drivers.length">
          <div v-for="d in team.drivers" :key="d.name" class="team-driver-item">
            <span class="td-pos" :style="{ backgroundColor: teamColor(team.teamId) }">{{ d.pos }}</span>
            <span class="td-name-col">
              <span class="td-name">{{ d.name.split(' ').pop() }}</span>
              <span class="td-tla" v-if="d.tla"> {{ d.tla }}</span>
            </span>
            <span class="td-pts">{{ d.points }} <span class="td-pts-lbl">P</span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="foot">
      {{ teams.length }} Teams | Aktualisiert: {{ state?.last_updated?.slice(11, 16) || '–' }}
    </footer>

    <!-- Overlay/Detail-Card -->
    <div class="overlay" :class="{ open: selectedTeam }" @click="closeDetail">
      <div class="overlay-content" @click.stop v-if="selectedTeam">
        <div class="detail-card" :style="{ borderTop: `3px solid ${teamColor(selectedTeam.teamId)}` }">
          <button class="overlay-close" @click="closeDetail" aria-label="Schließen">&times;</button>
          
          <!-- Haupt-Details (Linke Spalte auf Desktop) -->
          <div class="detail-main-col">
            <div class="detail-head">
              <div class="detail-accent" :style="{ backgroundColor: teamColor(selectedTeam.teamId) }"></div>
              <div class="detail-head-text">
                <div class="detail-name">{{ selectedTeam.name }}</div>
                <div class="detail-team-sub" :style="{ color: teamColor(selectedTeam.teamId) }">
                  {{ selectedTeam.nationality }} {{ countryEmoji(selectedTeam.nationality) }}
                </div>
              </div>
              <div class="detail-avatar" v-if="teamLogo">
                <img :src="teamLogo" :alt="selectedTeam.name" />
              </div>
            </div>

            <!-- Compact Stats Grid -->
            <div class="detail-stats-grid">
              <div class="stat-box">
                <div class="stat-val">{{ selectedTeam.pos }}.</div>
                <div class="stat-lbl">WM-Rang</div>
              </div>
              <div class="stat-box">
                <div class="stat-val">{{ selectedTeam.points }}</div>
                <div class="stat-lbl">Punkte</div>
              </div>
              <div class="stat-box">
                <div class="stat-val podiums-row">
                  <span class="p-gold" title="Siege (P1)">
                    <svg class="trophy-icon" viewBox="0 0 24 24"><path d="M18 2H6v1a6 6 0 00-6 6v1c0 2.2 1.3 4.1 3.2 4.9.8 1.6 2.3 2.8 4.2 3.1V20H5v2h14v-2h-2.4v-2c1.9-.3 3.4-1.5 4.2-3.1 1.9-.8 3.2-2.7 3.2-4.9V9a6 6 0 00-6-6V2zM2 9a4 4 0 014-4v6a4 4 0 01-4-4zm16 2V5a4 4 0 014 4v2a4 4 0 01-4-4z"/></svg>
                    {{ selectedTeam.wins }}
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
            
            <p class="detail-extract" v-if="wikiSummary">{{ wikiSummary }}</p>
            
            <a v-if="selectedTeam.url" class="wiki-link" :href="selectedTeam.url" target="_blank" rel="noopener noreferrer">
              Wikipedia-Artikel &rarr;
            </a>
          </div>

          <!-- Sidebar (Rechte Spalte auf Desktop) -->
          <div class="detail-sidebar-col">
            <!-- Drivers Championship Section -->
            <div class="detail-drivers-section" v-if="teamDrivers.length">
              <div class="section-title">Fahrer</div>
              <div class="drivers-list">
                <div v-for="drv in teamDrivers" :key="drv.id" class="driver-item-row">
                  <span class="driver-badge-pos" :style="{ backgroundColor: teamColor(selectedTeam.teamId) }">
                    {{ drv.pos }}.
                  </span>
                  <span class="driver-item-name-col">
                    {{ drv.name }} <span class="driver-item-code-label">({{ drv.code }})</span>
                  </span>
                  <span class="driver-item-points-col">{{ drv.points }} <span class="pts-label">PKT</span></span>
                </div>
              </div>
            </div>

            <!-- Team History Section (Season 2026) -->
            <div class="team-history-section" v-if="lastRaces.length">
              <div class="section-title">Team-Historie (Saison {{ season === 'current' ? '2026' : season }})</div>
              <div class="history-grid">
                <div class="history-stat">
                  <span class="history-lbl">Saison-Ausfälle (DNFs):</span>
                  <span class="history-val dnf-count" :class="{ 'has-dnfs': dnfCount > 0 }">{{ dnfCount }}</span>
                </div>
                <div class="history-races">
                  <span class="history-lbl">Letzte 5 Rennen:</span>
                  <div class="history-races-list">
                    <div v-for="r in lastRaces" :key="r.round" class="history-race-row">
                      <span class="race-name">{{ r.name }}</span>
                      <div class="race-results-badges">
                        <span v-for="(pos, idx) in r.positions" :key="idx" class="mini-pos-badge" :class="getPosClass(pos)">
                          {{ pos === 'R' ? 'DNF' : 'P' + pos }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  position: relative;
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
  cursor: pointer;
  transition: background 0.18s ease;
}
.team-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

.team-drivers-col {
  display: none;
}

@container (min-width: 600px) {
  .team-row {
    display: grid;
    grid-template-columns: 120px 1fr 100px 160px;
    gap: 12px;
    align-items: center;
  }
  .team-drivers-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    padding-left: 12px;
  }
}


.team-driver-item {
  display: flex;
  align-items: center;
  font-size: 11px;
  gap: 6px;
  color: var(--text);
}
.td-pos {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.td-name-col {
  flex: 1;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.td-tla {
  color: var(--text-dim);
  font-size: 9px;
  font-weight: normal;
}
.td-pts {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
}
.td-pts-lbl {
  font-size: 8px;
  color: var(--text-dim);
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
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 90px;
  justify-self: end;
}
.points-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  line-height: 1.2;
}
.points {
  font-size: 16px; font-weight: 700;
}
.pts-unit {
  font-size: 10px; font-weight: 500; color: var(--text-dim);
}
.stats-sub {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: 100%;
  height: 16px;
  margin-top: 2px;
}
.diff, .diff-placeholder {
  width: 44px;
  text-align: right;
  flex-shrink: 0;
  display: inline-block;
}
.diff {
  font-size: 13px; font-weight: 600; color: var(--text-dim);
}
.wins, .wins-placeholder {
  width: 38px;
  text-align: right;
  flex-shrink: 0;
  display: inline-block;
}
.wins {
  color: #ffd700;
  font-size: 11px;
}

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
  padding: 5vh 16px;
  box-sizing: border-box;
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
  text-align: left;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
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
  background: #ffffff;
}
.detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

/* Drivers Section in Team Details */
.detail-drivers-section {
  margin-top: 14px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 4px;
}
.drivers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.driver-item-row {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
}
.driver-badge-pos {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  margin-right: 10px;
  flex-shrink: 0;
}
.driver-item-name-col {
  flex: 1;
  font-weight: 600;
}
.driver-item-code-label {
  color: var(--text-dim);
  font-size: 11px;
  font-weight: normal;
}
.driver-item-points-col {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.pts-label {
  font-size: 9px;
  color: var(--text-dim);
  margin-left: 1px;
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
  overflow-y: auto;
  max-height: 180px;
  flex-shrink: 1;
  min-height: 0;
}

@container (max-width: 360px) {
  .team-info { width: 90px; }
  .team-stats { width: 70px; }
  .team-stats .points { font-size: 14px; }
  .team-stats .pts-unit { font-size: 9px; }
  .team-stats .diff, .team-stats .diff-placeholder { width: 34px; font-size: 11.5px; }
  .team-stats .wins, .team-stats .wins-placeholder { width: 30px; font-size: 10px; }
}

/* Team History Section (Hidden on mobile) */
.team-history-section {
  display: none;
}
.history-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px 12px;
}
.history-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 6px;
}
.history-lbl {
  font-size: 11px;
  color: var(--text-dim);
}
.history-val {
  font-size: 12.5px;
  font-weight: 700;
}
.dnf-count.has-dnfs {
  color: #ff4a43;
}
.history-races {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.history-races-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.history-race-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.race-name {
  font-size: 11.5px;
  color: var(--text);
}
.race-results-badges {
  display: flex;
  gap: 4px;
}
.mini-pos-badge {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}
.pos-1 { background: #ffd700; color: #101017; }
.pos-2 { background: #c0c0c0; color: #101017; }
.pos-3 { background: #cd7f32; color: #101017; }
.pos-points { background: rgba(0, 230, 195, 0.15); color: #00e6c3; }
.pos-normal { background: rgba(255, 255, 255, 0.08); color: var(--text-dim); }
.pos-dnf { background: rgba(225, 6, 0, 0.15); color: #ff4a43; }

@media (min-width: 600px) {
  .overlay-content {
    max-width: 680px;
  }
  .detail-card {
    display: grid;
    grid-template-columns: 1fr 240px; /* Left column: 1fr, Right column: 240px */
    column-gap: 24px;
    align-items: start;
  }
  .detail-main-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .detail-sidebar-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .team-history-section {
    display: block;
    padding-top: 0;
  }
  .detail-head {
    margin-bottom: 0;
  }
  .detail-stats-grid {
    margin-bottom: 0;
  }
  .detail-extract {
    margin-top: 0;
    margin-bottom: 0;
  }
  .wiki-link {
    margin-top: 0;
  }
  .detail-drivers-section {
    margin-bottom: 0;
  }
}
</style>
