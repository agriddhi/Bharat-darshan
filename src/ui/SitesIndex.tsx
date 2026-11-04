/* ============================================================
   ui/SitesIndex.tsx — every site, filtered and searchable.

   ONE PREDICATE, ONE COUNTER
   The list here and the count in the filter bar are both computed
   from isShown(). There is no second implementation of "what matches"
   anywhere in the app, so the number the reader sees cannot drift
   away from the cards they are looking at. That was true of the 3D
   field too, and it stays true now that the field is gone.

   FILTERS LIVE IN THE STORE, NOT IN THIS COMPONENT
   The count above and the cards below are both computed from
   isShown(), so they cannot disagree. The store is also what the
   search box writes to, which is why a filter set here survives
   navigating away and coming back.

   The timeline is the one surface that ignores all of it. It shows
   all twenty-five in chronological order whatever is selected here,
   because a timeline with three sites on it has no span to show.
   ============================================================ */

import s from './SitesIndex.module.css'
import {
  SITES,
  AVAILABLE_REGIONS,
  AVAILABLE_TYPES,
  AVAILABLE_ERAS,
  isShown,
} from '../data/sites'
import { useStore } from '../state/store'
import { useT, useLang, regionLabel, typeLabel, eraLabel } from '../i18n'
import { href, type Route } from '../router'

/** Opens the index with a photograph rather than with empty dark. */
const HEAD_PHOTO = 'media/konark.jpg'

export function SitesIndex() {
  const filters = useStore((st) => st.filters)
  const query = useStore((st) => st.query)
  const setFilter = useStore((st) => st.setFilter)
  const setQuery = useStore((st) => st.setQuery)
  const clearFilters = useStore((st) => st.clearFilters)
  const visited = useStore((st) => st.visited)

  /* Named `tr` rather than `t`: this file maps over AVAILABLE_TYPES
     and site.tags with a parameter it also wanted to call `t`, and a
     shadowed translation function silently returns the key name in
     every dropdown. */
  const tr = useT()
  const lang = useLang()

  const shown = SITES.filter((x) => isShown(x, filters, query))
  const activeCount =
    (filters.region ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.era ? 1 : 0) +
    (filters.hasDocument ? 1 : 0) +
    (query.trim() ? 1 : 0)

  const anyActive = activeCount > 0

  return (
    <div className={s.page}>
      {/* ================= HEADER ================= */}
      <header className={s.head}>
        <img className={s.headPhoto} src={HEAD_PHOTO} alt="" aria-hidden="true" />
        <div className={s.headScrim} />
        <div className={s.headInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>{tr('sitesEyebrow')}</span>
          </div>
          <h1 className={s.title}>
            {tr('sitesTitle1')}
            <span className={s.titleEm}>{tr('sitesTitle2')}</span>
          </h1>
          <p className={s.lede}>{tr('sitesLede')}</p>
        </div>
      </header>

      {/* ================= FILTERS ================= */}
      <div className={s.filters}>
        <label className={s.field}>
          <span className="sr-only">{tr('filterRegion')}</span>
          <select
            className={`${s.select} ${filters.region ? s.selectOn : ''}`}
            value={filters.region ?? ''}
            onChange={(e) => setFilter('region', e.target.value || null)}
          >
            <option value="">{tr('allRegions')}</option>
            {AVAILABLE_REGIONS.map((r) => (
              <option key={r} value={r}>
                {regionLabel(r, lang)}
              </option>
            ))}
          </select>
          <span className={s.chev} aria-hidden="true">
            ▼
          </span>
        </label>

        <label className={s.field}>
          <span className="sr-only">Type</span>
          <select
            className={`${s.select} ${filters.type ? s.selectOn : ''}`}
            value={filters.type ?? ''}
            onChange={(e) => setFilter('type', e.target.value || null)}
          >
            <option value="">{tr('allTypes')}</option>
            {AVAILABLE_TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {typeLabel(ty, lang)}
              </option>
            ))}
          </select>
          <span className={s.chev} aria-hidden="true">
            ▼
          </span>
        </label>

        <label className={s.field}>
          <span className="sr-only">{tr('filterEra')}</span>
          <select
            className={`${s.select} ${filters.era ? s.selectOn : ''}`}
            value={filters.era ?? ''}
            onChange={(e) => setFilter('era', e.target.value || null)}
          >
            <option value="">{tr('allEras')}</option>
            {AVAILABLE_ERAS.map((era) => (
              <option key={era} value={era}>
                {eraLabel(era, lang)}
              </option>
            ))}
          </select>
          <span className={s.chev} aria-hidden="true">
            ▼
          </span>
        </label>

        <label className={s.field}>
          <span className="sr-only">{tr('filterDoc')}</span>
          <select
            className={`${s.select} ${filters.hasDocument ? s.selectOn : ''}`}
            value={filters.hasDocument ? 'yes' : ''}
            onChange={(e) => setFilter('hasDocument', e.target.value === 'yes')}
          >
            <option value="">{tr('anyRecord')}</option>
            <option value="yes">{tr('hasLinked')}</option>
          </select>
          <span className={s.chev} aria-hidden="true">
            ▼
          </span>
        </label>

        <div className={s.searchWrap}>
          <span className={s.searchIcon} aria-hidden="true">
            ⌕
          </span>
          <input
            className={s.search}
            type="search"
            value={query}
            placeholder={tr('searchPlaceholder')}
            aria-label={tr('searchLabel')}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className={s.clearSearch}
              onClick={() => setQuery('')}
              aria-label={tr('clearSearch')}
            >
              ✕
            </button>
          )}
        </div>

        <span className={`${s.counter} ${anyActive ? s.counterOn : ''}`} aria-live="polite">
          {shown.length} {tr('of')} {SITES.length} {tr('shown')}
        </span>

        {anyActive && (
          <button className={s.clear} onClick={clearFilters}>
            {tr('clearAll')}
          </button>
        )}
      </div>

      {/* ================= GRID ================= */}
      <div className={s.grid}>
        {shown.length === 0 ? (
          <div className={s.empty}>
            <h2 className={s.emptyTitle}>{tr('nothingMatches')}</h2>
            <p className={s.emptyBody}>{tr('emptyBody')}</p>
            <button className={s.emptyReset} onClick={clearFilters}>
              {tr('showAll')} {SITES.length} {tr('sitesWord')}
            </button>
          </div>
        ) : (
          shown.map((site) => {
            const photo = site.media.find((m) => m.kind === 'photo') ?? site.media[0]
            const route: Route = { name: 'site', id: site.id }
            const seen = visited.includes(site.id)

            return (
              <a key={site.id} className={s.card} href={href(route)}>
                {photo && (
                  <img
                    className={s.cardPhoto}
                    src={photo.src}
                    alt={site.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // A missing photograph must not leave a broken-image
                      // glyph in the grid — hide the frame and let the
                      // dark ground stand in for it.
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className={s.cardScrim} />

                {seen && (
                  <span
                    className={s.cardTick}
                    title={tr('visitedTitle')}
                    aria-label={tr('visited')}
                  >
                    ✓
                  </span>
                )}

                <div className={s.cardBody}>
                  {(site.isUnesco || site.isOfficiallyProtected) && (
                    <div className={s.cardBadges}>
                      {site.isUnesco && (
                        <span className={`${s.badge} ${s.badgeUnesco}`}>
                          {tr('unescoShort')}
                        </span>
                      )}
                      {site.isOfficiallyProtected && (
                        <span className={s.badge}>
                          {site.protectedBy ?? tr('protected')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* In Hindi the card carries the Hindi name rather than
                      the English one. Showing ताजमहल under a heading that
                      still read "Taj Mahal" is the same half-broken switch
                      the chrome was fixed for — the reader asked for Hindi
                      and the first thing on the card has to answer that. */}
                  <h2 className={s.cardTitle}>
                    {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
                  </h2>

                  <div className={s.cardMeta}>
                    <span>{site.state}</span>
                    <span className={s.cardDot} aria-hidden="true" />
                    <span>{typeLabel(site.type, lang)}</span>
                    <span className={s.cardDot} aria-hidden="true" />
                    <span>{eraLabel(site.era, lang)}</span>
                  </div>
                </div>
              </a>
            )
          })
        )}
      </div>
    </div>
  )
}
