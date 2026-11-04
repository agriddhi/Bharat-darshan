/* ============================================================
   data/types.ts — the shape of sites.json.

   These types are the contract between the migrated data and
   everything that renders it. If a field is not here, it is not in the
   app, which is the point: it stops someone quietly adding a fact that
   has no home in the data file and therefore no source.
   ============================================================ */

export type RegionName =
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Central'
  | 'Northeast'

/**
 * The four filter axes. Lives here rather than in the store because it
 * describes the data's shape, not the app's behaviour — data/ modules
 * must not import from state/, or the dependency arrow starts pointing
 * the wrong way.
 */
export interface Filters {
  region: string | null
  type: string | null
  era: string | null
  /** Only sites that have a linked manuscript document match. */
  hasDocument: boolean
}

/** A single asset attached to a site. */
export interface MediaItem {
  kind: 'photo' | 'panorama' | 'document'
  src: string
  caption: string
  credit?: string | null
  license?: string | null
}

/** A clickable citation. Opens in a new tab; never rewritten. */
export interface SourceLink {
  label: string
  url: string
}

/** Provenance for the generated photo-credits table. */
export interface Credits {
  photographer: string
  license: string
  filename: string
}

export interface QuickFact {
  label: string
  value: string
}

/** One of the five story stages carried over from v1. */
export interface StoryStage {
  title: string
  titleHi?: string
  body: string
  bodyHi?: string
  /** v1 marks these TODO. They stay TODO — see MIGRATION.md. */
  image: string | null
}

export interface QuizItem {
  q: string
  options: string[]
  /** Index into options. */
  answer: number
  explain: string

  /* Hindi, written alongside the English rather than instead of it.
     All 75 items currently carry all three; they are optional in the
     type because the interface falls back to the English when a field
     is absent, so an untranslated question renders as itself rather
     than as a hole. */
  qHi?: string
  optionsHi?: string[]
  explainHi?: string
}

export interface Site {
  /* ---- required by the v2 schema ---- */
  id: string
  title: string
  state: string
  region: RegionName
  type: string
  era: string
  description: string
  descriptionHi?: string
  /**
   * ALWAYS null in the current data. v1 had no folklore field, and
   * inventing folk narrative to fill a schema hole would break the
   * project's rule that nothing is stated without a source.
   */
  folkloreNote: string | null
  lat: number
  lng: number
  tags: string[]
  media: MediaItem[]
  sourceLinks: SourceLink[]
  sources: string[]
  credits: Credits

  /* ---- carried from v1: verification content, never dropped ---- */
  officialSource: { label: string | null; url: string | null } | null
  /** Recomputed with v1's exact URL pattern. */
  govLink: string | null
  city?: string
  nameHi?: string
  history?: string
  historyHi?: string
  story?: StoryStage[]
  quickFacts?: QuickFact[]
  quiz?: QuizItem[]
  isUnesco?: boolean
  isUnescoRef?: string
  isOfficiallyProtected?: boolean
  protectedBy?: string
  pano360?: string
  pano360Note?: string
  featured?: boolean
  heroImage?: string
  thumbnailImage?: string
  slug?: string
}

/* ---- vocabularies, derived from the data at import time ---- */

export const REGIONS: RegionName[] = [
  'North',
  'Northeast',
  'Central',
  'West',
  'East',
  'South',
]

/**
 * Region mood colours. Read from tokens.css at runtime rather than
 * duplicated here, so the scene and the stylesheet cannot disagree —
 * the same discipline v1 uses for its map markers.
 */
export const REGION_TOKEN: Record<RegionName, string> = {
  North: 'var(--scene-north)',
  South: 'var(--scene-south)',
  East: 'var(--scene-east)',
  West: 'var(--scene-west)',
  Central: 'var(--scene-central)',
  Northeast: 'var(--scene-northeast)',
}

/** The same colours as plain hex, for anything three.js needs. */
export const REGION_HEX: Record<RegionName, string> = {
  North: '#4A6B3F',
  South: '#1D5A6E',
  East: '#7A2E3A',
  West: '#A88B5C',
  Central: '#8A6D4F',
  Northeast: '#5F7040',
}

export function uniqueSorted(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort((a, b) =>
    a.localeCompare(b)
  )
}
