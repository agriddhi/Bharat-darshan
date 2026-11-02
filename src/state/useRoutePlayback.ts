/* ============================================================
   state/useRoutePlayback.ts — playing a journey back.

   The route is a sequence of camera glides with a beat of dwell at
   each stop, so the user has time to read the story that opens with
   it. A glide with no pause would arrive and leave before anyone saw
   what they had been brought to.

   WHY TIMED RATHER THAN WAITING FOR A CAMERA CALLBACK
   The rig reports nothing back today, and teaching it to would mean a
   second channel for the same conversation. The glide duration is a
   constant we own (DUR.glide), so waiting that long plus a dwell is
   exactly as accurate as a callback would be — and it degrades
   gracefully: if a user grabs the canvas mid-glide and aborts the
   camera move, playback still advances on schedule rather than
   hanging forever waiting for an arrival that will not be reported.
   ============================================================ */

import { useEffect, useMemo } from 'react'
import { useStore } from './store'
import { useCamera, DUR } from './camera'
import { resolveJourney } from './journey'

/** How long each stop is held after the camera settles. */
const DWELL_MS = 1100

export function useRoutePlayback() {
  const playing = useStore((s) => s.playing)
  const playIndex = useStore((s) => s.playIndex)
  const journey = useStore((s) => s.journey)
  const setPlaying = useStore((s) => s.setPlaying)
  const setPlayIndex = useStore((s) => s.setPlayIndex)
  const select = useStore((s) => s.select)
  const issue = useCamera((s) => s.issue)

  // Memoised on `journey`, not on a freshly-built array, or this effect
  // would re-fire on every render and restart the timer each time.
  const stops = useMemo(() => resolveJourney(journey), [journey])
  const stopsKey = stops.map((s) => s.id).join('|')

  useEffect(() => {
    if (!playing) return

    // The route vanished underneath playback (cleared, or a stop
    // removed). Stop rather than silently restarting from the top.
    if (stops.length < 2) {
      setPlaying(false)
      setPlayIndex(0)
      return
    }

    // Past the last stop — playback is done.
    if (playIndex >= stops.length) {
      setPlaying(false)
      setPlayIndex(0)
      return
    }

    const site = stops[playIndex]

    // Glide to this stop and open its story, so the panel and the
    // camera are always talking about the same monument.
    issue({ kind: 'glide', siteId: site.id, index: playIndex })
    select(site.id)

    const timer = window.setTimeout(
      () => {
        if (playIndex + 1 >= stops.length) {
          // Reached the end. The badge that completing a route earns —
          // India Atlas Explorer, all five stops — is derived from the
          // journey itself, so it is already awarded at this moment;
          // there is nothing extra to write.
          setPlaying(false)
          setPlayIndex(0)
        } else {
          setPlayIndex(playIndex + 1)
        }
      },
      (DUR.glide + DWELL_MS / 1000) * 1000
    )

    return () => window.clearTimeout(timer)
    // stopsKey stands in for `stops`: same identity, stable across
    // renders, and it changes exactly when the route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, playIndex, stopsKey])

  return { playing, playIndex, stops }
}
