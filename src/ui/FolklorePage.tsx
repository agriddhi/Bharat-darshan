/* ============================================================
   ui/FolklorePage.tsx — folklore index as cards, like the image.

   Each card: hero photo, region chip, title, short teaser,
   meta line (stages / source), prominent READ button.
   Clicking READ opens the full folklore detail page.
   ============================================================ */

import s from './Editorial.module.css'
import { useLang, regionLabel } from '../i18n'
import { SITES } from '../data/sites'

export function FolklorePage() {
  const lang = useLang()
  const items = SITES.filter((site) => site.folkloreNote)

  return (
    <main className={s.page}>
      {/* ================= HEAD ================= */}
      <header className={s.head}>
        <div className={s.headInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>Folklore & Nearby Attractions</span>
          </div>
          <h1 className={s.title}>Folklore and the Land Around It</h1>
          <p className={s.lede}>
            Every monument stands in a landscape that carries its own stories.
            Below are verified folklore notes and nearby attractions for
            {items.length} sites — each citing its source.
          </p>
          <div className={s.articleMeta} style={{ marginTop: 8 }}>
            <span>{items.length} sites</span>
            <span aria-hidden="true">·</span>
            <span>Sourced from Wikipedia</span>
          </div>
        </div>
      </header>

      {/* ================= CARDS ================= */}
      <div className={s.grid}>
        {items.map((site) => {
          const note = site.folkloreNote || ''
          const splitPoint = note.match(/Nearby[,\s]/i)
            ? note.match(/Nearby[,\s]/i)?.index ?? -1
            : -1
          const teaser = splitPoint > 0 ? note.slice(0, splitPoint).trim() : note
          const photo = site.media?.find((m) => m.kind === 'photo') ?? site.media?.[0]

          return (
            <a
              key={site.id}
              href={`#/folklore/${site.id}`}
              className={s.card}
              role="button"
              aria-label={`Read folklore for ${site.title}`}
            >
              {photo && (
                <div className={s.cardPhotoWrap}>
                  <img className={s.cardPhoto} src={photo.src} alt="" aria-hidden="true" />
                  <span className={s.cardRegion}>{regionLabel(site.region, lang)}</span>
                </div>
              )}
              <div className={s.cardBody}>
                <h3 className={s.cardTitle}>
                  {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                </h3>
                <p className={s.cardTeaser}>{teaser}</p>
                <div className={s.cardFoot}>
                  <span className={s.cardCount}>READ →</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                    {site.city}
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </main>
  )
}
