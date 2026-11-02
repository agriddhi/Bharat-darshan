/* ============================================================
   ui/TopBar.tsx — identity, filters, search, counter.

   The counter and the 3D field are wired to the same predicate
   (isShown, from data/sites.ts). If they were computed separately they
   would drift, and "18 of 25 shown" sitting above a field containing
   19 lit markers is exactly the kind of small lie that costs trust in
   a demo.
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from 'react'
import s from './TopBar.module.css'

import {
  SITES,
  AVAILABLE_REGIONS,
  AVAILABLE_TYPES,
  AVAILABLE_ERAS,
  SITES_WITH_DOCUMENTS,
  visibleSites,
  titleCase,
} from '../data/sites'
import { useStore } from '../state/store'
import { useCamera } from '../state/camera'

export function TopBar() {
  const filters = useStore((st) => st.filters)
  const setFilter = useStore((st) => st.setFilter)
  const clearFilters = useStore((st) => st.clearFilters)
  const query = useStore((st) => st.query)
  const setQuery = useStore((st) => st.setQuery)
  const issue = useCamera((st) => st.issue)

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => visibleSites(filters, query), [filters, query])
  const total = SITES.length
  const shown = results.length

  const hasAnyFilter =
    !!filters.region || !!filters.type || !!filters.era || filters.hasDocument || !!query

  // Reset the highlighted row whenever the result list changes, so
  // Enter never fires at a stale index left over from a shorter list.
  useEffect(() => {
    setActive(0)
  }, [query, filters.region, filters.type, filters.era, filters.hasDocument])

  const flyToTop = () => {
    if (results.length === 0) return
    issue({ kind: 'fly', siteId: results[0].id })
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      flyToTop()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <header className={s.bar}>
      <div className={s.brand}>
        <span className={s.mark} aria-hidden="true" />
        <div>
          <div className={s.title}>Bharat Darshan</div>
          <div className={s.subtitle}>Heritage Atlas · India</div>
        </div>
      </div>

      {/* ---- filters ---- */}
      <div className={s.filters} role="group" aria-label="Filter sites">
        <select
          aria-label="Filter by region"
          className={`${s.select} ${filters.region ? s.selectActive : ''}`}
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

        <select
          aria-label="Filter by building type"
          className={`${s.select} ${filters.type ? s.selectActive : ''}`}
          value={filters.type ?? ''}
          onChange={(e) => setFilter('type', e.target.value || null)}
        >
          <option value="">All types</option>
          {AVAILABLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {titleCase(t)}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by era"
          className={`${s.select} ${filters.era ? s.selectActive : ''}`}
          value={filters.era ?? ''}
          onChange={(e) => setFilter('era', e.target.value || null)}
        >
          <option value="">All eras</option>
          {AVAILABLE_ERAS.map((e2) => (
            <option key={e2} value={e2}>
              {titleCase(e2)}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`${s.toggle} ${filters.hasDocument ? s.toggleOn : ''}`}
          aria-pressed={filters.hasDocument}
          // Document data does not exist in this build, so the filter is
          // present but currently matches nothing — which is the truthful
          // behaviour. It is not hidden, because the brief asks for it,
          // and it is not faked with placeholder documents.
          onClick={() => setFilter('hasDocument', !filters.hasDocument)}
        >
          With document
          <span className="sr-only">
            ({SITES_WITH_DOCUMENTS.length} sites have a linked document)
          </span>
        </button>
      </div>

      {/* ---- search ---- */}
      <div className={s.search}>
        <span className={s.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          className={s.input}
          type="search"
          role="combobox"
          aria-expanded={open && query.length > 0}
          aria-controls="site-results"
          aria-label="Search sites"
          placeholder="Search title, description, tags…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          onKeyDown={onKeyDown}
        />

        {open && query.trim().length > 0 && (
          <div className={s.results} id="site-results" role="listbox">
            {results.length === 0 ? (
              <div className={s.resultsEmpty}>
                Nothing matches “{query}”. Try a region, a building type, or a
                place name.
              </div>
            ) : (
              results.slice(0, 8).map((site, i) => (
                <button
                  key={site.id}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={`${s.result} ${i === active ? s.resultActive : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    issue({ kind: 'fly', siteId: site.id })
                    setOpen(false)
                  }}
                >
                  <img
                    className={s.resultImg}
                    src={site.media[0]?.src}
                    alt=""
                    loading="lazy"
                  />
                  <span>
                    <span className={s.resultName}>{site.title}</span>
                    <br />
                    <span className={s.resultMeta}>
                      {titleCase(site.type)} · {site.state}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ---- counter + clear ---- */}
      <div className={s.meta}>
        <span className={s.counter} aria-live="polite">
          <em>{shown}</em> of {total} sites shown
        </span>
        <button
          type="button"
          className={`${s.clear} ${hasAnyFilter ? '' : s.clearOff}`}
          onClick={clearFilters}
          disabled={!hasAnyFilter}
        >
          Clear filters
        </button>
      </div>
    </header>
  )
}
