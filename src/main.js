/**
 * F1 Dashboard Cards — Vue 3 (v0.4.0)
 * Alle 4 Karten: Session, Drivers, Constructors, Race Recap
 */
import { defineCustomElement } from 'vue'
import F1SessionCard from './cards/F1SessionCard.ce.vue'
import F1DriversCard from './cards/F1DriversCard.ce.vue'
import F1ConstructorsCard from './cards/F1ConstructorsCard.ce.vue'
import F1RaceRecapCard from './cards/F1RaceRecapCard.ce.vue'

const VERSION = '0.6.1'

function defineLovelaceCard(tag, vueComponent, cardSize = 5) {
  const Base = defineCustomElement(vueComponent)

  class LovelaceCard extends Base {
    setConfig(config) {
      this.config = config
    }
    getCardSize() {
      return cardSize
    }
  }

  if (!customElements.get(tag)) {
    customElements.define(tag, LovelaceCard)
  }
}

// Alle 4 Karten registrieren
defineLovelaceCard('f1-session-card', F1SessionCard, 8)
defineLovelaceCard('f1-drivers-card', F1DriversCard, 12)
defineLovelaceCard('f1-constructors-card', F1ConstructorsCard, 12)
defineLovelaceCard('f1-race-recap-card', F1RaceRecapCard, 14)

// Card-Picker
window.customCards = window.customCards || []
window.customCards.push(
  {
    type: 'f1-session-card',
    name: 'F1 Session Card',
    description: 'Rennwochenende: Zeitplan, Streckenfakten, Wetter & Live-Daten',
  },
  {
    type: 'f1-drivers-card',
    name: 'F1 Drivers Card',
    description: 'Fahrerwertung: Ranking, Punkte, Siege',
  },
  {
    type: 'f1-constructors-card',
    name: 'F1 Constructors Card',
    description: 'Konstrukteurswertung: Team-Ranking, Punkte',
  },
  {
    type: 'f1-race-recap-card',
    name: 'F1 Race Recap Card',
    description: 'Letztes Rennen: Podium, Ergebnisse, Strategie',
  }
)

console.info(
  `%c F1-DASHBOARD-CARDS %c v${VERSION} (Vue 3) `,
  'background:#e10600;color:#fff;font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px',
  'background:#15151e;color:#00e6c3;border-radius:0 4px 4px 0;padding:2px 6px',
  '\n🏎️ 4 Karten geladen: Session | Drivers | Constructors | Recap'
)
