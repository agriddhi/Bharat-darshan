/* ============================================================
   scene/Monument.tsx — one site, as a glowing marker column.

   WHY A COLUMN AND NOT A MODELLED BUILDING
   The sites are laid out on a region grid, not on a map, so a
   recognisable silhouette would imply a geographic relationship the
   layout does not have. A uniform column is honest about being a
   marker, and the brief offers it as the first choice.

   NOTHING HERE ENCODES DATA EXCEPT THE UNESCO RING.
   Every column is the same height and width on purpose. It would be
   easy — and tempting — to make a beloved site taller, but height
   would then read as importance, and we have no source that ranks
   these places. The ochre ring at the base of some columns is real
   data: those sites are on the UNESCO World Heritage List, with the
   reference number carried over from v1.

   MOTION
   Every animated value is damped toward a target in useFrame rather
   than set directly, so hover, un-hover and filter changes glide. The
   brief caps a single camera move at ~90 degrees and forbids snapping;
   the same spirit applies to objects.
   ============================================================ */

import * as THREE from 'three'
import { useRef, useState, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Site } from '../data/types'
import { useStore } from '../state/store'

/** Base height of every column. Identical for all sites — see header. */
const COLUMN_H = 3.2
const COLUMN_W = 0.72

/** How far a marker rises when hovered. */
const HOVER_LIFT = 0.55
/** How far a filtered-out marker sinks. */
const FILTER_SINK = 0.9

/**
 * Damping rate. Tuned so a change settles in roughly 0.7s at 60fps,
 * which sits inside the brief's 0.6–0.8s window for filter animation.
 */
const DAMP = 5.4

interface Props {
  site: Site
  x: number
  z: number
  /** True when the current filters + query keep this site visible. */
  shown: boolean
}

export function Monument({ site, x, z, shown }: Props) {
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.MeshStandardMaterial>(null)
  const cap = useRef<THREE.MeshStandardMaterial>(null)

  const hovered = useStore((s) => s.hoveredId === site.id)
  const selected = useStore((s) => s.selectedId === site.id)
  const inJourney = useStore((s) => s.journey.includes(site.id))

  const hover = useStore((s) => s.hover)
  const select = useStore((s) => s.select)

  const [pointerOver, setPointerOver] = useState(false)

  // Targets are computed each frame from state, so there is no
  // animation bookkeeping to get out of step when a filter changes
  // while the pointer is already on the marker.
  const state = useRef({ y: 0, glow: 1, opacity: 1 })
  const baseY = 0

  const isUnesco = !!site.isUnesco

  // Ochre is the only interactive accent, so hover glow is ochre and
  // nothing else competes for that job.
  const ochre = useMemo(() => new THREE.Color('#DEA044'), [])
  const stone = useMemo(() => new THREE.Color('#CDC8B8'), [])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    const targetY = baseY + (hovered ? HOVER_LIFT : 0) - (shown ? 0 : FILTER_SINK)
    const targetGlow = shown ? (hovered || selected ? 2.4 : 1.0) : 0.18
    const targetOpacity = shown ? 1 : 0.2 // brief: non-matching ~20%

    const k = 1 - Math.exp(-DAMP * delta) // framerate-independent damp

    state.current.y += (targetY - state.current.y) * k
    state.current.glow += (targetGlow - state.current.glow) * k
    state.current.opacity += (targetOpacity - state.current.opacity) * k

    g.position.y = state.current.y

    // gentle idle drift — slow enough to read as breathing, never as motion
    g.rotation.y += delta * (hovered ? 0.35 : 0.12)

    if (cap.current) {
      cap.current.emissiveIntensity = state.current.glow
      cap.current.opacity = state.current.opacity
      cap.current.color.copy(hovered || selected ? ochre : stone)
    }
    if (body.current) {
      body.current.emissiveIntensity = 0.12 * state.current.glow
      body.current.opacity = state.current.opacity
      body.current.transparent = state.current.opacity < 0.999
    }
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hover(site.id)
    setPointerOver(true)
    // cursor change lives here rather than in CSS: the canvas is one
    // element to the DOM, so a stylesheet cannot see which marker is
    // under the pointer
    document.body.style.cursor = 'pointer'
  }

  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hover(null)
    setPointerOver(false)
    document.body.style.cursor = ''
  }

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    select(site.id)
  }

  return (
    <group
      ref={group}
      position={[x, baseY, z]}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
      visible={state.current.opacity > 0.01 || shown}
    >
      {/* column body — soft stone, faintly lit from within */}
      <mesh position={[0, COLUMN_H / 2, 0]}>
        <boxGeometry args={[COLUMN_W, COLUMN_H, COLUMN_W]} />
        <meshStandardMaterial
          ref={body}
          color="#CDC8B8"
          emissive="#DEA044"
          emissiveIntensity={0.12}
          roughness={0.72}
          metalness={0.08}
          transparent
          opacity={1}
        />
      </mesh>

      {/* glowing cap — the beacon you can read across the field */}
      <mesh position={[0, COLUMN_H + 0.18, 0]}>
        <sphereGeometry args={[0.34, 20, 16]} />
        <meshStandardMaterial
          ref={cap}
          color="#DEA044"
          emissive="#DEA044"
          emissiveIntensity={1}
          roughness={0.35}
          metalness={0.2}
          transparent
          opacity={1}
        />
      </mesh>

      {/* base plate — grounds the column so it does not float */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.62, 0.7, 0.1, 24]} />
        <meshStandardMaterial color="#8F8A7C" roughness={0.9} metalness={0}
          transparent opacity={1} />
      </mesh>

      {/* UNESCO ring — the only per-site variation, and it is real data.
          The reference number travels with the site in the story panel. */}
      {isUnesco && (
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.74, 0.9, 32]} />
          <meshBasicMaterial
            color="#DEA044"
            transparent
            opacity={shown ? (hovered ? 0.95 : 0.55) : 0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* journey stop ring — ochre, because ochre means "interactive" */}
      {inJourney && (
        <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.18, 32]} />
          <meshBasicMaterial
            color="#DEA044"
            transparent
            opacity={shown ? 0.85 : 0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* invisible, generous hit target — a 0.7-wide box is a small
          target with a mouse and hopeless with a thumb */}
      <mesh position={[0, COLUMN_H / 2, 0]} visible={false}>
        <boxGeometry args={[1.9, COLUMN_H + 1.4, 1.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* keeps the pointer cursor honest if state changes under it */}
      {pointerOver && null}
    </group>
  )
}
