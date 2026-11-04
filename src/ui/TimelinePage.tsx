/* ============================================================
   ui/TimelinePage.tsx — the archive in chronological order.

   WHAT THIS REPLACED
   The atlas. It showed the same twenty-five sites as the archive
   index, tilted a few degrees. Two grids, one dataset, and the
   depth was too shallow to read as depth — "what is 3D here" was
   the fair question. The tiles also collided, because CSS depth
   pushes a rendered box outside the grid cell that contains it.

   This page shows different information. The index answers "what
   is here"; this answers "when". Nothing here appears on the index
   in this order, and the order is the whole point.

   WHAT IT DELIBERATELY DOES NOT CLAIM
   The site record has an `era` field and no date field. So the
   timeline is positioned by era — ancient, medieval, mughal,
   colonial — and that is the only ordering claim it makes. It is
   true of all twenty-five sites and needs nothing the data lacks.

   A construction year is shown on a card only where one genuinely
   exists in the record (twelve of the twenty-five), copied verbatim
   from the source. UNESCO listing dates, excavations and
   rediscoveries are never used: "UNESCO listed: 1983" on a stupa
   from the third century BCE would date the monument to the wrong
   millennium. The extraction rule and its blacklist live in
   data/timeline.ts so this component cannot get it wrong by
   accident.

   THE BACKGROUND MOVES WITH TIME
   One fixed wash layer per era, cross-faded by an observer as each
   band enters the viewport. It is the only thing on this page that
   changes without being asked, so it is slow (900ms) and faint
   (0.22) — a wash, not a colour swap. Ochre is never among the
   washes: it is the interactive accent, and a full-bleed ochre
   background would destroy the one signal telling a reader what is
   clickable.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import s from './Timeline.module.css'
import { SITES } from '../data/sites'
import {
  buildTimeline,
  datedCount,
  ERAS,
  type Era,
} from '../data/timeline'
import { useT, useLang, eraLabel, eraNote, regionLabel, typeLabel } from '../i18n'
import { href, type Route } from '../router'

/** Opens the page with a photograph rather than with empty dark. */
const HEAD_PHOTO = 'media/hampi.jpg'

const BANDS = buildTimeline(SITES)
const DATED = datedCount(SITES)

/**
 * One wash layer per era, in chronological order, so the stack reads
 * ancient at the bottom through to colonial at the top. They are all
 * rendered at once and only the active one is visible — swapping a
 * single element's colour would pop; cross-fading two does not.
 */
const WASHES: { era: Era; colour: string }[] = [
  { era: 'ancient', colour: 'var(--era-ancient)' },
  { era: 'medieval', colour: 'var(--era-medieval)' },
  { era: 'mughal', colour: 'var(--era-mughal)' },
  { era: 'colonial', colour: 'var(--era-colonial)' },
]

export function TimelinePage() {
  const [active, setActive] = useState<Era>(BANDS[0]?.era ?? 'ancient')
  const observer = useRef<IntersectionObserver | null>(null)
  const t = useT()
  const lang = useLang()

  /* ----------------------------------------------------------
     Watch which band is nearest the top of the viewport.
     `rootMargin` pulls the trigger line down to just under the
     sticky jump bar, so a band counts as active once its heading
     has cleared that bar rather than the moment it appears at the
     very bottom of the screen.

     The observer is torn down on unmount. Without that the page
     would keep observing DOM nodes that React has already removed.
     ---------------------------------------------------------- */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        // Only the entry that has most recently become active wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id.replace('era-', '') as Era)
      },
      { rootMargin: '-130px 0px -55% 0px', threshold: [0, 0.25, 0.6] },
    )

    for (const band of BANDS) {
      const el = document.getElementById(`era-${band.era}`)
      if (el) io.observe(el)
    }
    observer.current = io

    return () => {
      io.disconnect()
      observer.current = null
    }
  }, [])

  /** Scroll to a band and mark it active immediately, so the click
   *  feels answered even if the observer has not caught up yet. */
  function jump(era: Era) {
    setActive(era)
    document
      .getElementById(`era-${era}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={s.page}>
      {/* ================= WASH ================= */}
      <div className={s.wash} aria-hidden="true">
        {WASHES.map((w) => (
          <div
            key={w.era}
            className={`${s.washLayer} ${active === w.era ? s.washOn : ''}`}
            style={{ ['--era' as string]: w.colour }}
          />
        ))}
      </div>

      {/* ================= HEADER ================= */}
      <header className={s.head}>
        <img className={s.headPhoto} src={HEAD_PHOTO} alt="" aria-hidden="true" />
        <div className={s.headScrim} />
        <div className={s.headInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>{t('timelineEyebrow')}</span>
          </div>
          <h1 className={s.title}>
            {t('timelineTitle1')}
            <span className={s.titleEm}>{t('timelineTitle2')}</span>
          </h1>
          <p className={s.lede}>{t('timelineLede')}</p>

          {/* Shown, not buried. A reader who assumed every card was dated
              would draw the wrong conclusion from the twelve that are. */}
          <div className={s.method}>
            <span className={s.methodMark} aria-hidden="true">
              ·
            </span>
            <span>
              {t('methodHead')}{' '}
              <strong>
                {DATED} {t('of')} {SITES.length}
              </strong>{' '}
              {t('methodTail')}
            </span>
          </div>
        </div>
      </header>

      {/* ================= JUMP BAR ================= */}
      <nav className={s.jump} aria-label={t('jumpTo')}>
        <span className={s.jumpLabel}>{t('jumpTo')}</span>
        {BANDS.map((band) => (
          <button
            key={band.era}
            type="button"
            className={`${s.chip} ${active === band.era ? s.chipOn : ''}`}
            onClick={() => jump(band.era)}
            style={{ ['--era' as string]: `var(--era-${band.era})` }}
            aria-current={active === band.era ? 'true' : undefined}
          >
            <span className={s.chipDot} aria-hidden="true" />
            {eraLabel(band.era, lang)}
            <span className={s.chipCount}>{band.sites.length}</span>
          </button>
        ))}
      </nav>

      {/* ================= BANDS ================= */}
      <div className={s.bands}>
        <div className={s.spine} aria-hidden="true" />

        {BANDS.map((band) => (
          <section
            key={band.era}
            id={`era-${band.era}`}
            className={s.band}
            style={{ ['--era' as string]: `var(--era-${band.era})` }}
            aria-labelledby={`label-${band.era}`}
          >
            <div className={s.bandHead}>
              <span className={s.node} aria-hidden="true">
                <span className={s.nodeDot} />
              </span>
              <div className={s.bandText}>
                <h2 className={s.eraLabel} id={`label-${band.era}`}>
                  <span className={s.eraName}>{eraLabel(band.era, lang)}</span>
                </h2>
                <p className={s.eraNote}>{eraNote(band.era, lang)}</p>
                <div className={s.eraMeta}>
                  <span>
                    {band.sites.length} {t('sitesWordCap')}
                  </span>
                  <span>
                    {band.sites.filter((x) => x.year !== null).length} {t('dated')}
                  </span>
                </div>
              </div>
            </div>

            <div className={s.row}>
              {band.sites.map(({ site, built }) => {
                const photo =
                  site.media.find((m) => m.kind === 'photo') ?? site.media[0]
                const route: Route = { name: 'site', id: site.id }

                return (
                  <a key={site.id} className={s.card} href={href(route)}>
                    {/* A card with no recorded date says so rather than
                        showing a blank — an empty chip would read as a
                        bug, this reads as a gap in the record, which is
                        what it actually is. */}
                    <span
                      className={`${s.year} ${built ? '' : s.yearNone}`}
                      title={built ?? t('notDated')}
                    >
                      {built ?? t('notDated')}
                    </span>

                    <div className={s.photoWrap}>
                      {photo && (
                        <img
                          className={s.photo}
                          src={photo.src}
                          alt={site.title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            // A missing photograph must not leave a broken-image
                            // glyph on the timeline — hide the frame and let the
                            // dark ground stand in for it.
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className={s.photoScrim} />
                    </div>

                    <div className={s.body}>
                      <div className={s.regionTag}>{regionLabel(site.region, lang)}</div>
                      <h3 className={s.cardTitle}>{site.title}</h3>
                      <div className={s.cardMeta}>
                        <span>{site.state}</span>
                        <span className={s.cardDot} aria-hidden="true" />
                        <span>{typeLabel(site.type, lang)}</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
