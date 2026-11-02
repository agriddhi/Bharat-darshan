/* ============================================================
   ui/QuizPage.tsx — what you actually retained.

   WHERE THE QUESTIONS COME FROM
   Every one of the 75 questions is in sites.json already — written
   for v1, carried through the migration untouched. Nothing here is
   generated at runtime: the question, its four options, which option
   is correct and the explanation that follows are all data fields.
   A quiz that invented its own answer key would be the one place in
   this project asserting something with no source behind it.

   WHY THE PHOTOGRAPH IS CROPPED HARD
   An uncropped monument photograph gives the answer away — you read
   the silhouette and you are done before you read the question. The
   image is scaled to 260% and offset by a value derived from the
   question's own index, so the same site never crops to the same
   fragment twice. It is context, not the puzzle.

   REVEAL, THEN A LINK
   Getting it wrong is the useful case, so the explanation always
   follows the answer, and it links to the full record rather than
   ending there — the quiz is an entry point to the archive, not a
   score screen.
   ============================================================ */

import { useMemo, useState } from 'react'
import s from './Pages.module.css'
import { SITES } from '../data/sites'
import { href } from '../router'
import type { QuizItem, Site } from '../data/types'

/** Questions per session. Short enough to finish, long enough to mean
 *  something. */
const SESSION = 10

interface PoolEntry {
  site: Site
  item: QuizItem
}

/** Every question the archive holds, paired with the site it belongs to. */
function buildPool(): PoolEntry[] {
  const out: PoolEntry[] = []
  for (const site of SITES) {
    for (const item of site.quiz ?? []) out.push({ site, item })
  }
  return out
}

/** Fisher–Yates. Math.random is fine here: the order of a quiz is not
 *  a thing anyone needs to reproduce. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LETTERS = ['A', 'B', 'C', 'D']

export function QuizPage() {
  const pool = useMemo(buildPool, [])

  const [session, setSession] = useState<PoolEntry[]>(() => shuffle(pool).slice(0, SESSION))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [marks, setMarks] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState(false)

  const current = session[index]

  const answer = (choice: number) => {
    if (picked !== null || !current) return
    setPicked(choice)

    const right = choice === current.item.answer
    if (right) {
      setCorrect((c) => c + 1)
      setStreak((st) => {
        const next = st + 1
        setBestStreak((b) => Math.max(b, next))
        return next
      })
      setMarks((m) => [...m, 'right'])
    } else {
      setStreak(0)
      setMarks((m) => [...m, 'wrong'])
    }
  }

  const next = () => {
    setPicked(null)
    if (index + 1 >= session.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  const restart = () => {
    setSession(shuffle(pool).slice(0, SESSION))
    setIndex(0)
    setPicked(null)
    setCorrect(0)
    setStreak(0)
    setBestStreak(0)
    setMarks([])
    setDone(false)
  }

  /* ---- session finished ---- */
  if (done) {
    const pct = session.length ? Math.round((correct / session.length) * 100) : 0
    return (
      <div className={s.page}>
        <div className={s.wrap}>
          <div className={s.result}>
            <div className={s.resultScore}>
              {correct}/{session.length}
            </div>
            <div className={s.resultOf}>
              {pct}% correct · best streak {bestStreak}
            </div>

            <h1 className={s.resultTitle}>
              {pct >= 80
                ? 'You were paying attention.'
                : pct >= 50
                  ? 'A fair start — the stories will fill the gaps.'
                  : 'The archive is there when you want it.'}
            </h1>

            <p className={s.resultBody}>
              {pct >= 80
                ? 'You know these places well. The stories section goes deeper on the ones you have not opened yet.'
                : 'Every question above links to the record it came from. Read the ones you missed and run the quiz again — the questions are reshuffled each time.'}
            </p>

            <div className={s.btnRow} style={{ justifyContent: 'center' }}>
              <button className={s.btnPrimary} onClick={restart}>
                Run another {SESSION}
              </button>
              <a className={s.btnGhost} href={href({ name: 'stories' })} style={{ textDecoration: 'none' }}>
                Read the stories
              </a>
              <a className={s.btnGhost} href={href({ name: 'sites' })} style={{ textDecoration: 'none' }}>
                Browse all sites
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---- no questions at all (defensive: data currently has 75) ---- */
  if (!current) {
    return (
      <div className={s.page}>
        <div className={s.wrap}>
          <div className={s.empty}>
            <h2 className={s.emptyTitle}>No questions in the archive</h2>
            <p className={s.emptyBody}>
              This build has no quiz items, so there is nothing to ask. The archive does
              not invent questions to fill the space.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const photo = current.site.media.find((m) => m.kind === 'photo') ?? current.site.media[0]

  // Deterministic per question so re-renders do not jitter the crop,
  // but varied enough that two questions rarely share a framing.
  const ox = 12 + ((index * 37) % 60)
  const oy = 10 + ((index * 53) % 55)

  const revealed = picked !== null

  return (
    <div className={s.page}>
      {/* ================= HEADER ================= */}
      <header className={s.head}>
        <img className={s.headPhoto} src="media/sanchi.jpg" alt="" aria-hidden="true" />
        <div className={s.headScrim} />
        <div className={s.headInner}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowLine} aria-hidden="true" />
            <span>Quiz</span>
          </div>
          <h1 className={s.title}>
            {session.length} questions,
            <span className={s.titleEm}>drawn from the archive.</span>
          </h1>
          <p className={s.lede}>
            Every question, option and explanation below comes straight from the data
            file — the same text the site pages cite. Answer, then read where the fact
            came from.
          </p>
        </div>
      </header>

      <div className={s.wrap}>
        {/* ================= STATUS ================= */}
        <div className={s.quizTop}>
          <div className={`${s.streak} ${streak >= 3 ? s.streakOn : ''}`}>
            {streak >= 3 ? '🔥 ' : ''}
            {streak} in a row
          </div>

          <div className={s.progress} role="progressbar" aria-label="Quiz progress">
            {session.map((_, i) => (
              <span
                key={i}
                className={`${s.progressPip} ${
                  marks[i] === 'right'
                    ? s.progressPipDone
                    : marks[i] === 'wrong'
                      ? s.progressPipWrong
                      : ''
                }`}
              />
            ))}
          </div>

          <span className={s.sectionNote}>
            {index + 1} / {session.length}
          </span>
        </div>

        {/* ================= QUESTION ================= */}
        <div className={s.question}>
          <div className={s.qPhoto}>
            {photo && (
              <img
                className={s.qPhotoImg}
                src={photo.src}
                alt=""
                aria-hidden="true"
                style={{ left: `-${ox}%`, top: `-${oy}%` }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <div className={s.qPhotoScrim} />
            <div className={s.qPhotoTag}>
              Detail · {current.site.state}
            </div>
          </div>

          <div className={s.qBody}>
            <h2 className={s.qText}>{current.item.q}</h2>

            <div className={s.options}>
              {current.item.options.map((opt, i) => {
                const isAnswer = i === current.item.answer
                const isPicked = picked === i

                let cls = ''
                if (revealed && isAnswer) cls = s.optionRight
                else if (revealed && isPicked && !isAnswer) cls = s.optionWrong

                return (
                  <button
                    key={opt}
                    className={`${s.option} ${cls}`}
                    disabled={revealed}
                    onClick={() => answer(i)}
                  >
                    <span className={s.optionKey} aria-hidden="true">
                      {revealed && isAnswer ? '✓' : revealed && isPicked ? '✕' : LETTERS[i]}
                    </span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>

            {/* ---- reveal ---- */}
            {revealed && (
              <div className={s.reveal}>
                <div className={s.revealTitle}>
                  {picked === current.item.answer ? 'Correct' : 'Not quite'}
                </div>
                <p className={s.revealBody}>{current.item.explain}</p>
                <a
                  className={s.revealLink}
                  href={href({ name: 'site', id: current.site.id })}
                >
                  Open the record for {current.site.title} →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ---- advance ---- */}
        <div className={s.btnRow} style={{ marginTop: 24 }}>
          <button className={s.btnPrimary} disabled={!revealed} onClick={next}>
            {index + 1 >= session.length ? 'See your score' : 'Next question'}
          </button>
          <button className={s.btnGhost} onClick={restart}>
            Shuffle again
          </button>
        </div>
      </div>
    </div>
  )
}
