/* ============================================================
   ui/FolklorePage.tsx — folklore and nearby, long-form prose.

   Uses Editorial.module.css so it reads as the archive's
   narrative register: standfirst, stages, hairlines —
   the same visual family as StoryPage but with folklore
   as the subject rather than the monument's own stages.
   ============================================================ */

import s from './Editorial.module.css'
import { useLang } from '../i18n'
import { SITES } from '../data/sites'

export function FolklorePage() {
  const lang = useLang()

  const items = SITES.filter((site) => site.folkloreNote)
  const heroSite = items[0]
  const heroPhoto = heroSite?.media?.find((m: any) => m.kind === 'photo') ?? heroSite?.media?.[0]

  return (
    <main className={s.page}>
      {/* ================= HEAD ================= */}
      <header className={s.articleHead}>
        {heroPhoto && (
          <img className={s.articlePhoto} src={heroPhoto.src} alt="" aria-hidden="true" />
        )}
        <div className={s.articleHeadScrim} />
        <div className={s.articleHeadInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>Folklore & Nearby Attractions</span>
          </div>
          <h1 className={s.articleTitle}>Folklore and the Land Around It</h1>
          <div className={s.articleSub}>
            Verified local legends and nearby attractions for {items.length} sites —
            each entry cited from its source.
          </div>
          <div className={s.articleMeta}>
            <span>All sites</span>
            <span aria-hidden="true">·</span>
            <span>Sourced from Wikipedia</span>
          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className={s.body}>
        <p className={s.standfirst}>
          Every monument in this archive stands in a landscape that carries its own stories —
          legends that predate the building, myths that grew around it, and places nearby that share
          the same air. The folklore notes below are drawn from verified sources, primarily Wikipedia,
          and are presented here as long-form prose: each site receives a full narrative treatment,
          with the legend first and the nearby attractions that share its region described in detail.
          Where a legend could not be verified, the site is omitted — no narrative is invented to
          fill a gap.
        </p>

        {items.map((site, i) => {
          const note = site.folkloreNote || ''
          // Split at "Nearby," or "Nearby and" if present, otherwise treat entire note as folklore
          const splitPoint = note.match(/Nearby[,\s]/i) ? note.match(/Nearby[,\s]/i)?.index || -1 : -1
          const folkloreText = splitPoint > 0 ? note.slice(0, splitPoint).trim() : note
          const nearbyText = splitPoint > 0 ? note.slice(splitPoint + 1).trim() : null

          return (
            <section key={site.id} className={s.stage} id={`folklore-${site.id}`}>
              <div className={s.stageNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
              <h2 className={s.stageTitle}>
                <a href={`#/site/${site.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                </a>
                <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.6, marginTop: 4 }}>
                  {site.city}, {site.region}
                </span>
              </h2>

              <div className={s.stageBody}>
                <p>{folkloreText}</p>
                {nearbyText && (
                  <p>
                    <strong style={{ color: 'var(--ochre, #DEA044)' }}>Nearby and local — </strong>
                    {nearbyText}
                  </p>
                )}
              </div>

              <div className={s.articleFoot}>
                <a href={`#/site/${site.id}`} className={s.chip}>
                  Open the record →
                </a>
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
