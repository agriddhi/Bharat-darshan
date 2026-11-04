# 🏛️ Bharat Darshan — Heritage Atlas India

> **Twenty-five monuments, one atlas of India.**

A browsable, bilingual heritage archive of 25 Indian monuments — each with a photograph, verified sources, folklore, nearby attractions, a five-stage narrative, and an official citation. Built for **Blithchron '27 · IIT Gandhinagar**, Track 2: *Digital Revitalisation of Unstructured Cultural & Architectural Heritage Archives*.

🌐 **Live:** `http://localhost:5173/` · **Repo:** [agriddhi/Bharat-darshan](https://github.com/agriddhi/Bharat-darshan)

---

## What It Does

Bharat Darshan is a **geospatial, interactive heritage atlas** — not a static report. You explore India's monuments on a map, walk a chronological timeline, read verified folklore, track your own journey, and test your knowledge with a quiz.

| Feature | What it is |
|---|---|
| 🗺️ **Heritage Map** | 25 monuments as teardrop pins on Leaflet. Region + type filters. Journey route as dashed polyline. Click any pin → photo, facts, actions. |
| 📜 **Folklore & Nearby** | 640–960 word verified folklore notes per site. Local legends + nearby attractions. Each cites Wikipedia. Dedicated pages per site. |
| ⏱️ **Timeline** | All 25 sites in chronological order across 4 era bands (Ancient · Medieval · Mughal · Colonial). |
| 📖 **Stories** | Five-stage narrative per monument. Standfirst, stages, Hindi translation. Same text on site page — no duplication. |
| 🚶 **Journey Route** | Mark visited. Add to journey. Dashed polyline with numbered pins on the map. Distance between stops. |
| 🧠 **Quiz** | 75 questions (3 per site). Score tracking. Bilingual. |
| 🌐 **Bilingual** | EN \| हिं toggle on every page. Chrome + content translated. `pick()` falls back to English. |

---

## Running It

```bash
npm install     # first time only
npm run dev     # opens on http://localhost:5173
npm run build   # type-checks, then writes the site into dist/
```

`npm run build` runs the type checker first. If it finishes without errors, the code is sound. The `dist/` output is plain files — host on any static host with no server, no database, no account.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  src/data/sites.json       THE ONE DATA FILE                │
│  25 monuments · 102,987 chars prose · 25 photos            │
│  Nothing else in the app contains any writing.              │
└──────────────────────┬──────────────────────────────────────┘
                       │ read once at startup
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  src/data/sites.ts         THE INDEX AND THE RULES          │
│  • finds a site by name                                     │
│  • isShown() — single answer to "does this match?"          │
│  • filter lists (regions, types, eras)                       │
└──────────────┬──────────────────────┬───────────────────────┘
               ▼                      ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│  src/state/store.ts     │   │  src/router.tsx              │
│  WHAT YOU HAVE PICKED   │   │  WHICH PAGE TO SHOW          │
│  · filters + search     │   │  reads #hash, mounts page    │
│  · route (max 5)        │   │  hand-rolled, ~60 lines      │
│  · visited sites        │   │  no react-router needed      │
│  · language (persisted) │   └──────────────────────────────┘
└────────────────────────┘             │
               └──────────────┬────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  src/ui/                    THE PAGES (11 total)            │
│  HeroScreen · SitesIndex · SitePage · StoriesIndex         │
│  StoryPage · TimelinePage · MapPage · FolklorePage          │
│  FolkloreSitePage · JourneyPage · QuizPage · AboutPage      │
│  PipelinePage · SiteNav                                      │
└─────────────────────────────────────────────────────────────┘
```

**The arrows only ever point down.** Pages read from the data; they never write to it. That is why a page can never show a fact that is not in the file.

---

## Pages

| Address | What it is |
|---|---|
| `#/` | Landing screen. Full-screen photograph, one button into the archive. |
| `#/sites` | All 25 sites as photographs, with filters and search. |
| `#/site/…` | One monument in full — story, history, facts, sources, credits, folklore. |
| `#/stories` | All stories as long-form articles. |
| `#/story/…` | One narrative, given a page of its own. |
| `#/timeline` | All 25 sites in chronological order, in four era bands. |
| `#/map` | All 25 sites on a Leaflet map. The one page that fetches tiles. |
| `#/folklore` | Folklore index — card grid with photos, region tags, READ buttons. |
| `#/folklore/…` | Single site folklore — 640–960 word full prose, legend + nearby. |
| `#/journey` | Build a route of up to five stops; see how far apart they are. |
| `#/quiz` | 75 questions drawn from the archive. |
| `#/about` | Photo credits, source index, and what we chose not to do. |
| `#/pipeline` | How the archive was made: pipeline, schema, rules. |

---

## The Colours

Defined once in `src/tokens.css`. Ochre is the only interactive accent.

```
soft stone  #CDC8B8    ochre      #DEA044    terracotta #BF8250
rust        #9D473A    steel blue #416A81    ink navy   #16243D
```

The ink navy and region moods are approximations — the brief gave Pantone codes, not hex. They are chosen values, not measured samples.

---

## What We Deliberately Did Not Do

An archive is judged on whether it invents things. Here is where we could have and did not.

- **No invented facts.** No dates, dimensions or quotations were added to fill a gap.
- **Folklore, where verified.** The schema has a `folkloreNote` field. It was `null` on all 25 sites because fabricating folk narrative would break the project's premise. It now carries a sourced note for every site — local legend and nearby attractions — each citing Wikipedia. Where a legend could not be verified, the field stays `null`.
- **No unverified UNESCO labels.** A site is marked as a World Heritage property only where an official inscription reference exists in the data.
- **20 TODOs stay TODO.** No invented dates, numbers, quotes, sources, or UNESCO labels.
- **No machine translation.** Hindi prose exists where it was written. Where it wasn't, the English is shown via `pick()` fallback.

---

## Data

The content began life in a static site's `js/sites-data.js`. It was moved into `src/data/sites.json` field by field by `tools/migrate_sites.mjs`.

| | |
|---|---|
| Sites | 25 across 6 regions and 7 types |
| Readable prose | 102,987 characters |
| — of which stories | 57,162 (125 stages, 5 per site, English and Hindi) |
| — of which history | 16,650 (25 entries, English and Hindi) |
| — of which quiz | 13,316 (75 questions, each with its own explanation) |
| — of which sources | 4,787 |
| — of which folklore | ~19,000 (25 entries, 640–960 words each) |
| Quick facts | 127 individual facts across all 25 sites |
| Source links | 47, every one verified as a real, reachable page |
| Photographs | 25, each with its own photographer and licence row |

---

## Built For

**Blithchron '27 · IIT Gandhinagar · Track 2** — Digital Revitalisation of Unstructured Cultural & Architectural Heritage Archives.

Evaluation: Technical Execution & Code Quality 40%, System Architecture & Scalability 30%, UI/UX 20%, Innovation & Problem Fit 10%.

Innovation pathway: **Geospatial / Immersive Web** — location-based interactive mapping with travel routes, folklore, and architectural discovery.

---

## Team

| Role | Name & Contact |
|---|---|
| TODO | TODO: name and contact |
| TODO | TODO: name and contact |
| TODO | TODO: name and contact |

---

*Built with React 18, TypeScript, Vite, Leaflet, Zustand. No react-router — hand-rolled hash router (~60 lines).*
