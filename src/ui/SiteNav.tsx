/* ============================================================
   ui/SiteNav.tsx — the navigation shared by every inner page.

   WHY THIS EXISTS SEPARATELY FROM TopBar
   TopBar is a tool: six region selects, four era selects, a search
   box, a live counter. It belongs on the archive index and would be
   actively harmful on a story page, where the reader should be
   reading rather than filtering.

   So there are two bars, and they are used in different places on
   purpose. This one never changes size, never reflows, and carries
   no state at all — it reads the URL and paints a highlight. That
   makes it safe to sticky-position over any page without worrying
   about what it will do when the data changes underneath it.
   ============================================================ */

import { href, sectionOf, type Route } from '../router'
import { useT, useLang } from '../i18n'
import { useStore } from '../state/store'
import s from './SiteNav.module.css'

interface Props {
  route: Route
  /** Shown before the links when on a detail page. */
  back?: { label: string; to: Route }
}

/* Labels come from i18n rather than being literals here, so the nav
   is the one place a reader can flip the whole app's language and
   see every label change under them. */
const LINKS: Array<{ key: Parameters<ReturnType<typeof useT>>[0]; to: Route }> = [
  { key: 'navSites', to: { name: 'sites' } },
  { key: 'navStories', to: { name: 'stories' } },
  { key: 'navTimeline', to: { name: 'timeline' } },
  { key: 'navJourney', to: { name: 'journey' } },
  { key: 'navQuiz', to: { name: 'quiz' } },
  { key: 'navAbout', to: { name: 'about' } },
]

export function SiteNav({ route, back }: Props) {
  const active = sectionOf(route)
  const t = useT()
  const lang = useLang()
  const setLang = useStore((st) => st.setLang)

  return (
    <nav className={s.nav} aria-label={t('navMain')}>
      {/* flexShrink:0, not minWidth:0 — with min-width:0 the left
          cluster is allowed to collapse to zero and its children then
          overflow underneath the nav links, which is how the back
          link ended up printed on top of "Sites" on a 360px screen. */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 8 }}>
        <a className={s.brand} href={href({ name: 'home' })}>
          <span className={s.mark} aria-hidden="true" />
          <span className={s.brandName}>Bharat Darshan</span>
        </a>

        {back && (
          <>
            <span style={{ color: 'var(--paper-faint)', margin: '0 8px' }} aria-hidden="true">
              /
            </span>
            <a className={s.back} href={href(back.to)}>
              <span aria-hidden="true">←</span> {back.label}
            </a>
          </>
        )}
      </div>

      <div className={s.links}>
        {LINKS.map((l) => {
          const on = active === sectionOf(l.to)
          return (
            <a
              key={l.key}
              href={href(l.to)}
              className={`${s.link} ${on ? s.linkOn : ''}`}
              aria-current={on ? 'page' : undefined}
            >
              {t(l.key)}
            </a>
          )
        })}

        {/* The switch. Two buttons rather than a checkbox or a select:
            there are exactly two languages, both need to be visible at
            once so a reader can see Hindi is an option, and a segmented
            control is the only form where the current state is obvious
            without reading a label. */}
        <span className={s.lang} role="group" aria-label={t('langLabel')}>
          <button
            type="button"
            className={`${s.langBtn} ${lang === 'en' ? s.langOn : ''}`}
            aria-pressed={lang === 'en'}
            onClick={() => setLang('en')}
          >
            {t('langEn')}
          </button>
          <button
            type="button"
            className={`${s.langBtn} ${lang === 'hi' ? s.langOn : ''}`}
            aria-pressed={lang === 'hi'}
            onClick={() => setLang('hi')}
          >
            {t('langHi')}
          </button>
        </span>
      </div>
    </nav>
  )
}
