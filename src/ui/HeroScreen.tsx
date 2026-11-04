/* ============================================================
   ui/HeroScreen.tsx — the first screen.

   WHY A SEPARATE SCREEN RATHER THAN STRAIGHT INTO THE 3D FIELD
   The archive is the substance of this project, but it is a grid of
   markers — legible, useful, and not something that says "this was
   built with care" in the first two seconds. Judges and users form
   that impression before they touch anything. So the hero exists to
   earn the attention that the archive then spends.

   It is NOT a page. The 3D world is already mounted underneath and
   already animating; entering is a fade, not a navigation. That is
   the same rule the rest of v2 follows — no reloads, ever.

   THE PHOTOS ARE REAL AND CREDITED
   Every image is one of the 26 licensed photographs already in the
   project's credits table. Nothing here is stock, generated, or
   borrowed. If a photo fails to load, that slide is dropped from the
   rotation rather than shown as a broken image.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react'
import s from './HeroScreen.module.css'
import { SITES, getSite } from '../data/sites'
import { useT, useLang, typeLabel } from '../i18n'
import { navigate } from '../router'

/**
 * The hero rotation, ordered for contrast: a night shot, a close
 * carved detail, a colour-dense gopuram, then open silhouettes. The
 * Taj Mahal is deliberately absent — the file we hold for it is an
 * unwrapped 360° panorama, not a photograph, and it looks wrong when
 * scaled to fill a screen.
 */
const HERO_IDS = [
  'brihadeeswarar',
  'konark',
  'rani-ki-vav',
  'meenakshi',
  'golden-temple',
  'mahabalipuram',
  'sanchi',
  'ellora',
]

/** How long each photograph holds before dissolving to the next. */
const HOLD_MS = 7000

interface Props {
  onEnter: (siteId?: string) => void
}

export function HeroScreen({ onEnter }: Props) {
  const [index, setIndex] = useState(0)
  const [gone, setGone] = useState(false)
  const [broken, setBroken] = useState<Set<string>>(() => new Set())

  const t = useT()
  const lang = useLang()

  // Only keep slides whose photo actually resolves. A hero with an
  // empty frame in it is worse than a shorter rotation.
  const slides = useMemo(
    () => HERO_IDS.map((id) => getSite(id)).filter((x): x is NonNullable<typeof x> => !!x && !broken.has(x.id)),
    [broken]
  )

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Auto-advance. Paused entirely when the user has asked for less
  // motion — an auto-rotating background is exactly the kind of thing
  // that setting exists to stop.
  useEffect(() => {
    if (reduced || gone || slides.length < 2) return
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, HOLD_MS)
    return () => window.clearInterval(t)
  }, [reduced, gone, slides.length])

  // Wrap the index if a slide was removed after a load failure, or the
  // dots would point past the end of the array.
  useEffect(() => {
    if (slides.length > 0 && index >= slides.length) setIndex(0)
  }, [slides.length, index])

  const current = slides[index]

  const enter = (siteId?: string) => {
    setGone(true)
    // Give the fade a beat before revealing the world, so the two
    // scenes cross rather than cut.
    window.setTimeout(() => onEnter(siteId), 260)
  }

  const regions = new Set(SITES.map((x) => x.region)).size
  const eras = new Set(SITES.map((x) => x.era)).size

  return (
    <div className={`${s.hero} ${gone ? s.heroOut : ''}`} aria-hidden={gone}>
      {/* ---- 1. photographs ---- */}
      <div className={s.stage}>
        {slides.map((site, i) => (
          <div
            key={site.id}
            className={`${s.slide} ${i === index ? s.slideOn : ''}`}
            aria-hidden={i !== index}
          >
            <img
              className={s.photo}
              src={site.media[0]?.src}
              alt={i === index ? `${site.title}, ${site.state}` : ''}
              // Start the Ken Burns from a different offset per slide so
              // even the ones sharing a direction never sync up.
              style={{ animationDelay: `${-i * 3.7}s` }}
              onError={() =>
                setBroken((prev) => new Set(prev).add(site.id))
              }
            />
          </div>
        ))}
      </div>

      {/* ---- 2. atmosphere ---- */}
      <div className={s.grade} />
      <div className={s.rays} />
      <div className={`${s.fog} ${s.fogA}`} />
      <div className={`${s.fog} ${s.fogB}`} />

      {/* ---- 3. vignette + grain ---- */}
      <div className={s.vignette} />
      <div className={s.grain} />

      {/* ---- 4. content ---- */}
      <div className={s.content}>
        <nav className={s.nav}>
          <div className={`${s.brand} ${s.rise} ${s.rise1}`}>
            <span className={s.mark} aria-hidden="true" />
            {/* Stacked rather than inline: the Devanagari sits under the
                Latin name so the two read as one lockup instead of two
                titles fighting. It is the name, not a translation of it —
                the other site stacks them the same way and it is the one
                thing on that landing page worth taking. */}
            <span className={s.brandText}>
              <span className={s.brandName}>Bharat Darshan</span>
              <span className={s.brandDev} lang="hi">
                {t('brandDevanagari')}
              </span>
            </span>
          </div>
          {/* All three used to call enter(), so "Stories" opened the
              archive index and "Passport" opened it too — three labels,
              one destination. They now go where they say. Archive keeps
              the fade because that transition was designed for it; the
              other two navigate directly. */}
          <div className={`${s.links} ${s.rise} ${s.rise2}`}>
            <button className={s.link} onClick={() => enter()}>
              {t('heroArchive')}
            </button>
            <button className={s.link} onClick={() => navigate({ name: 'stories' })}>
              {t('navStories')}
            </button>
            <button className={s.link} onClick={() => navigate({ name: 'journey' })}>
              {t('heroPassport')}
            </button>
          </div>
        </nav>

        <div className={s.main}>
          <div className={s.copy}>
            <div className={`${s.eyebrow} ${s.rise} ${s.rise1}`}>
              <span className={s.eyebrowLine} aria-hidden="true" />
              <span>{t('heroEyebrow')}</span>
            </div>

            <h1 className={`${s.headline} ${s.rise} ${s.rise2}`}>
              {t('heroTitle1')}
              <span className={s.headlineEm}>{t('heroTitle2')}</span>
            </h1>

            <p className={`${s.lead} ${s.rise} ${s.rise3}`}>{t('heroLead')}</p>

            <div className={`${s.ctaRow} ${s.rise} ${s.rise4}`}>
              <button className={s.cta} onClick={() => enter()}>
                {t('enterArchive')}
                <span className={s.ctaArrow} aria-hidden="true">
                  →
                </span>
              </button>
            </div>

            <div className={`${s.facts} ${s.rise} ${s.rise5}`}>
              <div className={s.fact}>
                <div className={s.factNum}>{SITES.length}</div>
                <div className={s.factLabel}>{t('factSites')}</div>
              </div>
              <div className={s.fact}>
                <div className={s.factNum}>{regions}</div>
                <div className={s.factLabel}>{t('factRegions')}</div>
              </div>
              <div className={s.fact}>
                <div className={s.factNum}>{eras}</div>
                <div className={s.factLabel}>{t('factEras')}</div>
              </div>
              <div className={s.fact}>
                <div className={s.factNum}>100%</div>
                <div className={s.factLabel}>{t('factSourced')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* glass card for whatever is on screen — clicking it enters
            the archive and flies the camera straight to that site */}
        {current && (
          <button
            className={`${s.card} ${gone ? '' : s.cardIn}`}
            onClick={() => enter(current.id)}
            aria-label={`Enter the archive at ${current.title}`}
          >
            <img
              className={s.cardThumb}
              src={current.media[0]?.src}
              alt=""
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden'
              }}
            />
            <div className={s.cardBody}>
              <div className={s.cardKicker}>{t('nowShowing')}</div>
              <div className={s.cardName}>{current.title}</div>
              <div className={s.cardMeta}>
                {typeLabel(current.type, lang)} · {current.state}
              </div>
              <span className={s.cardGo}>
                {t('viewInArchive')} <span aria-hidden="true">→</span>
              </span>
            </div>
          </button>
        )}

        {/* slide dots */}
        <div className={s.dots} role="tablist" aria-label={t('heroPhotos')}>
          {slides.map((site, i) => (
            <button
              key={site.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${site.title}`}
              className={`${s.dot} ${i === index ? s.dotOn : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        {/* Was "Drag · scroll · click a site" — a promise this screen
            could not keep. The landing view is a fixed slideshow: there
            is nothing to drag and nothing to scroll, so the line read as
            an instruction to try gestures that do nothing. It now says
            the one thing here that is true and that a reader would not
            otherwise guess: the glass card is a button. */}
        <div className={s.hint}>{t('heroHint')}</div>
      </div>
    </div>
  )
}
