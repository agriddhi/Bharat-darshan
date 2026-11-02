/* ============================================================
   ui/HintBar.tsx — the one line that teaches the controls.

   "drag to orbit · scroll to zoom · click a site"

   It fades to about a third of its opacity after ten seconds rather
   than disappearing. Vanishing hints are worse than dim ones: a
   returning user who forgot the controls has nothing to re-read, and
   has to reload the page to find out. A dim hint is still there when
   they look for it and does not compete with the scene when they do
   not.
   ============================================================ */

import { useEffect, useState } from 'react'
import s from './HintBar.module.css'

export function HintBar() {
  const [faded, setFaded] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setFaded(true), 10_000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className={`${s.bar} ${faded ? s.faded : ''}`} role="note">
      <span>
        <span className={s.key}>drag</span> to orbit
      </span>
      <span className={s.sep}>·</span>
      <span>
        <span className={s.key}>scroll</span> to zoom
      </span>
      <span className={s.sep}>·</span>
      <span>
        <span className={s.key}>click</span> a site
      </span>
    </div>
  )
}
