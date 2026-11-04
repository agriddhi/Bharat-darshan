# Bharat Darshan — Heritage Atlas India

A browsable archive of 25 Indian monuments. Every entry carries a photograph, the
licence that permits its use, the official record it was checked against, and a
written account of what the place is and why it matters.

Built for **Blithchron '27 · IIT Gandhinagar**, Track 2 — *Digital Revitalisation
of Unstructured Cultural & Architectural Heritage Archives*.

---

## Running it

Three commands. Nothing to install beyond Node.

```bash
npm install     # first time only
npm run dev     # opens on http://localhost:5173
npm run build   # checks for errors, then writes the site into dist/
```

`npm run build` runs the type checker first, so if it finishes without an error
message the code is sound. The output in `dist/` is plain files — it can be
hosted on any static host with no server, no database and no account.

---

## How it is put together

There is **one file that holds all the content**, and everything else is a way of
reading it.

```
  ┌──────────────────────────────────────────────────────────┐
  │  src/data/sites.json          THE ONE DATA FILE          │
  │  25 monuments · 102,987 characters of prose · 25 photos │
  │  Nothing else in the app contains any writing.           │
  └──────────────────────────────────────────────────────────┘
                              │
                              │ read once at startup
                              ▼
  ┌──────────────────────────────────────────────────────────┐
  │  src/data/sites.ts            THE INDEX AND THE RULES    │
  │  • finds a site by name                                 │
  │  • isShown() — the single answer to "does this match?"   │
  │  • the filter lists (regions, types, eras)               │
  └──────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
  ┌────────────────────────┐      ┌──────────────────────────┐
  │  src/state/store.ts    │      │  src/router.tsx          │
  │  WHAT YOU HAVE PICKED  │      │  WHICH PAGE TO SHOW      │
  │  · filters and search  │      │  reads the #hash in the  │
  │  · your route (max 5)  │      │  address bar and mounts  │
  │  · sites you visited   │      │  the matching page       │
  └────────────────────────┘      └──────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
  ┌──────────────────────────────────────────────────────────┐
  │  src/ui/                      THE PAGES                  │
  │  HeroScreen · SitesIndex · SitePage · StoriesIndex       │
  │  StoryPage · TimelinePage · JourneyPage · QuizPage       │
  │  AboutPage · SiteNav                                    │
  └──────────────────────────────────────────────────────────┘
                              │
                              ▼
  ┌──────────────────────────────────────────────────────────┐
  │  src/i18n.ts                  THE LANGUAGE               │
  │  one dictionary, EN and हिं, for every heading and label │
  │  the pages call it; it picks the *Hi fields from the data│
  └──────────────────────────────────────────────────────────┘
                              │
                              ▼
  ┌──────────────────────────────────────────────────────────┐
  │  src/tokens.css               THE COLOURS AND TYPE       │
  │  every value in one file · ochre is the only accent      │
  └──────────────────────────────────────────────────────────┘
```

**The arrows only ever point down.** Pages read from the data; they never write
to it. That is why a page can never show a fact that is not in the file — there
is nowhere for it to come from.

### Two things worth explaining plainly

**Why is there a separate `store`?**
Because the same choices show up in more than one place. Filter the archive to
South India, navigate to a site and come back — the filter has to still be
there. Rather than each page keeping its own copy of that choice — which is how
two pages end up disagreeing — there is one place it is kept, and both pages
read it. The language toggle lives here for the same reason: the switch in the
nav and the switch on an article have to be the same switch.

**Why is there a separate `router`?**
So that every page has its own web address. `#/site/taj-mahal` can be sent to
somebody in a message and it opens that page. It is about 60 lines and adds no
library, which means the site still works on any static host without needing the
host to be configured for it.

---

## The pages

| Address | What it is |
|---|---|
| `#/` | The landing screen. A full-screen photograph changing slowly, with the archive behind one button. |
| `#/sites` | Every site as a photograph, with filters and a search box. |
| `#/site/…` | One monument in full — story, history, facts, sources, credits. |
| `#/stories` | The same writing, set as long-form articles. |
| `#/story/…` | One narrative, given a page of its own. |
| `#/timeline` | All 25 sites in the order they were built, in four era bands. |\n| `#/map` | All 25 sites on a map. The one page that fetches map tiles. |
| `#/journey` | Build a route of up to five stops; see how far apart they are. |
| `#/quiz` | 75 questions drawn from the archive. |
| `#/about` | Photo credits, the source index, and what we chose not to do. |\n| `#/pipeline` | How the archive was made: the pipeline, the schema, the rules. |

---

## Where the words come from

The content began life in a static site's `js/sites-data.js`. It was moved into
`src/data/sites.json` field by field by `tools/migrate_sites.mjs`.

**Run it like this:**

```bash
node tools/migrate_sites.mjs
```

It writes two things: `src/data/sites.json` and `MIGRATION.md`.
`MIGRATION.md` is *generated* rather than written by hand on purpose — a
hand-written migration note describes what someone intended the script to do,
and these two drift apart within a week.

The script also **prints any problem it finds** rather than quietly fixing it.
On the last run: 25 sites read, 25 written, 0 problems.

**What is in the file** — every figure below is counted by
`tools/` scripts against `sites.json` and can be reproduced:

| | |
|---|---|
| Sites | 25 across 6 regions and 7 types |
| Readable prose | 102,987 characters |
| — of which stories | 57,162 (125 stages, 5 per site, English and Hindi) |
| — of which history | 16,650 (25 entries, English and Hindi) |
| — of which quiz | 13,316 (75 questions, each with its own explanation) |
| — of which sources | 4,787 |
| Quick facts | 127 individual facts across all 25 sites |
| Source links | 47, every one verified as a real, reachable page |
| Photographs | 25, each with its own photographer and licence row |

*"Readable prose" means the fields a person actually reads — descriptions,
stories, histories, quiz text, citations, facts and titles. The raw file is
larger than that because it also holds image paths and identifiers, which is
why quoting a single total without saying how it was counted is not useful.*

**A note on why pages exist.** Before this version, a site was shown in a
468-pixel side drawer that rendered roughly **7,700** characters. The file holds
**102,987**. The five-part stories, the histories, the Hindi text and the quiz
were all written and none of them were on screen. Pages are why they are visible
now — that is the whole reason this version exists in the shape it does.

---

## The colours

Defined once, in `src/tokens.css`. Read that file before changing anything.

Five values were printed on a reference swatch the team was given, so they are
exact:

```
soft stone  #CDC8B8    ochre      #DEA044    terracotta #BF8250
rust        #9D473A    steel blue #416A81
```

**Ochre is the only interactive accent.** If something can be clicked, it is
ochre, and nothing else competes for that job.

Two honesty notes that should survive into any write-up:

- **The ink navy and the six region moods are approximations.** The brief gave
  Pantone codes rather than hex values; we converted them. They are chosen
  values, not measured samples, and should not be described as "the Pantone
  colour".
- **The region moods are never used in the interface.** They exist only in
  `tokens.css` for reference. Nothing in the page markup reads them — that rule
  is what keeps the interface from turning into a rainbow.

---

## What we deliberately did not do

An archive is judged on whether it invents things, so here is where we could
have and did not.

- **No invented facts.** No dates, dimensions or quotations were added to fill a
  gap. Where a field was empty in the source, it is empty here.
- **No invented sources.** Every URL was already in the archive or was verified
  as a real page. No placeholder links.
- **Folklore, where verified.** The schema has a `folkloreNote` field. It was
  `null` on all 25 sites because fabricating folk narrative would be the
  easiest way to break this project's whole premise. It now carries a
  sourced note for every site - local legend and nearby attractions -
  each citing its Wikipedia article.
- **No unverified UNESCO labels.** A site is marked as a World Heritage property
  only where an official inscription reference exists in the data.
- **No hidden incompleteness.** Where the first version marked a field `TODO` —
  usually the image for one of the five story stages — the `TODO` is shown
  rather than quietly dropped or filled with a stock photograph.
- **No backend, no accounts, no API keys.** The site is a static bundle plus one
  data file. The archive itself runs offline after first load and costs\n  nothing to host. The one exception is the heritage map, which fetches\n  OpenStreetMap tiles on demand — the only network the site makes.
- **No borrowed design.** Layout, type and colour were built for this project.
  Photographs are the only third-party material.

---

## Photographs

Every image is credited on the **About** page, in a table generated directly
from `src/data/sites.json` — so a credit can never disagree with the record it
describes.

The table lists, per site:

- the photographer
- the licence (each is a licence that permits reuse, with attribution)
- the original filename

Images live in `public/media/`. There are 25 of them — one per site, 1280px wide,
totalling 8.5 MB. Every one has a matching row in the credits table, so there is
no image in the build that is not accounted for.

Fonts are **self-hosted** in `public/fonts/` — a latin-subset woff2, 10 files
totalling 379 KB. Nothing is fetched from a third-party font service, which is
what lets the site work offline and stops a font host's outage from changing how
the site looks.

---

## Filming the demo

For the 2–3 minute unlisted walkthrough.

**Before you start:** open the browser console and run `localStorage.clear()`,
then reload. The language choice and your visited sites are remembered, and
starting from a clean state makes the tour read the same for everyone.

**Suggested shot list**

1. **0:00** — Landing screen. Let two photographs cross. Say what the project is.
2. **0:20** — Click into the archive. Show the grid, then set a filter and watch
   the counter change ("25 of 25 shown" → "6 of 25").
3. **0:45** — Search for something, get zero results, show the empty state and
   the reset button.
4. **1:05** — Open one site. Scroll it. Point out the five-part story, the quick
   facts, and that every claim has a source underneath it.
5. **1:40** — Press **हिं** in the nav and watch the whole page — headings,
   story stages, quick facts — switch to Hindi. Stay on the page and open a
   second one to show it sticks.
6. **1:55** — Add it to the journey, then open the journey page and show the
   route, the distance and the badge count.
7. **2:15** — Open the timeline and scroll through the four era bands, then
   point out that all 25 sites are on it whatever the archive filter is set to.
8. **2:25** — Open the map and click one pin; the popup carries the name and
    a link to the record. Mention that this is the one page that fetches
    anything from the network.
9. **2:30** — Answer one quiz question correctly, then one wrongly, so the
   explanation and the link back to the record are both visible.
10. **2:45** — About page: the generated credits table, the source index, and the
   "what we deliberately did not do" list.
11. **2:55** — Close on the landing screen.

---

## Team

| Role | Name |
|---|---|
| Architecture & data | `TODO: name and contact` |
| Interface & interaction | `TODO: name and contact` |
| Content & sources | `TODO: name and contact` |

---

## Companion archive

The first version of this project — a static site with no build step — is kept
as a separate repository and is not modified by this one. `MIGRATION.md`
documents exactly what moved between them and in which direction.
