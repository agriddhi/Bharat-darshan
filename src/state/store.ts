/* ============================================================
   state/store.ts — one store for the whole app.

   Why zustand rather than context: several surfaces read and write
   this state independently — the archive index filters, site pages
   add stops, the journey page
   removes them. With context, typing one character in the search
   box would re-render every one of those. With zustand each
   subscribes to the slice it actually reads and the rest stay
   still.

   What does NOT read this store: the timeline. It deliberately
   shows all twenty-five sites in chronological order regardless of
   the index filters, because a timeline with three sites on it has
   no span to show — its whole value is seeing the shape of the
   whole archive at once. That is a design choice rather than an
   oversight, and it is why no filter state is imported there.

   WHAT THIS STORE USED TO HOLD AND NO LONGER DOES
   It previously carried activeView, panelOpen, selectedId,
   hoveredId, playing, playIndex and quizOpen — the machinery of a
   single-screen app where a drawer slid over a canvas. When the
   panels became pages, the URL replaced all of it: there is no
   "current view" to store because the address bar already says.
   Deleting those fields rather than leaving them dormant is the
   point — dead state is state someone has to reason about on every
   future edit.

   THE JOURNEY RULE IS ENFORCED HERE, NOT IN THE UI.
   v1 allowed a maximum of 5 stops. That limit lives in addToJourney so
   it cannot be bypassed by a button someone forgets to disable — the
   disabled state on the page is a courtesy, this is the actual rule.
   ============================================================ */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Filters } from '../data/types'

// Re-exported so components can keep importing from the store without
// reaching into data/. The definition itself lives in data/types.ts.
export type { Filters }

/** Maximum journey stops. Carried over from v1 unchanged. */
export const JOURNEY_MAX = 5

/** No filters set — every site matches. */
export const EMPTY_FILTERS: Filters = {
  region: null,
  type: null,
  era: null,
  hasDocument: false,
}

/**
 * Which language the interface and the prose are read in.
 *
 * The archive has carried Hindi since v1 — nameHi, descriptionHi,
 * historyHi and a titleHi/bodyHi pair on all 125 story stages — but
 * nothing ever read it. The data was bilingual and the app was not.
 * This field is the switch that was missing, not new content.
 *
 * `en` is the default because the citations, source titles and
 * credit lines are English in the record, and a reader who has not
 * asked for Hindi should not be handed a page they cannot read.
 */
export type Lang = 'en' | 'hi'

interface Store {
  /* --- what the reader is looking for --- */
  filters: Filters
  query: string

  /* --- how they want to read it --- */
  lang: Lang

  /* --- what they have built --- */
  journey: string[]
  /**
   * Sites the user has marked as visited. Separate from `journey` in
   * v1 too — a route stop and a "I have seen this" tick are different
   * claims, and four of the five badges are written against this list
   * rather than against the route. Collapsing them would silently
   * change which badges earn.
   */
  visited: string[]

  /* --- actions --- */
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  clearFilters: () => void
  setQuery: (q: string) => void

  /** Swap every translated string on screen. */
  setLang: (lang: Lang) => void

  /** Returns false when already present or when the route is full. */
  addToJourney: (id: string) => boolean
  removeFromJourney: (id: string) => void
  clearJourney: () => void

  /** v1's mark-as-visited toggle. */
  toggleVisited: (id: string) => void
  isVisited: (id: string) => boolean
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      filters: { ...EMPTY_FILTERS },
      query: '',

      lang: 'en',

      journey: [],
      visited: [],

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      clearFilters: () => set({ filters: { ...EMPTY_FILTERS }, query: '' }),

      setQuery: (q) => set({ query: q }),

      setLang: (lang) => set({ lang }),

      /* ---- journey, max 5, enforced here ---- */
      addToJourney: (id) => {
        const { journey } = get()
        if (journey.includes(id)) return false
        if (journey.length >= JOURNEY_MAX) return false // the rule
        set({ journey: [...journey, id] })
        return true
      },

      removeFromJourney: (id) =>
        set((s) => ({ journey: s.journey.filter((x) => x !== id) })),

      clearJourney: () => set({ journey: [] }),

      toggleVisited: (id) =>
        set((s) => ({
          visited: s.visited.includes(id)
            ? s.visited.filter((x) => x !== id)
            : [...s.visited, id],
        })),

      isVisited: (id) => get().visited.includes(id),
    }),
    {
      name: 'bharat-darshan-v2',
      // The journey AND the visited list survive a refresh — both are
      // things a user built up over a session and would be annoyed to
      // lose. Filters and query are session behaviour: restoring them
      // would make the app reopen in a state the reader did not ask
      // for, which is the same reasoning v1 used.
      //
      // Language is persisted for the opposite reason to filters: it
      // is not a transient action, it is who the reader is. Resetting
      // a Hindi reader to English on every visit would be the most
      // annoying bug this app could ship.
      partialize: (s) => ({
        journey: s.journey,
        visited: s.visited,
        lang: s.lang,
      }),
      version: 1,
    }
  )
)
