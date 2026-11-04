/* tools/apply_folklore.mjs
   Adds folkloreNote to every site in sites.json, using the hand-written
   map in tools/_folklore.json. Each entry is verified against Wikipedia
   and cites "Wikipedia — <Article>" as a source.

   Run: node tools/apply_folklore.mjs
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const SITES = JSON.parse(readFileSync(join(root, 'src/data/sites.json'), 'utf8'))
const FOLK = JSON.parse(readFileSync(join(here, '_folklore.json'), 'utf8'))

let applied = 0, missing = []
for (const site of SITES) {
  const note = FOLK[site.id]
  if (!note) { missing.push(site.id); continue }
  site.folkloreNote = note
  // add Wikipedia as a source if not already present
  const wikiSource = `Wikipedia — ${site.title}`
  if (!site.sources.includes(wikiSource)) site.sources.push(wikiSource)
  applied++
}

if (missing.length) {
  console.error('MISSING folklore for:', missing.join(', '))
  process.exit(1)
}

writeFileSync(join(root, 'src/data/sites.json'), JSON.stringify(SITES, null, 2) + '\n', 'utf8')
console.log(`applied folklore to ${applied}/${SITES.length} sites`)
// verify
const S2 = JSON.parse(readFileSync(join(root, 'src/data/sites.json'), 'utf8'))
let n = 0
for (const s of S2) if (s.folkloreNote) n++
console.log(`verify: ${n}/${S2.length} sites have folkloreNote`)