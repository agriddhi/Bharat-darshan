/* ============================================================
   scene/layout.ts — where every monument sits.

   The brief is explicit: arrange by REGION INDEX, not by raw lat/lng.
   Two reasons, both practical:

   1. Real coordinates squash everything into the north-west of the
      frame, because India's sites cluster. Six readable groups beat one
      dense smear.

   2. A region grid means a filter that dims "South" dims a whole
      cluster you can see at a glance, which is what makes filtering
      legible instead of a game of spot-the-difference.

   The six cells are placed in a loose geographic cross — North on top,
   South below, West left, East right, Central in the middle,
   Northeast tucked top-right — so the arrangement still reads as India
   without pretending to be a map.
   ============================================================ */

import type { RegionName, Site } from '../data/types'
import { REGIONS } from '../data/types'

/** Distance between region cell centres, in world units. */
export const CELL = 16
/** Spacing between monuments inside one cell. */
export const SPACING = 4.4

/**
 * Cell centre for each region, on the XZ plane.
 * Chosen so the six groups never overlap at the zoom levels we clamp to.
 */
const CELL_ORIGIN: Record<RegionName, [number, number]> = {
  North: [0, -CELL],
  Northeast: [CELL, -CELL],
  Central: [0, 0],
  West: [-CELL, 0],
  East: [CELL, 0],
  South: [0, CELL],
}

export interface Placed {
  id: string
  region: RegionName
  x: number
  z: number
  /** Centre of this site's region cell — the camera aims here on a region fly-to. */
  cellX: number
  cellZ: number
  /** How many sites share this cell, used to scale the region glow. */
  cellCount: number
}

/**
 * Lay sites out on the region grid.
 *
 * Within a cell, sites are packed into a small square grid sized to the
 * number of occupants, centred on the cell origin. Cells with more
 * sites therefore spread wider rather than piling on top of each other,
 * which keeps every marker clickable at any zoom we allow.
 */
export function layoutSites(sites: Site[]): Map<string, Placed> {
  const byRegion = new Map<RegionName, Site[]>()
  for (const r of REGIONS) byRegion.set(r, [])

  for (const s of sites) {
    const bucket = byRegion.get(s.region)
    if (bucket) bucket.push(s)
  }

  const placed = new Map<string, Placed>()

  for (const region of REGIONS) {
    const group = byRegion.get(region) ?? []
    if (group.length === 0) continue

    const [cx, cz] = CELL_ORIGIN[region]

    // columns scale with the group size so a 7-site region spreads wider
    // than a 2-site one instead of overlapping
    const cols = Math.ceil(Math.sqrt(group.length))
    const rows = Math.ceil(group.length / cols)

    // offset the whole block so it is centred on the cell origin
    const offsetX = ((cols - 1) * SPACING) / 2
    const offsetZ = ((rows - 1) * SPACING) / 2

    group.forEach((site, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      placed.set(site.id, {
        id: site.id,
        region,
        x: cx + col * SPACING - offsetX,
        z: cz + row * SPACING - offsetZ,
        cellX: cx,
        cellZ: cz,
        cellCount: group.length,
      })
    })
  }

  return placed
}

/** Centre of the whole field, used as the camera's home target. */
export const FIELD_CENTER: [number, number] = [0, 0]

/**
 * How far back the camera sits to see everything.
 * Sized from the grid itself so adding a region does not require
 * retuning a magic number.
 */
export const FIELD_RADIUS = CELL * 1.7
