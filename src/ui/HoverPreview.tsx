/* ============================================================
   ui/HoverPreview.tsx — the hover card.

   Shows a photo thumbnail, the title, the type and the era — exactly
   what the brief asks for and nothing more. Deliberately not the
   description: the preview's job is to confirm which marker you are
   pointing at, and a paragraph would push the card large enough to
   start covering the field you are trying to read.
   ============================================================ */

import s from './HoverPreview.module.css'
import { getSite, titleCase } from '../data/sites'
import { useStore } from '../state/store'

export function HoverPreview() {
  const hoveredId = useStore((st) => st.hoveredId)
  const site = getSite(hoveredId)

  return (
    <div className={`${s.card} ${site ? s.shown : ''}`} aria-hidden={!site}>
      {site && (
        <>
          <img
            className={s.thumb}
            src={site.media[0]?.src}
            alt=""
            // A hover is transient; a broken image here would flash an
            // icon for 200ms and be gone. Swallow the failure instead.
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden'
            }}
          />
          <div className={s.body}>
            <div className={s.name}>{site.title}</div>
            <div className={s.meta}>
              <span className={`${s.tag} ${s.tagAccent}`}>{titleCase(site.type)}</span>
              <span className={s.tag}>{titleCase(site.era)}</span>
            </div>
            <div className={s.state}>
              {site.city ? `${site.city}, ` : ''}
              {site.state}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
