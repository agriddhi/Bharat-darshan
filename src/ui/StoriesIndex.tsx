/* ============================================================
   ui/StoriesIndex.tsx — the editorial shelf.

   WHAT THIS SECTION IS FOR
   The archive index answers "what is here and where". This answers
   "what happened there". Both are made of the same 30,000 words of
   five-part narrative that lived in the data file the whole time and
   was previously rendered nowhere at all — it was written into a
   side panel that no reader could fit it into.

   NOTHING IS WRITTEN HERE
   The teaser on each card is the opening sentence of that site's
   first story stage, taken verbatim. A hand-written blurb would be
   a second voice describing content it might overstate, and in an
   archive whose entire claim is that every statement is sourced,
   that is the one thing worth being strict about.

   ONE FILTER, AND IT IS REGION
   Region is the only axis a reader browsing narratives actually
   thinks in — era and type are for looking something up, not for
   wandering. A search box here would duplicate the archive index.
   ============================================================ */

import { useMemo, useState } from 'react'
import s from './Editorial.module.css'
import { SITES, AVAILABLE_REGIONS } from '../data/sites'
import { useT, useLang, regionLabel, typeLabel } from '../i18n'
import { href } from '../router'
import type { Site } from '../data/types'

/** A different photograph from the archive index, so the two pages do
 *  not open on the same image. */
const HEAD_PHOTO = 'media/rani-ki-vav.jpg'

interface StoryEntry {
  site: Site
  teaser: string
  /** Same opening sentence, in Hindi, where the record has one. */
  teaserHi: string | null
  stages: number
}

/** Build the shelf from the data: only sites that actually have one. */
function buildShelf(): StoryEntry[] {
  return SITES.filter((site) => (site.story?.length ?? 0) > 0).map((site) => {
    const first = site.story![0]
    return {
      site,
      // Verbatim opening of the first stage. Trimmed only for display
      // length, never reworded. Both languages are carried because the
      // shelf is built once and read under either setting — computing
      // it per-language would mean rebuilding the whole list on every
      // toggle press for the sake of one sentence.
      teaser: first.body,
      teaserHi: first.bodyHi ?? null,
      stages: site.story!.length,
    }
  })
}

export function StoriesIndex() {
  const shelf = useMemo(buildShelf, [])
  const [region, setRegion] = useState<string | null>(null)
  const t = useT()
  const lang = useLang()

  const shown = region ? shelf.filter((e) => e.site.region === region) : shelf

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of shelf) map.set(e.site.region, (map.get(e.site.region) ?? 0) + 1)
    return map
  }, [shelf])

  return (
    <div className={s.page}>
      {/* ================= HEADER ================= */}
      <header className={s.head}>
        <img className={s.headPhoto} src={HEAD_PHOTO} alt="" aria-hidden="true" />
        <div className={s.headScrim} />
        <div className={s.headInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>{t('storiesEyebrow')}</span>
          </div>
          <h1 className={s.title}>
            {t('storiesTitle1')}
            <span className={s.titleEm}>{t('storiesTitle2')}</span>
          </h1>
          <p className={s.lede}>{t('storiesLede')}</p>
        </div>
      </header>

      {/* ================= REGION CHIPS ================= */}
      <div className={s.chips} role="group" aria-label={t('storiesByRegion')}>
        <button
          className={`${s.chip} ${region === null ? s.chipOn : ''}`}
          aria-pressed={region === null}
          onClick={() => setRegion(null)}
        >
          {t('allRegions')}
          <span className={s.chipCount}>{shelf.length}</span>
        </button>

        {AVAILABLE_REGIONS.filter((r) => counts.has(r)).map((r) => (
          <button
            key={r}
            className={`${s.chip} ${region === r ? s.chipOn : ''}`}
            aria-pressed={region === r}
            onClick={() => setRegion(region === r ? null : r)}
          >
            {regionLabel(r, lang)}
            <span className={s.chipCount}>{counts.get(r) ?? 0}</span>
          </button>
        ))}
      </div>

      {/* ================= GRID ================= */}
      {shown.length === 0 ? (
        <div className={s.empty}>
          <h2 className={s.emptyTitle}>{t('noStoriesTitle')}</h2>
          <p className={s.emptyBody}>
            {t('noStoriesBody')} {region ? regionLabel(region, lang) : ''}
          </p>
        </div>
      ) : (
        <div className={s.grid}>
          {shown.map(({ site, teaser, teaserHi, stages }) => {
            const photo = site.media.find((m) => m.kind === 'photo') ?? site.media[0]

            return (
              <a key={site.id} className={s.card} href={href({ name: 'story', id: site.id })}>
                <div className={s.cardPhotoWrap}>
                  {photo && (
                    <img
                      className={s.cardPhoto}
                      src={photo.src}
                      alt={site.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div className={s.cardPhotoScrim} />
                  <span className={s.cardRegion}>{regionLabel(site.region, lang)}</span>
                </div>

                <div className={s.cardBody}>
                  <h2 className={s.cardTitle}>
                    {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                  </h2>
                  <p className={s.cardTeaser}>
                    {lang === 'hi' && teaserHi ? teaserHi : teaser}
                  </p>

                  <div className={s.cardFoot}>
                    <span className={s.cardCount}>
                      {stages} {t('stages')} · {typeLabel(site.type, lang)}
                    </span>
                    <span className={s.cardRead}>
                      {t('readStory')} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
