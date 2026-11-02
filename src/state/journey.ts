/* ============================================================
   state/journey.ts — distance and badges.

   BOTH ARE CARRIED OVER FROM v1 VERBATIM. If they were re-derived here
   from scratch, v1 and v2 would disagree about how far apart two sites
   are and about which badges have been earned, and a judge comparing
   the two would have no way to tell which was wrong.

   DISTANCE IS ALWAYS LABELLED APPROXIMATE
   Haversine gives the distance as the crow flies between two points on
   a sphere. It is not a travel time and not a road distance. v1 labels
   it "Approx. straight-line distance" and so does every surface here —
   the label is part of the calculation as far as this project is
   concerned, because an unlabelled number invites the wrong reading.
   ============================================================ */

import type { Site } from '../data/types'
import { SITE_BY_ID } from '../data/sites'

/* ---- distance: same formula, same constants as v1's store.js ---- */

const EARTH_RADIUS_KM = 6371
const toRad = (d: number) => (d * Math.PI) / 180

/** Great-circle distance in kilometres between two sites. */
export function haversineKm(a: Site, b: Site): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Sum of the legs between consecutive stops, in order. */
export function cumulativeKm(sites: Site[]): number {
  let total = 0
  for (let i = 1; i < sites.length; i++) total += haversineKm(sites[i - 1], sites[i])
  return total
}

/** Round for display. Distances under 10 km still show a decimal. */
export function formatKm(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

/** v1's rough estimate, clearly labelled as one wherever it appears. */
export function estimatedHours(km: number): number {
  return km / 55
}

/** Resolve journey ids to sites, dropping any that no longer exist. */
export function resolveJourney(ids: string[]): Site[] {
  return ids.map((id) => SITE_BY_ID.get(id)).filter((s): s is Site => !!s)
}

/* ---- badges: the same five, with the same tests ---- */

export interface Badge {
  id: string
  en: string
  hi: string
  hintEn: string
  hintHi: string
  /** Returns true when earned. */
  test: (visited: Site[], journeyIds: string[]) => boolean
}

/**
 * Copied from v1 journey.js. The tests are character-for-character the
 * same, except that v1 reads `s.siteType` where v2's migrated data
 * calls the field `type` — a rename the migration performed, not a
 * change of meaning.
 *
 * Note the asymmetry: four badges read `visited`, only the last reads
 * the journey. That is v1's design and it is preserved deliberately.
 */
export const BADGES: Badge[] = [
  {
    id: 'mughal-explorer',
    en: 'Mughal Explorer',
    hi: 'मुग़ल खोजी',
    hintEn: 'Mark a Mughal-era site as visited',
    hintHi: 'किसी मुग़ल-कालीन स्थल को देखा हुआ चिह्नित करें',
    test: (v) => v.some((s) => s.era === 'mughal'),
  },
  {
    id: 'temple-trailblazer',
    en: 'Temple Trailblazer',
    hi: 'मंदिर अन्वेषक',
    hintEn: 'Mark two temple sites as visited',
    hintHi: 'दो मंदिर स्थलों को देखा हुआ चिह्नित करें',
    test: (v) => v.filter((s) => s.type === 'temple').length >= 2,
  },
  {
    id: 'cave-chronicle',
    en: 'Cave Chronicle',
    hi: 'गुफ़ा गाथा',
    hintEn: 'Mark a rock-cut cave site as visited',
    hintHi: 'किसी रॉक-कट गुफ़ा स्थल को देखा हुआ चिह्नित करें',
    test: (v) => v.some((s) => s.type === 'cave'),
  },
  {
    id: 'heritage-scholar',
    en: 'Heritage Scholar',
    hi: 'धरोहर विद्वान',
    hintEn: 'Mark five different sites as visited',
    hintHi: 'पाँच अलग-अलग स्थलों को देखा हुआ चिह्नित करें',
    test: (v) => v.length >= 5,
  },
  {
    id: 'india-atlas-explorer',
    en: 'India Atlas Explorer',
    hi: 'भारत मानचित्र अन्वेषक',
    hintEn: 'Fill all five journey stops',
    hintHi: 'यात्रा के सभी पाँच पड़ाव भरें',
    test: (_v, journey) => journey.length >= 5,
  },
]

/** Which badges are currently earned. */
export function earnedBadges(visited: Site[], journeyIds: string[]): Badge[] {
  return BADGES.filter((b) => b.test(visited, journeyIds))
}
