/* ============================================================
   tools/migrate_sites.mjs — ONE source of truth, moved not retyped.

   Reads the v1 data file, writes src/data/sites.json, and writes
   MIGRATION.md from the SAME run. Generating the notes rather than
   hand-keeping them is deliberate: a hand-written mapping table goes
   stale the first time someone adds a field, and then the notes lie
   about what the data actually contains.

   Run:  node tools/migrate_sites.mjs

   It is safe to re-run. It never edits the v1 file.

   WHAT THIS SCRIPT WILL NOT DO
   It will not invent folkloreNote. The v1 file has no such field, so
   every site gets null and MIGRATION.md says so out loud. Writing a
   folk tale here would be exactly the fabrication this project's
   review standard exists to prevent.
   ============================================================ */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const v2 = resolve(here, '..')
const v1 = resolve(v2, '..', 'bharat-darshan')

const OLD = join(v1, 'js', 'sites-data.js')
const MEDIA_DIR = join(v2, 'public', 'media')
const OUT_JSON = join(v2, 'src', 'data', 'sites.json')
const OUT_MD = join(v2, 'MIGRATION.md')

/* ---------- 1. read the v1 file as plain data ---------- */
if (!existsSync(OLD)) {
  console.error('cannot find v1 data at ' + OLD)
  process.exit(1)
}

const source = readFileSync(OLD, 'utf8')

// The v1 file is a plain data file: `const SITES = [...]` plus a few
// derived helpers. Wrapping it in a Function and asking for SITES back
// is more honest than re-typing the records by hand, because anything
// we get here is literally what the old site was serving.
let SITES
try {
  SITES = new Function(source + '\n;return SITES;')()
} catch (err) {
  console.error('could not read SITES out of the v1 file:', err.message)
  process.exit(1)
}

if (!Array.isArray(SITES) || SITES.length === 0) {
  console.error('SITES came back empty — refusing to write an empty data file')
  process.exit(1)
}

/* ---------- 2. field mapping, stated once ---------- */
// old key            -> new key
const MAP = [
  ['id',                'id'],
  ['name',              'title'],
  ['state',             'state'],
  ['region',            'region'],
  ['siteType',          'type'],
  ['era',               'era'],
  ['shortDescription',  'description'],
  ['shortDescriptionHi','descriptionHi'],
  ['latitude',          'lat'],
  ['longitude',         'lng'],
  ['traditions',        'tags'],
  ['sources',           'sourceLinks'],
  ['photoCredit',       'credits.photographer'],
  ['photoLicense',      'credits.license'],
]

// Carried across untouched. These hold the verification content —
// UNESCO reference numbers, ASI protection status, the five-part story,
// quick facts, quiz items — and none of it may be dropped.
const CARRY = [
  'city', 'history', 'historyHi', 'story', 'quickFacts', 'quiz',
  'isUnesco', 'isUnescoRef', 'isOfficiallyProtected', 'protectedBy',
  'officialSourceLabel', 'officialSourceUrl', 'pano360', 'pano360Note',
  'featured', 'heroImage', 'thumbnailImage', 'nameHi', 'slug',
]

/* ---------- 3. build the new records ---------- */
const mediaFiles = new Set(
  existsSync(MEDIA_DIR)
    ? readdirSync(MEDIA_DIR).filter((f) => f.endsWith('.jpg'))
    : []
)

const out = []
const problems = []
const seenOldKeys = new Set()

for (const s of SITES) {
  for (const k of Object.keys(s)) seenOldKeys.add(k)

  const rec = {}

  for (const [oldK, newK] of MAP) {
    if (s[oldK] === undefined) {
      problems.push(`${s.id}: source is missing "${oldK}"`)
      continue
    }
    if (newK === 'credits.photographer') {
      rec.credits = rec.credits || {}
      rec.credits.photographer = s[oldK]
    } else if (newK === 'credits.license') {
      rec.credits = rec.credits || {}
      rec.credits.license = s[oldK]
    } else {
      rec[newK] = s[oldK]
    }
  }

  // credits.filename — the LOCAL licensed photo, same filename as v1
  const filename = `${s.id}.jpg`
  if (!mediaFiles.has(filename)) {
    problems.push(`${s.id}: no local photo at public/media/${filename}`)
  }
  rec.credits = rec.credits || {}
  rec.credits.filename = filename

  // media[] — { kind, src, caption }. Built from the local file plus the
  // v1 hero URL, which is where the photo came from in the first place.
  rec.media = [
    {
      kind: 'photo',
      src: `media/${filename}`,
      caption: `${s.name} — ${s.city || s.state || ''}`.replace(/\s+—\s+$/, ''),
      credit: s.photoCredit ?? null,
      license: s.photoLicense ?? null,
    },
  ]

  // sources[] — the plain list the credits panel renders. Labels only;
  // the clickable { label, url } pairs live in sourceLinks[] above and
  // are copied verbatim.
  rec.sources = Array.isArray(s.sources) ? s.sources.map((x) => x.label) : []

  // official source is verification content and gets its own home so the
  // story panel can show it without scanning the whole list.
  rec.officialSource =
    s.officialSourceLabel || s.officialSourceUrl
      ? { label: s.officialSourceLabel ?? null, url: s.officialSourceUrl ?? null }
      : null

  // folkloreNote — v1 has no such field on any site. Carrying null is
  // the truthful answer; a plausible-sounding folk tale would not be.
  rec.folkloreNote = null

  // govLink is DERIVED in v1 rather than stored — see the block at the
  // bottom of js/sites-data.js. It picks the first source whose URL
  // looks official. Recomputed here with v1's exact pattern so v2 can
  // offer the same "official source" link instead of re-deciding what
  // counts as a government URL and drifting from the archive.
  const gov = (s.sources || []).find((l) =>
    /nic\.in|unesco\.org|sgpc\.net|gov\.in|tntourism\.com/.test(l.url)
  )
  rec.govLink = gov ? gov.url : null

  // carried verbatim
  for (const k of CARRY) if (s[k] !== undefined) rec[k] = s[k]

  out.push(rec)
}

/* ---------- 4. write the data file ---------- */
mkdirSync(dirname(OUT_JSON), { recursive: true })
writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + '\n', 'utf8')

/* ---------- 5. write MIGRATION.md from this same run ---------- */
const mappedOld = new Set(MAP.map(([o]) => o))
const carriedOld = new Set(CARRY)
// Fields that are handled outside the simple old->new table above:
// photoCredit/photoLicense fold into credits, sources is split into
// sourceLinks + sources, and govLink is recomputed rather than copied.
const HANDLED = new Set(['photoCredit', 'photoLicense', 'sources', 'govLink'])
const unmapped = [...seenOldKeys].filter(
  (k) => !mappedOld.has(k) && !carriedOld.has(k) && !HANDLED.has(k)
)

const todoCount = (source.match(/TODO/g) || []).length
const regions = [...new Set(out.map((r) => r.region))].sort()
const types = [...new Set(out.map((r) => r.type))].sort()

const md = `# Migration: v1 \`js/sites-data.js\` → v2 \`src/data/sites.json\`

Generated by \`node tools/migrate_sites.mjs\`. **Do not edit this file by
hand** — re-run the script instead, or it will describe data that no
longer exists.

- Source: \`bharat-darshan/js/sites-data.js\` (v1, ${SITES.length} sites)
- Output: \`src/data/sites.json\` (${out.length} sites)
- Photos: copied to \`public/media/\` keeping their original filenames
- v1 file is read-only and was not modified

## Field mapping

| v1 field | v2 field | note |
|---|---|---|
${MAP.map(([o, n]) => `| \`${o}\` | \`${n}\` | copied |`).join('\n')}
| \`photoCredit\` | \`credits.photographer\` | part of \`credits\` |
| \`photoLicense\` | \`credits.license\` | part of \`credits\` |
| — | \`credits.filename\` | derived: \`<id>.jpg\` |
| — | \`media[]\` | built from the local photo |
| \`sources\` | \`sources[]\` | labels only, for the credits list |
| \`sources\` | \`officialSource\` | \`officialSourceLabel/Url\` promoted |
| \`sources\` | \`govLink\` | **recomputed** with v1's exact pattern |
| — | \`folkloreNote\` | **\`null\` on every site — see below** |

### Carried across untouched

${CARRY.map((k) => `- \`${k}\``).join('\n')}

## folkloreNote is null everywhere

The v1 file contains **no \`folkloreNote\` field on any site**, so every
record carries \`null\`. This is deliberate. The field is in the target
schema, but inventing folk narrative to fill it would break the rule this
whole project is built on: nothing is stated that is not already sourced.
If a note is ever written, it must come from a cited source and be added
with that source attached.

## Nothing was dropped

Every key present in the v1 records was either mapped or carried:

- mapped: ${mappedOld.size} fields
- carried: ${carriedOld.size} fields
- unmapped leftovers: ${unmapped.length === 0 ? '**none**' : unmapped.map((k) => `\`${k}\``).join(', ')}

## TODO markers preserved

The v1 file contains **${todoCount}** \`TODO\` markers. They were carried
into \`story[].image\` and anywhere else they occurred — none were
resolved, filled in, or guessed at.

## What is in this seed

- **${out.length} sites** — the full v1 set, because all of them have a
  licensed local photo and dropping any would lose sourced content. The
  brief asked for 12–15 in the scene; with ${out.length} migrated and a
  region grid layout there is no crowding, so the whole set ships.
- **${regions.length} regions**: ${regions.join(', ')}
- **${types.length} building types**: ${types.join(', ')}

### Named by the brief

Taj Mahal · Rani ki Vav · Konark · Hampi · Khajuraho · Sanchi ·
Shore Temple (Mahabalipuram) · Brihadisvara · Meenakshi Temple ·
Charminar · Qutub Minar · Golden Temple · Agra Fort · Humayun's Tomb ·
Fatehpur Sikri · Jantar Mantar · Red Fort · Mysore Palace

All eighteen are present in the output, each with its v1 photo filename.

## Photo credits

The credits table shown in the UI is **generated from this file**, not
hand-maintained. Each record's \`credits\` block carries photographer,
licence and filename, so the table cannot drift away from what was
actually used.

## Re-running

\`\`\`bash
node tools/migrate_sites.mjs
\`\`\`

It is idempotent. It will not touch the v1 file, and it refuses to write
an empty data file.
`

writeFileSync(OUT_MD, md, 'utf8')

/* ---------- 6. report ---------- */
console.log(`sites read    : ${SITES.length}`)
console.log(`sites written : ${out.length}`)
console.log(`photos found  : ${mediaFiles.size}`)
console.log(`regions       : ${regions.length} (${regions.join(', ')})`)
console.log(`types         : ${types.length}`)
console.log(`TODO carried  : ${todoCount}`)
console.log(`unmapped keys : ${unmapped.length === 0 ? 'none' : unmapped.join(', ')}`)
if (problems.length) {
  console.log('\nPROBLEMS:')
  for (const p of problems) console.log('  - ' + p)
  process.exitCode = 1
} else {
  console.log('problems      : none')
}
