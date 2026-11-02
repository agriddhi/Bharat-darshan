/* ============================================================
   state/camera.ts — how the UI asks the camera to move.

   Kept out of the main store on purpose. Camera requests are shouted
   once and then forgotten; if they lived in the app store, every
   component subscribed to store state would re-render whenever the
   camera moved, including the panels that have nothing to do with it.

   `seq` exists so issuing the same command twice still counts. Click
   the same monument twice and you want the push-in twice; without a
   counter the second click would look identical to the first to any
   subscriber comparing by value.
   ============================================================ */

import { create } from 'zustand'

export type CameraCommand =
  /** Frame one monument closely — used when a story opens. */
  | { kind: 'push-in'; siteId: string }
  /** Move toward a site without committing to a story — search fly-to. */
  | { kind: 'fly'; siteId: string }
  /** Pull back to see the whole field. */
  | { kind: 'home' }
  /** Glide to a journey stop during route playback. */
  | { kind: 'glide'; siteId: string; index: number }

export type SequencedCommand = CameraCommand & { seq: number }

interface CameraState {
  command: SequencedCommand | null
  /** Bumped on every issue, so identical commands are never deduped. */
  seq: number
  issue: (c: CameraCommand) => void
  /** Called by the rig once it has started the move. */
  consume: () => void
}

export const useCamera = create<CameraState>((set, get) => ({
  command: null,
  seq: 0,

  issue: (c) => {
    const seq = get().seq + 1
    set({ seq, command: { ...c, seq } })
  },

  consume: () => set({ command: null }),
}))

/* ---- motion limits, stated once so every move obeys the same rules ---- */

/**
 * The brief caps a single camera move at roughly 90 degrees of
 * rotation. Yaw is wrapped into ±180 and the arc is clamped here, so no
 * command can ask the camera to spin the long way round — which is what
 * makes a "glide" read as a glide rather than as a flip.
 */
export const MAX_YAW_STEP = Math.PI / 2 // 90 degrees

/**
 * Shortest-path yaw: returns the signed difference from `from` to `to`,
 * wrapped to (-180, 180], then clamped to the 90-degree budget.
 */
export function yawStep(from: number, to: number): number {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d <= -Math.PI) d += Math.PI * 2
  if (d > MAX_YAW_STEP) d = MAX_YAW_STEP
  if (d < -MAX_YAW_STEP) d = -MAX_YAW_STEP
  return d
}

/** Durations from tokens.css, mirrored here because gsap needs numbers. */
export const DUR = {
  pushIn: 1.2, // inside the brief's 1–1.5s window
  fly: 1.3,
  glide: 1.4,
  home: 1.5,
} as const
