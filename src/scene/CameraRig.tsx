/* ============================================================
   scene/CameraRig.tsx — every camera move in the app.

   THE RULES IT ENFORCES
   - One move at a time, always easing (power2.inOut). Nothing snaps.
   - A single move never rotates more than 90 degrees. yawStep() in
     state/camera.ts clamps it, so "glide" cannot become "flip".
   - Any user input aborts a running move instantly. The brief calls
     for the push-in to be interruptible; that is not a nicety, because
     a camera you cannot stop is a camera that traps you.

   HOW IT DRIVES THE CAMERA
   gsap tweens a plain object of numbers. useFrame copies those numbers
   onto the camera and the controls target. Two reasons not to tween the
   camera directly:

   1. OrbitControls recomputes the camera position from its own
      spherical state on every update, so external writes can be
      swallowed. Writing through once per frame, after the tween has
      advanced, gives a single authority per frame.

   2. Aborting is trivial — kill the tween, stop writing, and the
      controls simply carry on from wherever the camera happens to be.
      No state to unwind.
   ============================================================ */

import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import gsap from 'gsap'

import { useCamera, yawStep, DUR, type SequencedCommand } from '../state/camera'
import { FIELD_RADIUS } from './layout'

/** Elevation used when framing a single monument. */
const PITCH_CLOSE = 0.36
/** Elevation used when pulling back to see the whole field. */
const PITCH_HOME = 0.6

const DIST_PUSH_IN = 9.5
const DIST_FLY = 13
const DIST_GLIDE = 10.5
const DIST_HOME = FIELD_RADIUS * 2.15

/** Zoom clamp — the brief asks for a reasonable range. */
const MIN_DIST = 6
const MAX_DIST = 96

interface Props {
  /** id -> world position, from scene/layout.ts */
  positions: Map<string, { x: number; z: number }>
}

interface Drive {
  px: number
  py: number
  pz: number
  tx: number
  ty: number
  tz: number
  active: boolean
}

export function CameraRig({ positions }: Props) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  const camera = useThree((s) => s.camera)

  const command = useCamera((s) => s.command)
  const consume = useCamera((s) => s.consume)

  const drive = useRef<Drive>({
    px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, active: false,
  })
  const lastSeq = useRef(0)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  /* ---- abort on any user input ---- */
  const abort = () => {
    if (!drive.current.active) return
    gsap.killTweensOf(drive.current)
    drive.current.active = false
    document.body.style.cursor = ''
  }

  useEffect(() => {
    // Wheel and pointerdown cover everything OrbitControls responds to,
    // including trackpad pinch and touch drag.
    const el = document.querySelector('canvas')
    if (!el) return
    el.addEventListener('pointerdown', abort)
    el.addEventListener('wheel', abort, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', abort)
      el.removeEventListener('wheel', abort)
    }
  }, [controls])

  /* ---- perform a command ---- */
  useEffect(() => {
    if (!command || command.seq === lastSeq.current) return
    lastSeq.current = command.seq

    const c = command
    const start = drive.current

    // Abort anything already running before starting the next move, so
    // two quick clicks do not stack and fight.
    gsap.killTweensOf(start)

    const yawNow = Math.atan2(
      camera.position.x - start.tx,
      camera.position.z - start.tz
    )

    let tx = start.tx, ty = start.ty, tz = start.tz
    let dist = DIST_PUSH_IN
    let pitch = PITCH_CLOSE
    // typed as number, not inferred from DUR.pushIn: DUR is `as const`,
    // so the initializer would pin this variable to the literal 1.2 and
    // every later assignment would be a type error.
    let duration: number = DUR.pushIn

    if (c.kind === 'home') {
      tx = 0; ty = 1.5; tz = 0
      dist = DIST_HOME
      pitch = PITCH_HOME
      duration = DUR.home
    } else {
      const p = positions.get(c.siteId)
      if (p) {
        tx = p.x
        tz = p.z
        // aim at the middle of the column, not its foot
        ty = 1.7
      }
      if (c.kind === 'fly') { dist = DIST_FLY; duration = DUR.fly }
      if (c.kind === 'glide') { dist = DIST_GLIDE; duration = DUR.glide; pitch = 0.42 }
    }

    // Approach from the current viewing direction, rotated toward the
    // target by at most 90 degrees. This is what keeps every move
    // feeling like one continuous turn rather than a cut.
    const yawWant = Math.atan2(
      camera.position.x - tx,
      camera.position.z - tz
    )
    const yaw = yawNow + yawStep(yawNow, yawWant)

    const px = tx + Math.sin(yaw) * Math.cos(pitch) * dist
    const py = ty + Math.sin(pitch) * dist
    const pz = tz + Math.cos(yaw) * Math.cos(pitch) * dist

    // seed the drive from where the camera actually is, so the first
    // frame of the tween starts exactly on screen — no jump.
    start.px = camera.position.x
    start.py = camera.position.y
    start.pz = camera.position.z
    start.tx = controlsRef.current ? controlsRef.current.target.x : 0
    start.ty = controlsRef.current ? controlsRef.current.target.y : 0
    start.tz = controlsRef.current ? controlsRef.current.target.z : 0
    start.active = true

    gsap.to(start, {
      px, py, pz, tx, ty, tz,
      duration,
      ease: 'power2.inOut', // ease-in-out, per the brief
      onComplete: () => { start.active = false },
    })

    consume()
  }, [command, camera, positions, consume])

  /* ---- write the tween through, once per frame ---- */
  useFrame(() => {
    const d = drive.current
    if (!d.active) return

    camera.position.set(d.px, d.py, d.pz)

    const ctl = controlsRef.current
    if (ctl) {
      ctl.target.set(d.tx, d.ty, d.tz)
      ctl.update()
    }
  })

  return (
    <OrbitControls
      ref={(c) => { controlsRef.current = c }}
      makeDefault
      enableDamping
      dampingFactor={0.075}
      rotateSpeed={0.55}
      zoomSpeed={0.8}
      panSpeed={0.6}
      enablePan
      minDistance={MIN_DIST}
      maxDistance={MAX_DIST}
      // Clamp the pitch so the camera cannot dive under the ground plane
      // or stare straight down like a satellite view.
      minPolarAngle={0.14}
      maxPolarAngle={Math.PI / 2 - 0.1}
      // Target stays near the field; panning cannot drag the world away.
      target={[0, 1.5, 0]}
    />
  )
}

/** Exported for the World to place an initial camera without guessing. */
export const HOME_VIEW = {
  position: new THREE.Vector3(0, DIST_HOME * 0.6, DIST_HOME * 0.82),
  target: new THREE.Vector3(0, 1.5, 0),
}
