/* ============================================================
   ui/AtlasPage.tsx — the gallery room.

   WHY THIS PAGE EXISTS AT ALL
   The previous version of the atlas was a field of identical
   cylinders on a black plane. It answered the question "what is 3D
   here" with: nothing. There was no depth cue, no occlusion, no
   parallax — just flat data marks drawn with a perspective camera,
   which is the worst of both worlds. It said less than a list and
   looked worse than either.

   This replaces it with the one thing the archive has that is
   genuinely worth seeing in space: 26 photographs of real monuments,
   hung at varying depths with real perspective and pointer parallax.

   FILTERS ARE SHARED WITH THE ARCHIVE INDEX
   The region chips write to the same store field the archive index
   reads, so a reader who narrows to "South" here and then opens the
   index sees South. One filter state, two surfaces, no possibility
   of the two pages disagreeing about what is selected.

   PARALLAX IS A LAYER, NOT A REQUIREMENT
   The tilt is applied to a single element via CSS custom properties.
   Nothing about reaching a print depends on it: every print is a
   plain anchor in document order, the wall flattens entirely under
   prefers-reduced-motion, and on touch devices the tilt is simply
   never attached.
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import s from './Atlas.module.css'
import { SITES, AVAILABLE_REGIONS } from '../data/sites'
import { useStore } from '../state/store'
import { href } from '../router'

/** Header photograph — different from every other page's. */
const HEAD_PHOTO = 'media/ellora.jpg'

/** Tilt limits in degrees. Kept small: past ~7° the wall stops
 *  reading as a wall and starts reading as a card tipping over. */
const MAX_YAW = 6
const MAX_PITCH = 4

export function AtlasPage() {
  const filters = useStore((st) => st.filters)
  const setFilter = useStore((st) => st.setFilter)

  const roomRef = useRef<HTMLDivElement>(null)
  const wallRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const shown = useMemo(
    () => (filters.region ? SITES.filter((x) => x.region === filters.region) : SITES),
    [filters.region]
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const site of SITES) map.set(site.region, (map.get(site.region) ?? 0) + 1)
    return map
  }, [])

  /* ---- pointer parallax ----
     One listener, one element, one custom property each. The handler
     is throttled to a frame so a fast pointer cannot queue up style
     writes faster than the compositor can use them. */
  const onPointerMove = useCallback((e: PointerEvent) => {
    const wall = wallRef.current
    const room = roomRef.current
    if (!wall || !room) return

    if (rafRef.current !== null) return

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const rect = room.getBoundingClientRect()
      // -0.5 .. 0.5 across the room
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5

      wall.style.setProperty('--yaw', `${(-nx * MAX_YAW * 2).toFixed(2)}deg`)
      wall.style.setProperty('--pitch', `${(ny * MAX_PITCH * 2).toFixed(2)}deg`)
    })
  }, [])

  const onPointerLeave = useCallback(() => {
    const wall = wallRef.current
    if (!wall) return
    wall.style.setProperty('--yaw', '0deg')
    wall.style.setProperty('--pitch', '0deg')
  }, [])

  useEffect(() => {
    const room = roomRef.current
    if (!room) return

    // Touch devices get no tilt: the handler would fire on every
    // scroll-adjacent touch and fight the reader's finger.
    const coarse =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (coarse || reduced) return

    room.addEventListener('pointermove', onPointerMove)
    room.addEventListener('pointerleave', onPointerLeave)

    return () => {
      room.removeEventListener('pointermove', onPointerMove)
      room.removeEventListener('pointerleave', onPointerLeave)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [onPointerMove, onPointerLeave])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas-deep)', color: 'var(--paper)' }}>
      {/* ================= HEADER ================= */}
      <header
        style={{
          position: 'relative',
          padding: 'clamp(40px, 7vw, 92px) clamp(16px, 5vw, 64px) clamp(26px, 3.4vw, 44px)',
          overflow: 'hidden',
        }}
      >
        <img
          src={HEAD_PHOTO}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 42%',
            opacity: 0.3,
            filter: 'saturate(0.82)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, var(--canvas-deep) 4%, rgba(14,22,38,0.76) 56%, rgba(14,22,38,0.62) 100%), radial-gradient(78% 62% at 84% 6%, rgba(222,164,68,0.2), transparent 64%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              fontFamily: 'var(--sans)',
              fontSize: '0.66rem',
              fontWeight: 700,
              letterSpacing: 'var(--track-caps)',
              textTransform: 'uppercase',
              color: 'var(--ochre)',
              marginBottom: 15,
            }}
          >
            <span
              style={{
                width: 'clamp(26px, 4vw, 50px)',
                height: 1,
                background: 'linear-gradient(90deg, var(--ochre), transparent)',
              }}
              aria-hidden="true"
            />
            <span>The atlas</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2.3rem, 5.6vw, 4.5rem)',
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: '#fbf7ef',
              margin: 0,
            }}
          >
            The collection,
            <span
              style={{
                display: 'block',
                fontStyle: 'italic',
                color: 'var(--ochre)',
              }}
            >
              hung in space.
            </span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 'var(--text-lead)',
              lineHeight: 1.7,
              color: 'rgba(244,235,217,0.82)',
              maxWidth: '62ch',
              margin: '20px 0 0',
            }}
          >
            All {SITES.length} monuments as prints on a wall, arranged by region. Move
            your pointer to shift the room; select any print to open its full record
            with sources, history and credits.
          </p>
        </div>
      </header>

      {/* ================= REGION CHIPS ================= */}
      <div className={s.chips} role="group" aria-label="Filter the gallery by region">
        <button
          className={`${s.chip} ${!filters.region ? s.chipOn : ''}`}
          aria-pressed={!filters.region}
          onClick={() => setFilter('region', null)}
        >
          All regions
          <span className={s.chipCount}>{SITES.length}</span>
        </button>

        {AVAILABLE_REGIONS.map((r) => (
          <button
            key={r}
            className={`${s.chip} ${filters.region === r ? s.chipOn : ''}`}
            aria-pressed={filters.region === r}
            onClick={() => setFilter('region', filters.region === r ? null : r)}
          >
            {r}
            <span className={s.chipCount}>{counts.get(r) ?? 0}</span>
          </button>
        ))}
      </div>

      {/* ================= THE ROOM ================= */}
      <div className={s.room} ref={roomRef}>
        <div className={s.roomGrid} aria-hidden="true" />

        <p className={s.hint}>
          <span className={s.hintMark} aria-hidden="true">
            ◈
          </span>
          Move your pointer to shift the wall · click a print to open its record
        </p>

        <div className={s.wall} ref={wallRef}>
          {shown.map((site) => {
            const photo = site.media.find((m) => m.kind === 'photo') ?? site.media[0]

            // Prints deeper in the sequence are dimmed very slightly,
            // which is the cheapest depth cue there is and the one
            // that survives being scaled down on a phone.
            const depth = ['1', '0.93', '0.99', '0.9', '1.01', '0.95', '0.98'][
              // derive from the id so it is stable across re-renders
              [...site.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 7
            ]

            return (
              <a key={site.id} className={s.print} href={href({ name: 'site', id: site.id })}>
                {photo && (
                  <img
                    className={s.printPhoto}
                    src={photo.src}
                    alt={site.title}
                    loading="lazy"
                    decoding="async"
                    style={{ ['--b' as string]: depth }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}

                <div className={s.printScrim} />

                {site.isUnesco && <span className={s.printUnesco}>UNESCO</span>}

                <div className={s.printBody}>
                  <div className={s.printRegion}>{site.region}</div>
                  <h2 className={s.printTitle}>{site.title}</h2>
                  <div className={s.printMeta}>
                    {site.state} · {site.type.charAt(0).toUpperCase() + site.type.slice(1)}
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {shown.length === 0 && (
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '70px 0' }}>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 600,
                color: '#fbf7ef',
                margin: '0 0 12px',
              }}
            >
              Nothing hangs in this region yet
            </h2>
            <p
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--paper-dim)',
                margin: '0 auto',
                maxWidth: '44ch',
              }}
            >
              The archive has no records for {filters.region}. Choose another region to
              see the wall again.
            </p>
            <button
              className={s.chip}
              style={{ marginTop: 22, padding: '11px 22px' }}
              onClick={() => setFilter('region', null)}
            >
              Show all {SITES.length}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
