/* ============================================================
   scene/Lighting.tsx — light, fog, and the per-region mood.

   The brief assigns each region a mood colour used three ways: as a
   lighting tint, as a fog tint, and as the marker glow. This file owns
   the first two.

   ABOUT THE FOG
   three.js supports exactly one scene fog, so a literal per-region fog
   colour is not possible without splitting the scene into layers. The
   honest approach instead: the global fog is the deep canvas colour
   (depth, not a colour), and each region gets a soft coloured ground
   disc under it — see RegionCluster. That reads as a local haze in the
   region's mood colour, which is what the brief is after, without
   pretending three.js can fog one region differently from its neighbour.
   ============================================================ */

import { REGIONS } from '../data/types'
import { REGION_HEX } from '../data/types'
import { FIELD_RADIUS } from './layout'

export interface RegionCell {
  region: string
  x: number
  z: number
  count: number
}

interface Props {
  cells: RegionCell[]
}

export function Lighting({ cells }: Props) {
  return (
    <>
      {/* Global fog: the deep canvas colour. Depth, not a mood. */}
      <fog attach="fog" args={['#0E1626', 34, 118]} />

      {/* Base fill — cool and low so the ochre markers stay the
          brightest thing in frame and the eye knows where to go. */}
      <ambientLight intensity={0.42} color="#93A7C4" />

      {/* Key light: warm, from above and front-left, like late sun
          hitting stone. This is what gives the columns their form. */}
      <directionalLight
        position={[12, 20, 8]}
        intensity={1.05}
        color="#FFF1DC"
        castShadow={false}
      />

      {/* Cool counter-light from behind, so silhouettes do not go flat
          against the dark ground. */}
      <directionalLight
        position={[-10, 9, -12]}
        intensity={0.3}
        color="#416A81"
      />

      {/* Horizon wash — keeps the far edge of the field from dropping
          to pure black, which the brief rules out. */}
      <hemisphereLight
        args={['#1B2A44', '#0E1626', 0.35]}
        position={[0, 40, 0]}
      />

      {/* --- per-region mood tint ---
          One point light per occupied cell, tinted with that region's
          mood colour and scaled to how many sites it holds, so a busy
          region glows a little more strongly than a quiet one.
          These are scene colours. They are never read by the UI. */}
      {REGIONS.map((region) => {
        const cell = cells.find((c) => c.region === region)
        if (!cell || cell.count === 0) return null

        const color = REGION_HEX[region as keyof typeof REGION_HEX]
        // 1 site = gentle wash; 7 sites = a clearly lit pocket
        const intensity = 1.1 + Math.min(cell.count, 7) * 0.16

        return (
          <pointLight
            key={region}
            position={[cell.x, 7.5, cell.z]}
            color={color}
            intensity={intensity}
            distance={26}
            decay={1.7}
          />
        )
      })}
    </>
  )
}

/** Exported so the camera rig can frame the whole field without
 *  re-deriving the grid. */
export const LIGHT_FOG_NEAR = 34
export const LIGHT_FOG_FAR = 118
export const LIGHT_FIELD_RADIUS = FIELD_RADIUS
