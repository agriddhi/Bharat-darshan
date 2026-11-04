/* ============================================================
   ui/StoryPage.tsx — one narrative, given a page of its own.

   HOW THIS DIFFERS FROM THE SAME TEXT ON THE SITE PAGE
   Not a word differs. What differs is the treatment:

     site page   — the record. Facts, sources, credits, with the
                   story as one section among six. For looking
                   something up.
     story page  — the narrative. Prose at a comfortable measure,
                   a standfirst, generous section breaks, and a
                   single link back to the record. For reading.

   A heritage archive needs both modes. Someone verifying a citation
   wants the sources on the same screen as the claim; someone
   deciding whether to care wants the claim without the apparatus.
   Duplication of the *text* is deliberate — it comes from one JSON
   field either way, so there is no second copy to fall out of date.

   NOT A WORD IS INVENTED
   Same rule as everywhere else in this project: everything below is
   read from sites.json. The standfirst is the site's own
   description, set larger because it is doing the job a lede does —
   it has not been rewritten to do it.
   ============================================================ */

import s from './Editorial.module.css'
import { getSite, SITES } from '../data/sites'
import { useT, useLang, regionLabel, eraLabel, typeLabel } from '../i18n'
import { useStore } from '../state/store'
import { href } from '../router'

interface Props {
  id: string
}

export function StoryPage({ id }: Props) {
  const site = getSite(id)

  /* Store state, not local: a toggle here used to reset to English on
     every navigation away and disagreed with the switch in the nav. */
  const lang = useLang()
  const setLang = useStore((st) => st.setLang)
  const t = useT()

  if (!site) {
    return (
      <div className={s.page}>
        <div className={s.empty}>
          <h2 className={s.emptyTitle}>
            {t('noStoryMatches')} “{id}”
          </h2>
          <p className={s.emptyBody}>{t('noStoryBody')}</p>
        </div>
      </div>
    )
  }

  const stages = site.story ?? []
  const photo = site.media.find((m) => m.kind === 'photo') ?? site.media[0]
  const hi = lang === 'en' ? false : true
  const hasHindi = !!(
    site.descriptionHi ||
    (stages.some((st) => st.titleHi || st.bodyHi))
  )

  const firstStage = stages[0]

  return (
    <article className={s.page}>
      {/* ================= HEAD ================= */}
      <header className={s.articleHead}>
        {photo && (
          <img className={s.articlePhoto} src={photo.src} alt="" aria-hidden="true" />
        )}
        <div className={s.articleHeadScrim} />

        <div className={s.articleHeadInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>
              {regionLabel(site.region, lang)} · {site.state}
            </span>
          </div>

          <h1 className={s.articleTitle}>
            {lang === 'hi' && site.nameHi ? site.nameHi : site.title}
          </h1>

          {firstStage && (
            <div className={s.articleSub}>
              {hi && firstStage.titleHi ? firstStage.titleHi : firstStage.title} —{' '}
              {Math.max(stages.length - 1, 0)} {t('moreStages')}
            </div>
          )}

          <div className={s.articleMeta}>
            <span>{typeLabel(site.type, lang)}</span>
            <span aria-hidden="true">·</span>
            <span>{eraLabel(site.era, lang)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {stages.length} {t('stages')}
            </span>

            {hasHindi && (
              <span
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  border: '1px solid var(--glass-line)',
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                }}
                role="group"
                aria-label={t('contentLanguage')}
              >
                <button
                  className={s.chip}
                  aria-pressed={!hi}
                  onClick={() => setLang('en')}
                  style={{
                    borderRadius: 0,
                    border: 0,
                    color: !hi ? 'var(--ochre)' : undefined,
                    background: !hi ? 'rgba(222,164,68,0.16)' : 'transparent',
                  }}
                >
                  EN
                </button>
                <button
                  className={s.chip}
                  aria-pressed={hi}
                  onClick={() => setLang('hi')}
                  style={{
                    borderRadius: 0,
                    border: 0,
                    color: hi ? 'var(--ochre)' : undefined,
                    background: hi ? 'rgba(222,164,68,0.16)' : 'transparent',
                  }}
                >
                  हिं
                </button>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className={s.body}>
        {/* The site's own description, doing the work of a standfirst. */}
        {hi && site.descriptionHi ? (
          <p className={`${s.standfirst} ${s.standfirstHi}`}>{site.descriptionHi}</p>
        ) : (
          <p className={s.standfirst}>{site.description}</p>
        )}

        {stages.map((stage, i) => (
          <section key={stage.title} className={s.stage}>
            <div className={s.stageNum} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </div>

            {hi && stage.titleHi ? (
              <h2 className={s.stageTitleHi}>{stage.titleHi}</h2>
            ) : (
              <h2 className={s.stageTitle}>{stage.title}</h2>
            )}

            {hi && stage.bodyHi ? (
              <p className={s.stageBodyHi}>{stage.bodyHi}</p>
            ) : (
              <p className={s.stageBody}>{stage.body}</p>
            )}

            {stage.image === null && (
              <div className={s.stageImagePending}>{t('stageImagePending')}</div>
            )}
          </section>
        ))}

        {stages.length === 0 && <p className={s.stageBody}>{t('noNarrativeYet')}</p>}

        {/* ================= FOOT ================= */}
        <footer className={s.articleFoot}>
          <p className={s.footNote}>{t('writtenFromRecord')}</p>
          <a className={s.footLink} href={href({ name: 'site', id: site.id })}>
            {t('openFullRecord')} <span aria-hidden="true">→</span>
          </a>
        </footer>
      </div>
    </article>
  )
}

/** Re-exported so a future "random story" control has the list. */
export const STORY_IDS: string[] = SITES.filter((x) => (x.story?.length ?? 0) > 0).map(
  (x) => x.id
)
