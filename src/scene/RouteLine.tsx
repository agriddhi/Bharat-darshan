/* ============================================================
   scene/RouteLine.tsx — the journey drawn in the world.

   The brief is explicit that the route must be visible in the 3D field
   and not only in a panel. This draws it as a glowing ochre line
   between consecutive stops, in the order they were added — because
   the order is the point of a route; a line drawn between unordered
   points would be a shape, not an itinerary.

   The line runs above the ground on a shallow arc rather than flat
   along it, so it stays readable when the camera drops to a low angle
   and does not z-fight with the plane underneath.
   ============================================================ */

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'

import { useStore } from '../state/store'
import { resolveJourney } from '../state/journey'
import type { Placed } from './layout'

const OCHRE = '#DEA044'
/** Height the arc rides at, so the route clears the ground plane. */
const ARC_Y = 1.15

interface Props {
  layout: Map<string, Placed>
}

export function RouteLine({ layout }: Props) {
  const journey = useStore((st) => st.journey)
  const playIndex = useStore((st) => st.playIndex)
  const playing = useStore((st) => st.playing)

  const sites = resolveJourney(journey)

  // Only the stops that actually have a position in the grid.
  const points = useMemo(
    () =>
      sites
        .map((s) => layout.get(s.id))
        .filter((p): p is Placed => !!p)
        .map((p) => [p.x, ARC_Y, p.z] as [number, number, number]),
    [sites, layout]
  )

  // 2+ stops are needed before a route exists — one stop is a pin,
  // not a path.
  if (points.length < 2) return null

  // A gentle vertical bow, so the path arcs instead of cutting a
  // straight chord through the field.
  const bowed = points.map((p, i) => {
    const t = points.length === 1 ? 0 : i / (points.length - 1)
    const lift = Math.sin(t * Math.PI) * 0.9
    return [p[0], p[1] + lift, p[2]] as [number, number, number]
  })

  // The next stop to be framed: during playback it is playIndex, and
  // otherwise the route has not started, so nothing is "next".
  const activeIndex = playing ? playIndex : -1

  return (
    <group>
      {/* the path itself */}
      <Line
        points={bowed}
        color={OCHRE}
        lineWidth={3.2}
        dashed={false}
        transparent
        opacity={0.82}
      />

      {/* a wider, softer echo underneath, so the line reads as glowing
          rather than as a wire drawn on the screen */}
      <Line
        points={bowed}
        color={OCHRE}
        lineWidth={9}
        transparent
        opacity={0.16}
      />

      {/* one marker per stop */}
      {points.map((p, i) => (
        <StopMarker
          key={`${journey[i]}-${i}`}
          position={p}
          index={i}
          total={points.length}
          active={i === activeIndex}
        />
      ))}
    </group>
  )
}

interface StopProps {
  position: [number, number, number]
  index: number
  total: number
  active: boolean
}

function StopMarker({ position, index, active }: StopProps) {
  const ring = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const m = material.current
    if (!m) return

    // A slow, shallow pulse — enough to say "alive" without pulling the
    // eye off the monument the camera is framing.
    const t = state.clock.elapsedTime
    const phase = index * 0.7
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.7 - phase)

    m.opacity = active ? 0.55 + pulse * 0.45 : 0.3 + pulse * 0.22

    if (ring.current) {
      // the active stop breathes a little larger than the rest
      const base = active ? 1.25 : 1
      ring.current.scale.setScalar(base + pulse * (active ? 0.22 : 0.1))
    }
  })

  return (
    <group position={position}>
      {/* stop number — a small ochre disc on the ground */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -ARC_Y + 0.06, 0]}>
        <ringGeometry args={[0.5, 0.72, 28]} />
        <meshBasicMaterial
          ref={material}
          color={OCHRE}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* the beacon rising from the stop */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 1.2, 12]} />
        <meshBasicMaterial color={OCHRE} transparent opacity={active ? 0.95 : 0.6} />
      </mesh>

      {/* head marker, brighter when this is the stop being framed */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[active ? 0.3 : 0.22, 16, 12]} />
        <meshBasicMaterial color={OCHRE} transparent opacity={active ? 1 : 0.75} />
      </mesh>
    </group>
  )
}
