/* ============================================================
   scene/World.tsx — the full-screen 3D field.

   This is the app's home. There is no router and no page transition:
   every "page" in v2 is a camera state plus a panel, and this canvas
   never unmounts. Switching from the world to a story does not reload
   anything, it moves the camera and slides a panel over the top.

   COLOUR NOTES
   The background is --canvas-deep (#0E1626), not black. The brief is
   explicit about that: pure black kills the sense of depth and makes
   additive glows look like they are floating in a hole rather than
   sitting in air.
   ============================================================ */

import * as THREE from 'three'
import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'

import { SITES, isShown } from '../data/sites'
import { useStore } from '../state/store'
import { layoutSites } from './layout'
import { Lighting } from './Lighting'
import { RegionCluster } from './RegionCluster'
import { Monument } from './Monument'
import { Particles } from './Particles'
import { CameraRig } from './CameraRig'
import { RouteLine } from './RouteLine'
import { REGIONS } from '../data/types'

const CANVAS_DEEP = '#0E1626'

export function World() {
  const filters = useStore((s) => s.filters)
  const query = useStore((s) => s.query)

  // Layout depends only on the data, so it is computed once. Filters
  // never move a monument — they dim and sink it. Moving markers when
  // you type would make the field feel unstable and would break the
  // region reading the grid exists to provide.
  const layout = useMemo(() => layoutSites(SITES), [])

  // Which regions actually have sites, so we do not light an empty cell.
  const cells = useMemo(() => {
    return REGIONS.map((region) => {
      const members = SITES.filter((s) => s.region === region)
      const first = members.length ? layout.get(members[0].id) : undefined
      return {
        region,
        x: first?.cellX ?? 0,
        z: first?.cellZ ?? 0,
        count: members.length,
      }
    }).filter((c) => c.count > 0)
  }, [layout])

  const positions = useMemo(() => {
    const m = new Map<string, { x: number; z: number }>()
    for (const [id, p] of layout) m.set(id, { x: p.x, z: p.z })
    return m
  }, [layout])

  // Per-site visibility, computed once per filter/query change rather
  // than per frame. Deliberately delegated to isShown() — the SAME
  // function the top-bar counter uses — so a marker can never be lit
  // while the counter says it is hidden, or the reverse.
  const shownIds = useMemo(() => {
    const set = new Set<string>()
    for (const s of SITES) if (isShown(s, filters, query)) set.add(s.id)
    return set
  }, [filters, query])

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 42, 58], fov: 42, near: 0.5, far: 260 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
    >
      {/* not pure black — the brief rules it out, and the fog colour
          below matches it so distance dissolves rather than cuts */}
      <color attach="background" args={[CANVAS_DEEP]} />

      <Suspense fallback={null}>
        <Lighting cells={cells} />

        {/* the ground: a plain field, no texture to load, no network */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[120, 72]} />
          <meshStandardMaterial
            color="#141E31"
            roughness={0.96}
            metalness={0.04}
          />
        </mesh>

        {/* region mood pools — the "fog tint" from the brief */}
        {REGIONS.map((region) => {
          const cell = cells.find((c) => c.region === region)
          if (!cell) return null
          const regionShown = !filters.region || filters.region === region
          return (
            <RegionCluster
              key={region}
              region={region}
              x={cell.x}
              z={cell.z}
              count={cell.count}
              emphasis={regionShown ? 1 : 0.2}
            />
          )
        })}

        {/* the sites */}
        {SITES.map((site) => {
          const p = layout.get(site.id)
          if (!p) return null
          return (
            <Monument
              key={site.id}
              site={site}
              x={p.x}
              z={p.z}
              shown={shownIds.has(site.id)}
            />
          )
        })}

        <Particles />

        {/* the journey route, drawn only once there are 2+ stops */}
        <RouteLine layout={layout} />
      </Suspense>

      <CameraRig positions={positions} />
    </Canvas>
  )
}
