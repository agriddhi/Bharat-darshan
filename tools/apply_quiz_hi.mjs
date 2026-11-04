/* tools/apply_quiz_hi.mjs
   Adds qHi / optionsHi / explainHi to every quiz item in sites.json,
   using the hand-written map in tools/_quiz_hi.json.

   Run: node tools/apply_quiz_hi.mjs
   Idempotent: re-running rewrites the same values, it does not append.

   The English fields are never touched. A question that has no entry
   in the map keeps its English text and gains no Hindi key, so an
   incomplete map cannot silently produce a half-translated question —
   the script reports how many it could not place and exits non-zero.
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const SITES = JSON.parse(readFileSync(join(root, 'src/data/sites.json'), 'utf8'))
const HI = JSON.parse(readFileSync(join(here, '_quiz_hi.json'), 'utf8'))

let n = 0
let applied = 0
const missing = []

for (const site of SITES) {
  for (const item of site.quiz ?? []) {
    n += 1
    const t = HI[String(n)]
    if (!t) {
      missing.push(`${n} (${site.id}): no entry`)
      continue
    }
    if (t.o.length !== item.options.length) {
      missing.push(
        `${n} (${site.id}): ${t.o.length} Hindi options vs ${item.options.length} English`
      )
      continue
    }
    item.qHi = t.q
    item.optionsHi = t.o
    item.explainHi = t.e
    applied += 1
  }
}

if (missing.length) {
  console.error('NOT APPLIED:')
  for (const m of missing) console.error('  ' + m)
  process.exit(1)
}

writeFileSync(join(root, 'src/data/sites.json'), JSON.stringify(SITES, null, 2) + '\n', 'utf8')
console.log(`applied ${applied}/${n} translations`)

// verify nothing was lost
let q = 0
let qHi = 0
for (const site of SITES)
  for (const item of site.quiz ?? []) {
    q += 1
    if (item.qHi && item.optionsHi?.length === item.options.length && item.explainHi) qHi += 1
  }
console.log(`verify: ${qHi}/${q} quiz items fully bilingual`)
if (qHi !== q) process.exit(1)
