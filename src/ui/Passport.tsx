/* ============================================================
   ui/Passport.tsx — the journey panel.

   WHAT IT SHOWS
   The route in order, the approximate straight-line total, the five
   badges from v1, a play control, and a way to clear.

   ABOUT THE DISTANCE
   It is labelled "approx." everywhere it appears. Haversine gives the
   distance between two points on a sphere; it says nothing about roads,
   borders, rivers or the fact that you cannot fly between two stepwells.
   v1 carried that label and so does this panel.
   ============================================================ */

import { useState } from 'react'
import s from './Passport.module.css'
import { getSite, titleCase } from '../data/sites'
import type { Site } from '../data/types'
import {
  resolveJourney,
  cumulativeKm,
  formatKm,
  haversineKm,
  BADGES,
  earnedBadges,
} from '../state/journey'
import { useStore, JOURNEY_MAX } from '../state/store'
import { useCamera } from '../state/camera'

interface Props {
  open: boolean
  onClose: () => void
}

export function Passport({ open, onClose }: Props) {
  const journey = useStore((st) => st.journey)
  const visited = useStore((st) => st.visited)
  const removeFromJourney = useStore((st) => st.removeFromJourney)
  const clearJourney = useStore((st) => st.clearJourney)
  const setPlaying = useStore((st) => st.setPlaying)
  const issue = useCamera((st) => st.issue)
  const select = useStore((st) => st.select)

  const [confirmClear, setConfirmClear] = useState(false)

  const stops = resolveJourney(journey)
  // A stored id whose site has since been removed from the data would
  // otherwise leak `undefined` into the badge tests and throw.
  const visitedSites = visited
    .map((id) => getSite(id))
    .filter((x): x is Site => !!x)
  const total = cumulativeKm(stops)
  const earned = earnedBadges(visitedSites, journey)

  const canPlay = stops.length >= 2

  const play = () => {
    if (!canPlay) return
    setPlaying(true)
    issue({ kind: 'glide', siteId: stops[0].id, index: 0 })
    onClose()
  }

  return (
    <>
      <div
        className={`${s.scrim} ${open ? s.scrimOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`${s.panel} ${open ? s.panelOpen : ''}`}
        role="dialog"
        aria-label="Your journey"
        aria-hidden={!open}
      >
        <div className={s.head}>
          <div className={s.headText}>
            <div className={s.kicker}>Passport</div>
            <h2 className={s.title}>Your journey</h2>
          </div>
          <button type="button" className={s.close} onClick={onClose} aria-label="Close journey">
            ✕
          </button>
        </div>

        <div className={s.body}>
          {/* ---- summary ---- */}
          <div className={s.summary}>
            <div className={s.stat}>
              <div className={s.statLabel}>Stops</div>
              <div className={s.statValue}>
                {stops.length} / {JOURNEY_MAX}
              </div>
              <div className={s.statNote}>Maximum {JOURNEY_MAX}</div>
            </div>
            <div className={s.stat}>
              <div className={s.statLabel}>Distance</div>
              <div className={s.statValue}>{formatKm(total)}</div>
              <div className={s.statNote}>Approx. straight line</div>
            </div>
          </div>

          {/* ---- ordered stops ---- */}
          <div className={s.sectionLabel}>Route in order</div>

          {stops.length === 0 ? (
            <div className={s.empty}>
              No stops yet. Open any site and press <strong>Add to journey</strong> —
              the route is drawn in the world as soon as you have two.
            </div>
          ) : (
            <ol className={s.stops}>
              {stops.map((site, i) => {
                const legKm = i > 0 ? haversineKm(stops[i - 1], site) : 0
                return (
                  <li key={site.id} className={s.stop}>
                    <span className={s.stopIndex}>{i + 1}</span>
                    <img className={s.stopThumb} src={site.media[0]?.src} alt="" loading="lazy" />
                    <div className={s.stopBody}>
                      <div className={s.stopName}>{site.title}</div>
                      <div className={s.stopMeta}>
                        {titleCase(site.type)} · {site.state}
                      </div>
                    </div>
                    {i > 0 && <div className={s.stopLeg}>+{formatKm(legKm)}</div>}
                    <button
                      type="button"
                      className={s.stopRemove}
                      aria-label={`Remove ${site.title} from journey`}
                      onClick={() => removeFromJourney(site.id)}
                    >
                      ✕
                    </button>
                  </li>
                )
              })}
            </ol>
          )}

          {/* ---- badges: the same five as v1 ---- */}
          <div className={s.sectionLabel}>Badges</div>
          <div className={s.badges}>
            {BADGES.map((b) => {
              const on = earned.some((e) => e.id === b.id)
              return (
                <div key={b.id} className={`${s.badge} ${on ? s.badgeOn : ''}`}>
                  <div className={s.badgeName}>{b.en}</div>
                  <div className={s.badgeHint}>{b.hintEn}</div>
                </div>
              )
            })}
          </div>

          {/* ---- actions ---- */}
          <div className={s.actions}>
            <button
              type="button"
              className={`${s.btn} ${s.btnPrimary} ${canPlay ? '' : s.off}`}
              disabled={!canPlay}
              onClick={play}
            >
              ▶ Play route
            </button>

            {!canPlay && (
              <div className={s.note}>
                Add at least two stops to play the route.
              </div>
            )}

            {journey.length > 0 && !confirmClear ? (
              <button
                type="button"
                className={`${s.btn} ${s.btnGhost}`}
                onClick={() => setConfirmClear(true)}
              >
                Clear journey
              </button>
            ) : confirmClear ? (
              <button
                type="button"
                className={`${s.btn} ${s.btnGhost}`}
                onClick={() => {
                  clearJourney()
                  setConfirmClear(false)
                }}
              >
                Tap again to confirm clearing {journey.length} stops
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  )
}

/** The floating opener. Always visible so the route is one click away. */
export function JourneyFab({ onOpen }: { onOpen: () => void }) {
  const journey = useStore((st) => st.journey)
  const visited = useStore((st) => st.visited)

  return (
    <button type="button" className={s.fab} onClick={onOpen} aria-label="Open journey passport">
      <span>Passport</span>
      <span className={s.fabCount}>{journey.length}</span>
      {visited.length > 0 && (
        <span className={s.stopMeta} style={{ fontWeight: 600 }}>
          · {visited.length} visited
        </span>
      )}
    </button>
  )
}
