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

import { useState } from 'react'
import s from './Editorial.module.css'
import { getSite, SITES, titleCase } from '../data/sites'
import { href } from '../router'

interface Props {
  id: string
}

type Lang = 'en' | 'hi'

export function StoryPage({ id }: Props) {
  const site = getSite(id)
  const [lang, setLang] = useState<Lang>('en')

  if (!site) {
    return (
      <div className={s.page}>
        <div className={s.empty}>
          <h2 className={s.emptyTitle}>No story matches “{id}”</h2>
          <p className={s.emptyBody}>
            The link may be mistyped. Every narrative in the archive is listed on the
            stories page.
          </p>
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
              {site.region} · {site.state}
            </span>
          </div>

          <h1 className={s.articleTitle}>{site.title}</h1>

          {firstStage && (
            <div className={s.articleSub}>
              {hi && firstStage.titleHi ? firstStage.titleHi : firstStage.title} — and
              four more stages
            </div>
          )}

          <div className={s.articleMeta}>
            <span>{titleCase(site.type)}</span>
            <span aria-hidden="true">·</span>
            <span>{site.era}</span>
            <span aria-hidden="true">·</span>
            <span>{stages.length} stages</span>

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
                aria-label="Content language"
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
              <div className={s.stageImagePending}>
                Image for this stage — TODO. v1 carried no licensed photograph for it
                and none has been sourced since.
              </div>
            )}
          </section>
        ))}

        {stages.length === 0 && (
          <p className={s.stageBody}>
            This record has no written narrative yet. The archive does not summarise a
            site it has no account for — see the site page for the verified facts and
            sources that do exist.
          </p>
        )}

        {/* ================= FOOT ================= */}
        <footer className={s.articleFoot}>
          <p className={s.footNote}>
            Written from the record. The site page carries the official source, every
            citation, the image licence and the quick facts.
          </p>
          <a className={s.footLink} href={href({ name: 'site', id: site.id })}>
            Open the full record <span aria-hidden="true">→</span>
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
