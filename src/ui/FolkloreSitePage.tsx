/* ============================================================
   ui/FolkloreSitePage.tsx — single-site folklore, long-form.

   A dedicated page per site (e.g. #/folklore/taj-mahal) so
   the folklore receives the same narrative treatment as the
   story pages: standfirst, stage number, hairline, prose.
   ============================================================ */

import s from './Editorial.module.css'
import { useLang, regionLabel } from '../i18n'
import { getSite } from '../data/sites'

interface Props {
  id: string
}

export function FolkloreSitePage({ id }: Props) {
  const site = getSite(id)
  const lang = useLang()

  if (!site || !site.folkloreNote) {
    return (
      <main className={s.page}>
        <div className={s.body}>
          <h2 className={s.stageTitle}>No folklore record for “{id}”</h2>
          <p className={s.stageBody}>
            This site has no verified folklore note in the archive.
          </p>
        </div>
      </main>
    )
  }

  const note = site.folkloreNote
  const splitPoint = note.match(/Nearby[,\s]/i)
    ? note.match(/Nearby[,\s]/i)?.index ?? -1
    : -1
  const folkloreText = splitPoint > 0 ? note.slice(0, splitPoint).trim() : note
  const nearbyText = splitPoint > 0 ? note.slice(splitPoint + 1).trim() : null

  const photo = site.media?.find((m) => m.kind === 'photo') ?? site.media?.[0]

  return (
    <main className={s.page}>
      <header className={s.articleHead}>
        {photo && (
          <img className={s.articlePhoto} src={photo.src} alt="" aria-hidden="true" />
        )}
        <div className={s.articleHeadScrim} />
        <div className={s.articleHeadInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>Folklore & Nearby Attractions</span>
          </div>
          <h1 className={s.articleTitle}>
            {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
          </h1>
          <div className={s.articleSub}>
            {regionLabel(site.region, lang)} · {site.city} · {site.type}
          </div>
          <div className={s.articleMeta}>
            <span>Verified folklore note</span>
            <span aria-hidden="true">·</span>
            <span>Sourced from Wikipedia</span>
          </div>
        </div>
      </header>

      <div className={s.body}>
        <p className={s.standfirst}>{folkloreText}</p>

        <section className={s.stage}>
          <div className={s.stageNum} aria-hidden="true">01</div>
          <h2 className={s.stageTitle}>The Legend</h2>
          <div className={s.stageBody}>
            <p>{folkloreText}</p>
          </div>
        </section>

        {nearbyText && (
          <section className={s.stage}>
            <div className={s.stageNum} aria-hidden="true">02</div>
            <h2 className={s.stageTitle}>Nearby and Local</h2>
            <div className={s.stageBody}>
              <p>
                <strong style={{ color: 'var(--ochre, #DEA044)' }}>Nearby and local attractions — </strong>
                {nearbyText}
              </p>
            </div>
          </section>
        )}

        <div className={s.articleFoot}>
          <a href="#/folklore" className={`${s.chip} ${s.chipOn}`}>
            All folklore entries →
          </a>
          <a href={`#/site/${site.id}`} className={s.chip}>
            Open full site record →
          </a>
        </div>
      </div>
    </main>
  )
}
