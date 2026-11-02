/* ============================================================
   ui/SitesIndex.tsx — every site, filtered and searchable.

   ONE PREDICATE, ONE COUNTER
   The list here and the count in the filter bar are both computed
   from isShown(). There is no second implementation of "what matches"
   anywhere in the app, so the number the reader sees cannot drift
   away from the cards they are looking at. That was true of the 3D
   field too, and it stays true now that the field is gone.

   FILTERS LIVE IN THE STORE, NOT IN THIS COMPONENT
   Which means the atlas page, the story pages and this index all
   agree about what is currently selected — and a reader who filters
   here and then visits the atlas sees the same subset.
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
            <span>The archive</span>
          </div>
          <h1 className={s.title}>
            Twenty-five sites,
            <span className={s.titleEm}>each with its sources.</span>
          </h1>
          <p className={s.lede}>
            Every entry carries the photograph, the licence that permits its use, the
            official record it was checked against, and a written account of what the
            place is and why it matters. Nothing here is stated without a citation.
          </p>
        </div>
      </header>

      {/* ================= FILTERS ================= */}
      <div className={s.filters}>
        <label className={s.field}>
          <span className="sr-only">Region</span>
          <select
            className={`${s.select} ${filters.region ? s.selectOn : ''}`}
            value={filters.region ?? ''}
            onChange={(e) => setFilter('region', e.target.value || null)}
          >
            <option value="">All regions</option>
            {AVAILABLE_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
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
            <option value="">All types</option>
            {AVAILABLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <span className={s.chev} aria-hidden="true">
            ▼
          </span>
        </label>

        <label className={s.field}>
          <span className="sr-only">Era</span>
          <select
            className={`${s.select} ${filters.era ? s.selectOn : ''}`}
            value={filters.era ?? ''}
            onChange={(e) => setFilter('era', e.target.value || null)}
          >
            <option value="">All eras</option>
            {AVAILABLE_ERAS.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
          <span className={s.chev} aria-hidden="true">
            ▼
          </span>
        </label>

        <label className={s.field}>
          <span className="sr-only">Has a linked document</span>
          <select
            className={`${s.select} ${filters.hasDocument ? s.selectOn : ''}`}
            value={filters.hasDocument ? 'yes' : ''}
            onChange={(e) => setFilter('hasDocument', e.target.value === 'yes')}
          >
            <option value="">Any record type</option>
            <option value="yes">Has a linked document</option>
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
            placeholder="Search sites, states, types…"
            aria-label="Search the archive"
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className={s.clearSearch}
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <span className={`${s.counter} ${anyActive ? s.counterOn : ''}`} aria-live="polite">
          {shown.length} of {SITES.length} shown
        </span>

        {anyActive && (
          <button className={s.clear} onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      {/* ================= GRID ================= */}
      <div className={s.grid}>
        {shown.length === 0 ? (
          <div className={s.empty}>
            <h2 className={s.emptyTitle}>Nothing matches that</h2>
            <p className={s.emptyBody}>
              No site in the archive satisfies every filter you have set. Try removing
              one, or search for something broader.
            </p>
            <button className={s.emptyReset} onClick={clearFilters}>
              Show all {SITES.length} sites
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
                  <span className={s.cardTick} title="You marked this as visited" aria-label="Visited">
                    ✓
                  </span>
                )}

                <div className={s.cardBody}>
                  {(site.isUnesco || site.isOfficiallyProtected) && (
                    <div className={s.cardBadges}>
                      {site.isUnesco && (
                        <span className={`${s.badge} ${s.badgeUnesco}`}>UNESCO</span>
                      )}
                      {site.isOfficiallyProtected && (
                        <span className={s.badge}>{site.protectedBy ?? 'Protected'}</span>
                      )}
                    </div>
                  )}

                  <h2 className={s.cardTitle}>{site.title}</h2>

                  <div className={s.cardMeta}>
                    <span>{site.state}</span>
                    <span className={s.cardDot} aria-hidden="true" />
                    <span>{site.type.charAt(0).toUpperCase() + site.type.slice(1)}</span>
                    <span className={s.cardDot} aria-hidden="true" />
                    <span>{site.era}</span>
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
