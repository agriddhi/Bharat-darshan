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
import { useT, useLang, regionLabel, eraLabel } from '../i18n'
import { href } from '../router'

const HEAD_PHOTO = 'media/golden-temple.jpg'

export function JourneyPage() {
  const journey = useStore((st) => st.journey)
  const visited = useStore((st) => st.visited)
  const removeFromJourney = useStore((st) => st.removeFromJourney)
  const clearJourney = useStore((st) => st.clearJourney)

  const t = useT()
  const lang = useLang()

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
            <span>{t('journeyEyebrow')}</span>
          </div>
          <h1 className={s.title}>
            {stops.length} {t('of')} {JOURNEY_MAX} {t('journeyStops')},{' '}
            <span className={s.titleEm}>
              {earned.length} {t('of')} {BADGES.length} {t('journeyBadges')}
            </span>
          </h1>
          <p className={s.lede}>{t('journeyLede')}</p>
        </div>
      </header>

      <div className={s.wrap}>
        {/* ================= THE ROUTE ================= */}
        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>{t('yourRoute')}</h2>
            <span className={s.sectionNote}>
              {stops.length} / {JOURNEY_MAX} {t('journeyStops')}
            </span>
          </div>

          {stops.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyMark} aria-hidden="true">
                ⌖
              </div>
              <h3 className={s.emptyTitle}>{t('noStopsYet')}</h3>
              <p className={s.emptyBody}>
                {t('noStops1')} <strong>{t('addJourneyQuote')}</strong>
                {t('noStops2')}
              </p>
              <a className={s.btnPrimary} href={href({ name: 'sites' })} style={{ padding: '11px 24px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', display: 'inline-flex' }}>
                {t('browseArchive')}
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
                      <span className={s.stopNum} aria-label={`${t('stopWord')} ${i + 1}`}>
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
                          {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                        </a>
                        <div className={s.stopMeta}>
                          {site.state} · {regionLabel(site.region, lang)} ·{' '}
                          {eraLabel(site.era, lang)}
                        </div>
                        {leg !== null && (
                          <div className={s.stopLeg}>
                            ← {formatKm(leg)} {t('fromPrev')}
                          </div>
                        )}
                      </div>

                      <button
                        className={s.stopRemove}
                        onClick={() => removeFromJourney(site.id)}
                        aria-label={`${t('removeFromRoute')}: ${site.title}`}
                        title={t('removeFromRoute')}
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
                  <div className={s.totalLabel}>{t('totalLength')}</div>
                  <div className={s.totalValue}>{formatKm(totalKm)}</div>
                  <div className={s.totalNote}>{t('totalNote')}</div>
                </div>

                <div className={s.total}>
                  <div className={s.totalLabel}>{t('relaxedPace')}</div>
                  <div className={s.totalValue}>
                    ~{estimatedHours(totalKm).toFixed(1)} h
                  </div>
                  <div className={s.totalNote}>{t('paceNote')}</div>
                </div>

                <div className={s.total}>
                  <div className={s.totalLabel}>{t('stopsRemaining')}</div>
                  <div className={s.totalValue}>
                    {JOURNEY_MAX - stops.length}
                  </div>
                  <div className={s.totalNote}>
                    {stops.length >= JOURNEY_MAX ? t('routeFull') : t('addAnother')}
                  </div>
                </div>
              </div>

              {/* ---- clear, two-step ---- */}
              <div className={s.btnRow} style={{ marginTop: 24 }}>
                {confirming ? (
                  <>
                    <button className={s.btnDanger} onClick={() => { clearJourney(); setConfirming(false) }}>
                      {t('yesClearAll')} {stops.length} {t('journeyStops')}
                    </button>
                    <button className={s.btnGhost} onClick={() => setConfirming(false)}>
                      {t('keepRoute')}
                    </button>
                  </>
                ) : (
                  <button className={s.btnGhost} onClick={() => setConfirming(true)}>
                    {t('clearRoute')}
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {/* ================= BADGES ================= */}
        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>{t('badgesTitle')}</h2>
            <span className={s.sectionNote}>
              {earned.length} {t('earned')} · {visitedSites.length} {t('sitesVisited')}
            </span>
          </div>

          <div className={s.badges}>
            {BADGES.map((b) => {
              const on = earned.some((e) => e.id === b.id)
              const name = lang === 'hi' ? b.hi : b.en
              const hint = lang === 'hi' ? b.hintHi : b.hintEn
              return (
                <div key={b.id} className={`${s.badgeCard} ${on ? s.badgeCardOn : ''}`}>
                  <span className={s.badgeIcon} aria-hidden="true">
                    {on ? '✓' : '○'}
                  </span>
                  <div>
                    <div className={s.badgeName}>{name}</div>
                    <div className={s.badgeHint}>
                      {on
                        ? lang === 'hi'
                          ? `${t('earnedDash')} ${hint}`
                          : `Earned — ${hint.replace(/^(Mark|Fill)/, 'You did: $1')}`
                        : hint}
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
            <h2 className={s.sectionTitle}>{t('markedVisited')}</h2>
            <span className={s.sectionNote}>
              {visitedSites.length} {t('sitesWordCap')}
            </span>
          </div>

          {visitedSites.length === 0 ? (
            <p className={s.body}>{t('nothingMarked')}</p>
          ) : (
            <div className={s.btnRow}>
              {visitedSites.map((site) => (
                <a
                  key={site.id}
                  className={s.btnGhost}
                  href={href({ name: 'site', id: site.id })}
                  style={{ padding: '9px 17px', fontSize: '0.8rem' }}
                >
                  ✓ {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
