/* ============================================================
   ui/Timeline.tsx — play, pause, scrub, and read the running total.

   The scrubber is a real <input type="range"> rather than a div with
   a click handler. That buys keyboard operation, a native focus ring,
   and a value that assistive tech already understands — all of which
   would have to be rebuilt by hand on a custom control, and usually
   badly.

   Scrubbing jumps immediately rather than easing through intermediate
   stops. Skimming a route is not the same as playing it, and making a
   user watch every intermediate glide to reach stop four would turn
   the control into a punishment.
   ============================================================ */

import s from './Timeline.module.css'
import { cumulativeKm, formatKm, haversineKm } from '../state/journey'
import { useStore } from '../state/store'
import { useCamera } from '../state/camera'

interface Props {
  stops: ReturnType<typeof import('../state/journey').resolveJourney>
}

export function Timeline({ stops }: Props) {
  const playing = useStore((st) => st.playing)
  const playIndex = useStore((st) => st.playIndex)
  const setPlaying = useStore((st) => st.setPlaying)
  const setPlayIndex = useStore((st) => st.setPlayIndex)
  const issue = useCamera((st) => st.issue)

  // Two stops are needed before there is a route to play.
  if (stops.length < 2) return null

  const atEnd = playIndex >= stops.length - 1
  const safeIndex = Math.min(playIndex, stops.length - 1)
  const current = stops[safeIndex]

  // Distance covered up to and including the current stop.
  const covered = cumulativeKm(stops.slice(0, safeIndex + 1))
  const remaining = cumulativeKm(stops) - covered

  const toggle = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    // Pressing play from the end restarts, otherwise the button would
    // appear dead the moment a route finishes.
    const startIndex = atEnd ? 0 : safeIndex
    if (startIndex !== playIndex) setPlayIndex(startIndex)
    setPlaying(true)
    issue({ kind: 'glide', siteId: stops[startIndex].id, index: startIndex })
  }

  const scrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value)
    setPlayIndex(next)
    setPlaying(false)
    issue({ kind: 'glide', siteId: stops[next].id, index: next })
  }

  const pct = stops.length > 1 ? (safeIndex / (stops.length - 1)) * 100 : 0

  return (
    <div className={s.wrap} role="group" aria-label="Route playback">
      <button
        type="button"
        className={s.play}
        onClick={toggle}
        aria-label={playing ? 'Pause route' : 'Play route'}
      >
        {playing ? '❚❚' : '▶'}
      </button>

      <div className={s.track}>
        <input
          className={s.scrub}
          type="range"
          min={0}
          max={stops.length - 1}
          step={1}
          value={safeIndex}
          onChange={scrub}
          aria-label="Scrub to a stop"
          aria-valuetext={`Stop ${safeIndex + 1} of ${stops.length}: ${current.title}`}
          style={{ ['--pct' as string]: `${pct}%` }}
        />
        <div className={s.labels}>
          <span className={s.current}>
            {safeIndex + 1}/{stops.length} · {current.title}
          </span>
          <span className={s.leg}>
            {formatKm(covered)} of {formatKm(cumulativeKm(stops))}
            {safeIndex > 0 && (
              <>
                {' '}
                · last leg +{formatKm(haversineKm(stops[safeIndex - 1], current))}
              </>
            )}
          </span>
        </div>
      </div>

      <span className={s.leg} aria-hidden="true">
        {formatKm(remaining)} to go
      </span>
    </div>
  )
}
