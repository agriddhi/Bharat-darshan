/* ============================================================
   ui/JourneyPage.tsx — the passport.

   WHAT CHANGED FROM v1 AND v2-AND-BEFORE
   This was a drawer. Now it is a page, which matters because the
   journey is the one feature where the *sequence* is the point: five
   stops with a leg distance between each and a total at the bottom.
   In a narrow panel that list scrolled and the total sat somewhere
   off-screen, so the reader could add stops without ever seeing what
   they were building.

   DISTANCES ARE LABELLED APPROXIMATE IN THE DATA AND IN THE LABEL
   Haversine is a straight line over a sphere. Calling it "distance"
   without qualification invites someone to read it as a drive time,
   so every figure on this page says what it is. That is v1's
   labelling carried over unchanged.

   TWO SEPARATE LISTS, KEPT SEPARATE
   `journey` (the ordered route) and `visited` (what you have marked
   as seen) are different claims and are shown in different places.
   Four of the five badges read `visited`; only one reads the
   journey. Collapsing them would silently change which badges earn.
   ============================================================ */

import { useState } from 'react'
import s from './Pages.module.css'
import { useStore, JOURNEY_MAX } from '../state/store'
import {
  resolveJourney,
  cumulativeKm,
  formatKm,
  estimatedHours,
  earnedBadges,
  BADGES,
} from '../state/journey'
import { href } from '../router'

const HEAD_PHOTO = 'media/golden-temple.jpg'

export function JourneyPage() {
  const journey = useStore((st) => st.journey)
  const visited = useStore((st) => st.visited)
  const removeFromJourney = useStore((st) => st.removeFromJourney)
  const clearJourney = useStore((st) => st.clearJourney)

  // Two-step clear. An ordered route is expensive to rebuild and
  // cheap to destroy, so it should take two deliberate clicks.
  const [confirming, setConfirming] = useState(false)

  const stops = resolveJourney(journey)
  const visitedSites = resolveJourney(visited)
  const totalKm = cumulativeKm(stops)
  const earned = earnedBadges(visitedSites, journey)

  return (
    <div className={s.page}>
      {/* ================= HEADER ================= */}
      <header className={s.head}>
        <img className={s.headPhoto} src={HEAD_PHOTO} alt="" aria-hidden="true" />
        <div className={s.headScrim} />
        <div className={s.headInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>Your passport</span>
          </div>
          <h1 className={s.title}>
            {stops.length} of {JOURNEY_MAX} stops,
            <span className={s.titleEm}>
              {earned.length} of {BADGES.length} badges.
            </span>
          </h1>
          <p className={s.lede}>
            Build a route of up to five monuments and the archive will work out how far
            apart they are. Badges are earned by marking sites as visited — which is a
            different thing from putting them on a route, and the two are counted
            separately for that reason.
          </p>
        </div>
      </header>

      <div className={s.wrap}>
        {/* ================= THE ROUTE ================= */}
        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>Your route</h2>
            <span className={s.sectionNote}>
              {stops.length} / {JOURNEY_MAX} stops
            </span>
          </div>

          {stops.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyMark} aria-hidden="true">
                ⌖
              </div>
              <h3 className={s.emptyTitle}>No stops yet</h3>
              <p className={s.emptyBody}>
                Open any site and choose <strong>“Add to journey”</strong>. Five is the
                maximum — a route you cannot hold in your head is not a route.
              </p>
              <a className={s.btnPrimary} href={href({ name: 'sites' })} style={{ padding: '11px 24px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', display: 'inline-flex' }}>
                Browse the archive
              </a>
            </div>
          ) : (
            <>
              <ol className={s.stops}>
                {stops.map((site, i) => {
                  const photo = site.media.find((m) => m.kind === 'photo') ?? site.media[0]
                  const leg = i > 0 ? cumulativeKm([stops[i - 1], site]) : null

                  return (
                    <li key={site.id} className={s.stop}>
                      <span className={s.stopNum} aria-label={`Stop ${i + 1}`}>
                        {i + 1}
                      </span>

                      {photo ? (
                        <img className={s.stopThumb} src={photo.src} alt="" loading="lazy" />
                      ) : (
                        <span className={s.stopThumb} />
                      )}

                      <div className={s.stopBody}>
                        <a
                          className={s.stopTitle}
                          href={href({ name: 'site', id: site.id })}
                        >
                          {site.title}
                        </a>
                        <div className={s.stopMeta}>
                          {site.state} · {site.region} · {site.era}
                        </div>
                        {leg !== null && (
                          <div className={s.stopLeg}>
                            ← {formatKm(leg)} from the previous stop (approx. straight
                            line)
                          </div>
                        )}
                      </div>

                      <button
                        className={s.stopRemove}
                        onClick={() => removeFromJourney(site.id)}
                        aria-label={`Remove ${site.title} from the route`}
                        title="Remove from route"
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ol>

              {/* ---- totals ---- */}
              <div className={s.totals}>
                <div className={s.total}>
                  <div className={s.totalLabel}>Total length</div>
                  <div className={s.totalValue}>{formatKm(totalKm)}</div>
                  <div className={s.totalNote}>
                    Approx. straight-line distance across all legs. Not a road distance.
                  </div>
                </div>

                <div className={s.total}>
                  <div className={s.totalLabel}>At a relaxed pace</div>
                  <div className={s.totalValue}>
                    ~{estimatedHours(totalKm).toFixed(1)} h
                  </div>
                  <div className={s.totalNote}>
                    A rough estimate at 55 km/h, offered only as a sense of scale.
                  </div>
                </div>

                <div className={s.total}>
                  <div className={s.totalLabel}>Stops remaining</div>
                  <div className={s.totalValue}>
                    {JOURNEY_MAX - stops.length}
                  </div>
                  <div className={s.totalNote}>
                    {stops.length >= JOURNEY_MAX
                      ? 'The route is full. Remove a stop to add another.'
                      : 'Add another monument from any site page.'}
                  </div>
                </div>
              </div>

              {/* ---- clear, two-step ---- */}
              <div className={s.btnRow} style={{ marginTop: 24 }}>
                {confirming ? (
                  <>
                    <button className={s.btnDanger} onClick={() => { clearJourney(); setConfirming(false) }}>
                      Yes, clear all {stops.length} stops
                    </button>
                    <button className={s.btnGhost} onClick={() => setConfirming(false)}>
                      Keep the route
                    </button>
                  </>
                ) : (
                  <button className={s.btnGhost} onClick={() => setConfirming(true)}>
                    Clear route
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {/* ================= BADGES ================= */}
        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>Badges</h2>
            <span className={s.sectionNote}>
              {earned.length} earned · {visitedSites.length} sites visited
            </span>
          </div>

          <div className={s.badges}>
            {BADGES.map((b) => {
              const on = earned.some((e) => e.id === b.id)
              return (
                <div key={b.id} className={`${s.badgeCard} ${on ? s.badgeCardOn : ''}`}>
                  <span className={s.badgeIcon} aria-hidden="true">
                    {on ? '✓' : '○'}
                  </span>
                  <div>
                    <div className={s.badgeName}>{b.en}</div>
                    <div className={s.badgeHint}>
                      {on ? `Earned — ${b.hintEn.replace(/^(Mark|Fill)/, 'You did: $1')}` : b.hintEn}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ================= VISITED ================= */}
        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>Marked as visited</h2>
            <span className={s.sectionNote}>{visitedSites.length} sites</span>
          </div>

          {visitedSites.length === 0 ? (
            <p className={s.body}>
              Nothing marked yet. “Visited” is separate from the route — it is the
              archive's record of what you have actually seen, and four of the five
              badges are counted against it rather than against your route.
            </p>
          ) : (
            <div className={s.btnRow}>
              {visitedSites.map((site) => (
                <a
                  key={site.id}
                  className={s.btnGhost}
                  href={href({ name: 'site', id: site.id })}
                  style={{ padding: '9px 17px', fontSize: '0.8rem' }}
                >
                  ✓ {site.title}
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
