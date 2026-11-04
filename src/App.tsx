/* ============================================================
   App.tsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â the routed composition root.

   WHAT CHANGED AND WHY
   The first version of v2 treated the whole app as one screen: a
   canvas plus panels sliding over it, with no navigation at all.
   That model failed on contact with the content. A five-part
   narrative, a history, twelve quick facts, a Hindi translation and
   a source list do not fit in a 468px drawer ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 87% of the archive's
   writing was invisible because the container was too small.

   So pages came back. The rule now is:

     the URL is the page, and every page has room.

   There is still exactly one canvas in the application and it still
   never reloads anything ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â navigation swaps what is drawn on top of
   it. What changed is that the top layer is a document rather than a
   drawer.

   THIS FILE DECIDES WHAT IS ON SCREEN AND NOTHING ELSE
   No data lives here. Each page reads the store and the data module
   directly; App only chooses which one to mount.
   ============================================================ */

import { useCallback } from 'react'
import { useRoute, navigate, type Route } from './router'
import { SiteNav } from './ui/SiteNav'
import { HeroScreen } from './ui/HeroScreen'
import { SitesIndex } from './ui/SitesIndex'
import { SitePage } from './ui/SitePage'
import { StoriesIndex } from './ui/StoriesIndex'
import { StoryPage } from './ui/StoryPage'
import { TimelinePage } from './ui/TimelinePage'
import { MapPage } from './ui/MapPage'
import { JourneyPage } from './ui/JourneyPage'
import { QuizPage } from './ui/QuizPage'
import { AboutPage } from './ui/AboutPage'
import { PipelinePage } from './ui/PipelinePage'

export default function App() {
  const route = useRoute()

  /* ---- the landing screen is the only route with no chrome ----
     It is a full-bleed composition; a nav bar across the top of it
     would cut the headline off. Everything else wears SiteNav. */
  const handleEnter = useCallback((siteId?: string) => {
    navigate(siteId ? { name: 'site', id: siteId } : { name: 'sites' })
  }, [])

  if (route.name === 'home') {
    return <HeroScreen onEnter={handleEnter} />
  }

  return (
    <>
      <SiteNav route={route} back={backTarget(route)} />
      <Page route={route} />
    </>
  )
}

/** Which page is behind us, for the "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ãƒâ€šÃ‚Â Back" affordance in the nav. */
function backTarget(route: Route): { label: string; to: Route } | undefined {
  switch (route.name) {
    case 'site':
      return { label: 'All sites', to: { name: 'sites' } }
    case 'story':
      return { label: 'All stories', to: { name: 'stories' } }
    default:
      return undefined
  }
}

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'sites':
      return <SitesIndex />
    case 'site':
      return <SitePage id={route.id} />
    case 'stories':
      return <StoriesIndex />
    case 'story':
      return <StoryPage id={route.id} />
    case 'timeline':
      return <TimelinePage />
    case 'map':
      return <MapPage />
    case 'journey':
      return <JourneyPage />
    case 'quiz':
      return <QuizPage />
    case 'about':
    case 'pipeline':
      return <PipelinePage />
      return <AboutPage />
    default:
      // parseRoute should never produce this, but an exhaustive default
      // means a new Route member cannot ship without a page behind it.
      return <SitesIndex />
  }
}
