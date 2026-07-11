/**
 * Direkter Open-Meteo-Abruf (kein HA-Sensor nötig).
 * Wird durch Wechsel der Circuit-Koordinaten getriggert und
 * alle 30 Minuten aktualisiert (nur solange die Karte sichtbar ist).
 */
import { ref, watch, onUnmounted } from 'vue'

const REFRESH_MS = 30 * 60 * 1000

export function useWeather(coordsRef) {
  const daily = ref(null)   // { time[], tMax[], tMin[], rain[], code[] }
  const updatedAt = ref(null)
  let timer = null

  async function fetchWeather() {
    const c = coordsRef.value
    if (!c || !c.lat || !c.lon) return
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${c.lat}&longitude=${c.lon}` +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,wind_speed_10m_max' +
      '&timezone=auto&forecast_days=16'
    try {
      const res = await fetch(url)
      if (!res.ok) return
      const json = await res.json()
      daily.value = {
        time: json.daily.time,
        tMax: json.daily.temperature_2m_max,
        tMin: json.daily.temperature_2m_min,
        rain: json.daily.precipitation_probability_max,
        code: json.daily.weather_code,
        wind: json.daily.wind_speed_10m_max,
      }
      updatedAt.value = new Date()
    } catch (e) {
      /* Netzwerkfehler: alte Daten behalten */
    }
  }

  watch(coordsRef, (c, old) => {
    if (!c) return
    if (!old || c.lat !== old.lat || c.lon !== old.lon) {
      fetchWeather()
      clearInterval(timer)
      timer = setInterval(fetchWeather, REFRESH_MS)
    }
  }, { immediate: true })

  onUnmounted(() => clearInterval(timer))

  return { daily, updatedAt }
}

/** WMO weather_code → Emoji-Icon */
export function weatherIcon(code) {
  if (code == null) return '–'
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 49) return '🌫️'
  if (code <= 59) return '🌦️'
  if (code <= 69) return '🌧️'
  if (code <= 79) return '🌨️'
  if (code <= 84) return '🌧️'
  return '⛈️'
}
