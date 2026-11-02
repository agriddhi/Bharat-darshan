/* ============================================================
   state/store.ts — one store for the whole app.

   Why zustand rather than context: the 3D scene reads and writes this
   state from inside the render loop (a marker's glow depends on whether
   it is filtered in), and context would re-render the entire canvas
   tree on every keystroke in the search box. A zustand store lets the
   scene subscribe to just the slice it needs.

   THE JOURNEY RULE IS ENFORCED HERE, NOT IN THE UI.
   v1 allowed a maximum of 5 stops. That limit lives in addToJourney so
   it cannot be bypassed by a button someone forgets to disable — the
   disabled state in the panel is a courtesy, this is the actual rule.
   ============================================================ */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Filters } from '../data/types'

// Re-exported so components can keep importing from the store without
// reaching into data/. The definition itself lives in data/types.ts.
export type { Filters }

/** Maximum journey stops. Carried over from v1 unchanged. */
export const JOURNEY_MAX = 5

export type ViewId = 'world' | 'story' | 'passport' | 'quiz' | 'credits'

/** No filters set — every site matches. */
export const EMPTY_FILTERS: Filters = {
  region: null,
  type: null,
  era: null,
  hasDocument: false,
}

interface Store {
  /* --- what is on screen --- */
  activeView: ViewId
  selectedId: string | null
  hoveredId: string | null
  panelOpen: boolean

  /* --- what the user is looking for --- */
  filters: Filters
  query: string

  /* --- the route --- */
  journey: string[]
  playing: boolean
  /** Index of the stop currently framed by the camera during playback. */
  playIndex: number

  /**
   * Sites the user has marked as visited. Separate from `journey` in v1
   * too — a route stop and a "I have seen this" tick are different
   * claims, and four of the five badges are written against this list
   * rather than against the route. Collapsing them would silently
   * change which badges earn.
   */
  visited: string[]

  /* --- quiz --- */
  quizOpen: boolean

  /* --- actions --- */
  setView: (v: ViewId) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setPanel: (open: boolean) => void

  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  clearFilters: () => void
  setQuery: (q: string) => void

  addToJourney: (id: string) => boolean
  removeFromJourney: (id: string) => void
  clearJourney: () => void
  setPlaying: (p: boolean) => void
  setPlayIndex: (i: number) => void

  /** v1's mark-as-visited toggle. */
  toggleVisited: (id: string) => void
  isVisited: (id: string) => boolean

  setQuizOpen: (open: boolean) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      activeView: 'world',
      selectedId: null,
      hoveredId: null,
      panelOpen: false,

      filters: { ...EMPTY_FILTERS },
      query: '',

      journey: [],
      playing: false,
      playIndex: 0,
      visited: [],

      quizOpen: false,

      setView: (v) => set({ activeView: v, panelOpen: v !== 'world' }),

      select: (id) =>
        set({
          selectedId: id,
          // selecting a site opens its story; clearing one returns to the
          // bare world rather than leaving a stale panel up
          activeView: id ? 'story' : 'world',
          panelOpen: id !== null,
        }),

      hover: (id) => set({ hoveredId: id }),

      setPanel: (open) => set({ panelOpen: open, activeView: open ? get().activeView : 'world' }),

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      clearFilters: () => set({ filters: { ...EMPTY_FILTERS }, query: '' }),

      setQuery: (q) => set({ query: q }),

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

      clearJourney: () => set({ journey: [], playing: false, playIndex: 0 }),

      setPlaying: (p) => set({ playing: p }),
      setPlayIndex: (i) => set({ playIndex: i }),

      toggleVisited: (id) =>
        set((s) => ({
          visited: s.visited.includes(id)
            ? s.visited.filter((x) => x !== id)
            : [...s.visited, id],
        })),

      isVisited: (id) => get().visited.includes(id),

      setQuizOpen: (open) => set({ quizOpen: open, activeView: open ? 'quiz' : 'world' }),
    }),
    {
      name: 'bharat-darshan-v2',
      // The journey AND the visited list survive a refresh — both are
      // things a user built up over a session and would be annoyed to
      // lose. Filters, query and the selected site are session
      // behaviour: restoring them would make the app reopen in a state
      // the user did not ask for.
      partialize: (s) => ({ journey: s.journey, visited: s.visited }),
      version: 1,
    }
  )
)

/** Convenience selectors — keeps components from re-rendering on unrelated changes. */
export const useJourney = () => useStore((s) => s.journey)
export const useIsInJourney = (id: string) =>
  useStore((s) => s.journey.includes(id))
