/* ============================================================
   data/timeline.ts — ordering the archive through time.

   WHY THIS FILE EXISTS AT ALL

   The site record has an `era` field and no date field. That is not
   an oversight on our part — it is what the source data contains,
   and inventing years to make a timeline look precise would be the
   exact failure this project has spent its whole build avoiding.

   So the timeline makes ONE ordering claim: ancient, then medieval,
   then mughal, then colonial. That ordering is true, it covers all
   25 sites, and it needs nothing the data does not have.

   Years appear on individual cards, and only where a construction
   date genuinely exists in the record.

   ------------------------------------------------------------
   THE TRAP THIS FILE EXISTS TO AVOID

   22 of the 25 sites contain something that looks like a year. Only
   12 of those years describe when the structure was built. The rest
   are:

       "UNESCO listed: 1983"        — a stupa from the 3rd c. BCE
       "Rediscovered: 1819"          — Ajanta, cut in the 2nd c. BCE
       "Excavated: 1963"             — Rani ki Vav, begun c. 1063
       "Documented by: ... 1957-58"  — Bhimbetka, occupied c. 10,000 BCE

   Put any of those on a timeline and the monument is dated to the
   wrong millennium. The label whitelist below is what stops that:
   a year is only used if its label says the thing was BUILT, and
   the blacklist removes listing/excavation/rediscovery outright even
   if the wording is ambiguous.

   The value shown on the card is copied verbatim from the record —
   not reformatted, not normalised, not shortened. If the source
   says "c. 1571-1585" the card says "c. 1571-1585".
   ============================================================ */

import type { Site } from './types'

/**
 * Chronological. This array IS the timeline's ordering claim — it is
 * the only one the page makes, and it is true of every site.
 */
export const ERAS = ['ancient', 'medieval', 'mughal', 'colonial'] as const

export type Era = (typeof ERAS)[number]

/** A label that says the structure was made. */
const BUILT_LABEL =
  /\b(built|begun|commissioned|completed|installed|phase|occupied from|present structure|present building|present tower|present gold|gold plating|period|constructed|founded|laid)\b/i

/**
 * A label that says something else entirely. Matched first: if a
 * quick fact is on this list it is discarded no matter what else it
 * says, because these are dates about our knowledge of a site rather
 * than about the site.
 */
const NOT_BUILT_LABEL =
  /\b(unesco|listed|rediscover|documented|excavat|survey|inscrib|restor|renovat|reconstruct|gallery|museum|visitor)\b/i

/** Any four-digit year in a plausible range. */
const YEAR = /\b(1[0-9]{3}|20[0-2][0-9])\b/

export interface DatedSite {
  site: Site
  /** Verbatim "Label: value" from quickFacts, or null when unknown. */
  built: string | null
  /** First year parsed from `built`. Used ONLY to order within an era. */
  year: number | null
}

export interface EraBand {
  era: Era
  /** How the era is titled on screen. */
  label: string
  /** One sentence about the period. Descriptive, not a date claim. */
  note: string
  sites: DatedSite[]
  /** True when at least one site in the band carries a real year. */
  hasDates: boolean
}

/**
 * Find the construction date for one site, if it has one.
 *
 * Returns the value exactly as the record holds it, so the card can
 * never disagree with the source.
 */
export function constructionDate(site: Site): { label: string; value: string } | null {
  for (const fact of site.quickFacts ?? []) {
    const label = fact.label ?? ''
    if (NOT_BUILT_LABEL.test(label)) continue
    if (!BUILT_LABEL.test(label)) continue
    if (!YEAR.test(fact.value)) continue
    return { label, value: fact.value }
  }
  return null
}

/** First year in a construction string, for ordering only. */
function firstYear(value: string): number | null {
  const m = value.match(YEAR)
  return m ? Number(m[1]) : null
}

const NOTES: Record<Era, string> = {
  ancient: 'Rock-cut caves, stupas and the earliest surviving masonry.',
  medieval: 'Temple cities, stepwells and the great southern dynasties.',
  mughal: 'Garden tombs, red sandstone forts and planned capitals.',
  colonial: 'The most recent layer — civic buildings and royal residences.',
}

/**
 * Group the archive into chronological bands.
 *
 * Within a band, sites that carry a real construction year are placed
 * in date order; sites that do not come after them. They are NOT
 * interleaved by guess — a site with no recorded date has no position
 * on a date axis, and placing it by assumption would be inventing one.
 */
export function buildTimeline(sites: Site[]): EraBand[] {
  return ERAS.map((era) => {
    const members = sites
      .filter((s) => s.era === era)
      .map((site) => {
        const d = constructionDate(site)
        return {
          site,
          built: d ? `${d.label}: ${d.value}` : null,
          year: d ? firstYear(d.value) : null,
        }
      })

    const dated = members
      .filter((m) => m.year !== null)
      .sort((a, b) => (a.year as number) - (b.year as number))
    const undated = members.filter((m) => m.year === null)

    return {
      era,
      label: era.charAt(0).toUpperCase() + era.slice(1),
      note: NOTES[era],
      sites: [...dated, ...undated],
      hasDates: dated.length > 0,
    }
  }).filter((band) => band.sites.length > 0)
}

/** How many sites across the whole timeline carry a real year. */
export function datedCount(sites: Site[]): number {
  return sites.filter((s) => constructionDate(s) !== null).length
}
