/**
 * Direkter Jolpica-Abruf (kein HA-Sensor nötig, analog zu useWeather.js):
 * erstes Grand-Prix-Jahr an der Strecke + Podium des Vorjahres-Rennens dort.
 * Jolpica setzt Access-Control-Allow-Origin:* (geprüft), Browser-Fetch ist also möglich.
 */
import { ref, watch, onUnmounted } from 'vue'

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1'
const REFRESH_MS = 60 * 60 * 1000 // Historie ändert sich höchstens einmal jährlich

export function useCircuitHistory(circuitIdRef) {
  const firstYear = ref(null)
  const lastYearPodium = ref([]) // [{ pos, familyName }]
  const lastYearSeason = ref(null)
  let timer = null

  async function fetchFirstYear(circuitId) {
    try {
      const res = await fetch(`${JOLPICA_BASE}/circuits/${circuitId}/races.json?limit=1`)
      if (!res.ok) return
      const json = await res.json()
      const race = json?.MRData?.RaceTable?.Races?.[0]
      firstYear.value = race?.season ?? null
    } catch (e) {
      /* Netzwerkfehler: alten Wert behalten */
    }
  }

  async function fetchLastYearPodium(circuitId) {
    const season = new Date().getFullYear() - 1
    try {
      const res = await fetch(`${JOLPICA_BASE}/${season}/circuits/${circuitId}/results.json?limit=3`)
      if (!res.ok) return
      const json = await res.json()
      const results = json?.MRData?.RaceTable?.Races?.[0]?.Results ?? []
      lastYearPodium.value = results.map(r => ({
        pos: r.position,
        familyName: r.Driver?.familyName ?? '?',
      }))
      lastYearSeason.value = results.length ? season : null
    } catch (e) {
      /* Netzwerkfehler: alten Wert behalten */
    }
  }

  watch(circuitIdRef, (id, old) => {
    if (!id || id === old) return
    firstYear.value = null
    lastYearPodium.value = []
    lastYearSeason.value = null
    fetchFirstYear(id)
    fetchLastYearPodium(id)
    clearInterval(timer)
    timer = setInterval(() => { fetchFirstYear(id); fetchLastYearPodium(id) }, REFRESH_MS)
  }, { immediate: true })

  onUnmounted(() => clearInterval(timer))

  return { firstYear, lastYearPodium, lastYearSeason }
}

/** Land (Jolpica-Namen der aktuellen 22 Strecken in circuits.js) → Flaggen-Emoji */
const COUNTRY_FLAGS = {
  Australia: '🇦🇺', Austria: '🇦🇹', Azerbaijan: '🇦🇿', Belgium: '🇧🇪',
  Brazil: '🇧🇷', Canada: '🇨🇦', China: '🇨🇳', Hungary: '🇭🇺',
  Italy: '🇮🇹', Japan: '🇯🇵', Mexico: '🇲🇽', Monaco: '🇲🇨',
  Netherlands: '🇳🇱', Qatar: '🇶🇦', Singapore: '🇸🇬', Spain: '🇪🇸',
  UAE: '🇦🇪', UK: '🇬🇧', USA: '🇺🇸',
}

export function countryFlag(country) {
  return COUNTRY_FLAGS[country] ?? ''
}
