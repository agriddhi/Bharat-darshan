/* ============================================================
   data/sites.ts — the app's view of the migrated data.

   sites.json is the single source of truth. Nothing in this file adds,
   edits or invents a field; it only indexes what is already there and
   provides the matching rules the scene and the search box share, so
   the counter in the top bar and the markers in the 3D field can never
   disagree about what is currently shown.
   ============================================================ */

import raw from './sites.json'
import type { Filters, RegionName, Site } from './types'
import { REGIONS } from './types'

export const SITES: Site[] = raw as unknown as Site[]

/** id -> site, for O(1) lookup when the camera or a panel needs one. */
export const SITE_BY_ID: Map<string, Site> = new Map(
  SITES.map((s) => [s.id, s])
)

export function getSite(id: string | null | undefined): Site | undefined {
  return id ? SITE_BY_ID.get(id) : undefined
}

/* ---- vocabularies, derived so the filters cannot offer a value the
        data does not actually contain ---- */

export const AVAILABLE_REGIONS: RegionName[] = REGIONS.filter((r) =>
  SITES.some((s) => s.region === r)
)

export const AVAILABLE_TYPES: string[] = sortedUnique(SITES.map((s) => s.type))
export const AVAILABLE_ERAS: string[] = sortedUnique(SITES.map((s) => s.era))

/** Sites that carry a linked document, for the script/document filter. */
export const SITES_WITH_DOCUMENTS: string[] = SITES.filter(
  (s) => Array.isArray(s.media) && s.media.some((m) => m.kind === 'document')
).map((s) => s.id)

export function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

/* ---- matching ---- */

/**
 * Does this site pass the current filters?
 *
 * Filters combine with AND; within one filter, values combine with OR
 * (a site is either in the region or it is not). An unset filter
 * matches everything, so an empty filter set shows all sites — which is
 * what "X of Y sites shown" reports when nothing is chosen.
 */
export function matchesFilters(site: Site, f: Filters): boolean {
  if (f.region && site.region !== f.region) return false
  if (f.type && site.type !== f.type) return false
  if (f.era && site.era !== f.era) return false
  if (f.hasDocument && !SITES_WITH_DOCUMENTS.includes(site.id)) return false
  return true
}

/**
 * Case- and accent-insensitive substring match over the text a search
 * is allowed to see: title, description and tags.
 *
 * Document text is deliberately NOT searched yet — there are no
 * documents in this build, and searching a field that does not exist
 * would either silently do nothing or, worse, tempt someone to fill it
 * with placeholder text.
 */
export function matchesQuery(site: Site, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true

  const haystack = [
    site.title,
    site.description,
    site.state,
    site.city ?? '',
    site.type,
    site.era,
    ...(site.tags ?? []),
  ]
    .join(' \u0000 ')
    .toLowerCase()

  // every word must appear somewhere, so "red fort" does not match
  // every site containing "red"
  return needle.split(/\s+/).every((word) => haystack.includes(word))
}

/** Filters AND query — the single definition of "currently shown". */
export function isShown(site: Site, f: Filters, query: string): boolean {
  return matchesFilters(site, f) && matchesQuery(site, query)
}

/** The subset of sites the scene should render as active right now. */
export function visibleSites(f: Filters, query: string): Site[] {
  return SITES.filter((s) => isShown(s, f, query))
}

/* ---- formatting helpers shared by the UI ---- */

/** "tomb" -> "Tomb", for any label the data stores in lower case. */
export function titleCase(v: string): string {
  if (!v) return v
  return v.charAt(0).toUpperCase() + v.slice(1)
}

/** Region mood token, for the UI to tint a chip with. */
export function regionToken(region: string): string {
  return `var(--scene-${region.toLowerCase()})`
}
