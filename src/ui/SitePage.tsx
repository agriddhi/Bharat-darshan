/* ============================================================
   ui/SitePage.tsx — one site, one page, all of it.

   WHAT THIS REPLACES
   A 468px side panel that could only ever show a fraction of the
   record. The data file holds roughly 61,000 characters across the
   25 sites; the panel rendered about 7,700 of them. Everything on
   this page — the five-part narrative, the history, the quick facts,
   the Hindi text, the sources, the credits — already existed and was
   simply being thrown away by the container it was put in.

   NOT ONE WORD IS WRITTEN HERE
   Every sentence on this page comes from sites.json. There is no
   copy in this file that is not sourced, because a heritage archive
   that paraphrases its own citations is worse than one that shows
   nothing. Where v1 marked a field TODO, this page shows the TODO.

   THE LANGUAGE TOGGLE
   It switches the content AND the chrome, driven by one field in the
   store. An earlier pass switched only the record text on the
   reasoning that navigation is not archive material — sound, and now
   wrong: a reader who presses हिं and finds "Quick facts" sitting
   above a Hindi paragraph is being told the switch is half-broken.
   The prose was always the harder half and it already existed in the
   data, so the chrome came along with it. Where a field has no
   Hindi, the English stands; nothing is machine-translated to fill
   the gap.
   ============================================================ */

import s from './SitePage.module.css'
import { SITES, getSite, titleCase } from '../data/sites'
import { useStore, JOURNEY_MAX } from '../state/store'
import { useT, useLang } from '../i18n'
import { href, type Route } from '../router'
import type { Site } from '../data/types'

interface Props {
  id: string
}

export function SitePage({ id }: Props) {
  const site = getSite(id)

  const journey = useStore((st) => st.journey)
  const addToJourney = useStore((st) => st.addToJourney)
  const removeFromJourney = useStore((st) => st.removeFromJourney)
  const toggleVisited = useStore((st) => st.toggleVisited)
  const isVisited = useStore((st) => st.isVisited)

  /* The language lives in the store, not in component state. It used
     to be a local useState, which meant the toggle reset to English
     every time the reader moved to another site — press हिं, read one
     page, tap the next, and you are back in English. As store state
     it survives navigation and matches the switch in the nav, so the
     two controls can never disagree about what is selected. */
  const lang = useLang()
  const setLang = useStore((st) => st.setLang)
  const t = useT()

  if (!site) return <Missing id={id} />

  const index = SITES.findIndex((x) => x.id === site.id)
  const prev = index > 0 ? SITES[index - 1] : null
  const next = index < SITES.length - 1 ? SITES[index + 1] : null

  const inJourney = journey.includes(site.id)
  const atCap = journey.length >= JOURNEY_MAX && !inJourney
  const visited = isVisited(site.id)

  const hi = lang === 'hi'
  const photo = site.media.find((m) => m.kind === 'photo') ?? site.media[0]

  return (
    <div className={s.page}>
      {/* ================= HERO ================= */}
      <header className={s.hero}>
        {photo && (
          <img className={s.photo} src={photo.src} alt={`${site.title}, ${site.state}`} />
        )}
        <div className={s.heroGrade} />
        <div className={s.scrim} />
        <div className={s.vignette} />

        <div className={s.heroInner}>
          <Badges site={site} />

          <h1 className={s.title}>{site.title}</h1>
          {site.nameHi && <div className={s.nameHi}>{site.nameHi}</div>}

          <div className={s.meta}>
            <span className={s.metaItem}>{site.state}</span>
            <span className={s.metaDot} aria-hidden="true" />
            <span className={s.metaItem}>{site.region}</span>
            <span className={s.metaDot} aria-hidden="true" />
            <span className={s.metaItem}>{titleCase(site.type)}</span>
            <span className={s.metaDot} aria-hidden="true" />
            <span className={s.metaItem}>{site.era}</span>
            {site.city && (
              <>
                <span className={s.metaDot} aria-hidden="true" />
                <span className={s.metaItem}>{site.city}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= STICKY ACTIONS ================= */}
      <div className={s.actions}>
        <button
          className={`${s.btn} ${inJourney ? s.btnOn : s.btnGhost}`}
          disabled={atCap}
          title={
            atCap ? t('journeyFullTitle') : undefined
          }
          onClick={() => (inJourney ? removeFromJourney(site.id) : addToJourney(site.id))}
        >
          {inJourney ? t('inJourney') : atCap ? t('journeyFull') : t('addToJourney')}
        </button>

        <button
          className={`${s.btn} ${visited ? s.btnOn : s.btnGhost}`}
          onClick={() => toggleVisited(site.id)}
        >
          {visited ? t('visited') : t('markVisited')}
        </button>

        {hasHindi(site) && (
          <div className={s.langToggle} role="group" aria-label="Content language">
            <button
              className={`${s.langBtn} ${!hi ? s.langOn : ''}`}
              aria-pressed={!hi}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              className={`${s.langBtn} ${hi ? s.langOn : ''}`}
              aria-pressed={hi}
              onClick={() => setLang('hi')}
            >
              हिं
            </button>
          </div>
        )}

        <span className={s.counter}>
          {index + 1} {t('of')} {SITES.length}
        </span>
      </div>

      {/* ================= CONTENT ================= */}
      <main className={s.wrap}>
        {/* ---- lede ---- */}
        <section className={`${s.section} ${s.prose}`}>
          <div className={s.eyebrow}>{t('whatThisIs')}</div>
          {hi && site.descriptionHi ? (
            <p className={s.ledeHi}>{site.descriptionHi}</p>
          ) : (
            <p className={s.lede}>{site.description}</p>
          )}
        </section>

        {/* ---- quick facts ---- */}
        {site.quickFacts && site.quickFacts.length > 0 && (
          <section className={s.section}>
            <div className={s.sectionHead}>
              <span className={s.sectionNum} aria-hidden="true">
                ·
              </span>
              <h2 className={s.sectionTitle}>{t('quickFacts')}</h2>
            </div>
            <div className={s.facts}>
              {site.quickFacts.map((f) => (
                <div key={f.label} className={s.fact}>
                  <div className={s.factLabel}>{f.label}</div>
                  <div className={s.factValue}>{f.value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- the five-part story ---- */}
        {site.story && site.story.length > 0 && (
          <section className={s.section}>
            <div className={s.sectionHead}>
              <span className={s.sectionNum} aria-hidden="true">
                ·
              </span>
              <div>
                <h2 className={s.sectionTitle}>{t('theStory')}</h2>
                <div className={s.eyebrow} style={{ marginBottom: 0, marginTop: 6 }}>
                  {t('fiveStages')} · {site.story.length} {t('sections')}
                </div>
              </div>
            </div>

            <div className={s.prose}>
              {site.story.map((stage, i) => (
                <article key={stage.title} className={s.stage}>
                  <div className={s.stageNum} aria-hidden="true">
                    {i + 1}
                  </div>
                  <div>
                    {hi && stage.titleHi ? (
                      <h3 className={s.stageTitleHi}>{stage.titleHi}</h3>
                    ) : (
                      <h3 className={s.stageTitle}>{stage.title}</h3>
                    )}

                    {hi && stage.bodyHi ? (
                      <p className={s.stageBodyHi}>{stage.bodyHi}</p>
                    ) : (
                      <p className={s.stageBody}>{stage.body}</p>
                    )}

                    {/* v1 left every one of these null and marked TODO.
                        Showing the gap is more honest than hiding it. */}
                    {stage.image === null && (
                      <div className={s.stageImagePending}>
                        Image for this stage — TODO. v1 carried no licensed
                        photograph for it, and none has been sourced since.
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ---- history ---- */}
        {site.history && (
          <section className={`${s.section} ${s.prose}`}>
            <div className={s.sectionHead}>
              <span className={s.sectionNum} aria-hidden="true">
                ·
              </span>
              <h2 className={s.sectionTitle}>{t('history')}</h2>
            </div>
            {hi && site.historyHi ? (
              <p className={s.historyHi}>{site.historyHi}</p>
            ) : (
              <p className={s.history}>{site.history}</p>
            )}
          </section>
        )}

        {/* ---- 360 panorama, where one exists ---- */}
        {site.pano360 && (
          <section className={`${s.section} ${s.prose}`}>
            <div className={s.sectionHead}>
              <span className={s.sectionNum} aria-hidden="true">
                ·
              </span>
              <h2 className={s.sectionTitle}>{t('view360')}</h2>
            </div>
            <a className={s.official} href={site.pano360} target="_blank" rel="noreferrer">
              <span className={s.officialMark}>360</span>
              <span>
                <span className={s.officialLabel}>
                  {t('openPanorama')} {site.title}
                </span>
                <span className={s.officialUrl} style={{ display: 'block' }}>
                  {site.pano360Note ?? site.pano360}
                </span>
              </span>
            </a>
          </section>
        )}

        {/* ---- sources ---- */}
        <section className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.sectionNum} aria-hidden="true">
              ·
            </span>
            <h2 className={s.sectionTitle}>{t('sources')}</h2>
          </div>

          {/* The official record leads, because it is the one the whole
              entry is verified against. */}
          {site.officialSource?.url && (
            <a
              className={s.official}
              href={site.officialSource.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className={s.officialMark}>Official</span>
              <span>
                <span className={s.officialLabel}>
                  {site.officialSource.label ?? t('officialRecord')}
                </span>
                <span className={s.officialUrl} style={{ display: 'block' }}>
                  {site.officialSource.url}
                </span>
              </span>
            </a>
          )}

          {site.sourceLinks.length > 0 && (
            <div className={s.links}>
              {site.sourceLinks.map((l) => (
                <a key={l.url} className={s.linkRow} href={l.url} target="_blank" rel="noreferrer">
                  <span className={s.linkArrow} aria-hidden="true">
                    ↗
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className={s.linkLabel}>{l.label}</span>
                    <span className={s.linkUrl} style={{ display: 'block' }}>
                      {l.url}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          )}

          {site.sources.length > 0 && (
            <ol className={s.sourceList}>
              {site.sources.map((src, i) => (
                <li key={i}>{src}</li>
              ))}
            </ol>
          )}
        </section>

        {/* ---- credits ---- */}
        <section className={s.section}>
          <div className={s.sectionHead}>
            <span className={s.sectionNum} aria-hidden="true">
              ·
            </span>
            <h2 className={s.sectionTitle}>{t('imageCredit')}</h2>
          </div>
          <div className={s.credits}>
            <div className={s.creditItem}>
              <div className={s.creditLabel}>{t('photographer')}</div>
              <div className={s.creditValue}>{site.credits.photographer}</div>
            </div>
            <div className={s.creditItem}>
              <div className={s.creditLabel}>{t('licence')}</div>
              <div className={s.creditValue}>{site.credits.license}</div>
            </div>
            <div className={s.creditItem}>
              <div className={s.creditLabel}>{t('file')}</div>
              <div className={s.creditValue}>{site.credits.filename}</div>
            </div>
          </div>
          {site.tags.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {site.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: '0.66rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--paper-faint)',
                    border: '1px solid var(--glass-line)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '4px 11px',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ---- prev / next ---- */}
        <nav className={s.pager} aria-label="Adjacent sites">
          {prev ? (
            <a className={s.pagerLink} href={href({ name: 'site', id: prev.id })}>
              <span className={s.pagerDir}>{t('previous')}</span>
              <span className={s.pagerName}>{prev.title}</span>
              <span className={s.pagerMeta}>
                {prev.state} · {prev.era}
              </span>
            </a>
          ) : (
            <span />
          )}

          {next && (
            <a className={`${s.pagerLink} ${s.pagerNext}`} href={href({ name: 'site', id: next.id })}>
              <span className={s.pagerDir}>{t('next')}</span>
              <span className={s.pagerName}>{next.title}</span>
              <span className={s.pagerMeta}>
                {next.state} · {next.era}
              </span>
            </a>
          )}
        </nav>
      </main>
    </div>
  )
}

/* ============================================================
   Small pieces
   ============================================================ */

function Badges({ site }: { site: Site }) {
  const t = useT()
  const out: React.ReactNode[] = []

  if (site.isUnesco) {
    out.push(
      <span key="unesco" className={`${s.badge} ${s.badgeUnesco}`}>
        {t('unescoWorld')}
        {site.isUnescoRef ? ` · ${site.isUnescoRef}` : ''}
      </span>
    )
  }

  if (site.isOfficiallyProtected) {
    out.push(
      <span key="prot" className={s.badge}>
        {site.protectedBy ?? t('officiallyProtected')}
      </span>
    )
  }

  if (site.govLink) {
    out.push(
      <a
        key="gov"
        className={s.badge}
        href={site.govLink}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'none' }}
      >
        {t('governmentRecord')} ↗
      </a>
    )
  }

  if (out.length === 0) return null
  return <div className={s.badges}>{out}</div>
}

/** True when this record actually carries Hindi text worth toggling to. */
function hasHindi(site: Site): boolean {
  return !!(
    site.descriptionHi ||
    site.historyHi ||
    (site.story ?? []).some((st) => st.titleHi || st.bodyHi)
  )
}

function Missing({ id }: { id: string }) {
  const t = useT()
  const fallback: Route = { name: 'sites' }
  return (
    <div className={s.page}>
      <div className={s.missing}>
        <div className={s.eyebrow}>{t('notInArchive')}</div>
        <h1 className={s.missingTitle}>
          {t('noSiteMatches')} “{id}”
        </h1>
        <p className={s.missingBody}>{t('missingBody')}</p>
        <a className={`${s.btn} ${s.btnPrimary}`} href={href(fallback)}>
          {t('browseAll')} {SITES.length} {t('sitesWord')}
        </a>
      </div>
    </div>
  )
}
