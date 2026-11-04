/* ============================================================
   ui/FolklorePage.tsx — all folklore notes in one scroll.

   Every site that has a verified folkloreNote gets a card here.
   Nothing is invented — all text comes from sites.json, which
   cites Wikipedia for each entry.
   ============================================================ */

import s from './FolklorePage.module.css'
import { SITES } from '../data/sites'
import { useT, useLang, regionLabel, typeLabel } from '../i18n'

export function FolklorePage() {
  const lang = useLang()
  const t = useT()
  const items = SITES.filter((s2) => s2.folkloreNote)

  return (
    <main className={s.page}>
      <div className={s.wrap}>
        <h1 className={s.pageTitle}>{t('folklore')}</h1>
        <p className={s.pageSubtitle}>
          {items.length} of {SITES.length} sites carry verified folklore
          and nearby attractions. Each entry is sourced.
        </p>

        <div className={s.grid}>
          {items.map((site) => (
            <article key={site.id} className={s.card}>
              <h3 className={s.cardTitle}>
                <a href={`#/site/${site.id}`} className={s.linkBlock}>
                  {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                </a>
              </h3>
              <div className={s.cardMeta}>
                <span className={s.metaTag}>{regionLabel(site.region, lang)}</span>
                <span className={s.metaTag}>{site.city}</span>
              </div>
              <p className={s.cardBody}>{site.folkloreNote}</p>
              <a href={`#/site/${site.id}`} className={s.cardLink}>
                {t('openRecord')} →
              </a>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
