import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const iconSource = readFileSync(new URL("../../src/components/leaves/Icon/index.tsx", import.meta.url), "utf8")
const iconGuide = readFileSync(new URL("../../src/components/leaves/Icon/icon.md", import.meta.url), "utf8")

/** Capture every string member of the closed IconName union. */
const iconNameBlock = iconSource.match(/export type IconName\s*=([\s\S]*?)\/\*\* The two native Heroicon roles/)
const iconNames = new Set(Array.from(iconNameBlock?.[1].matchAll(/"([^"]+)"/g) ?? [], (match) => match[1]))

/** Capture meaning-to-component pairs from the GLYPHS object. */
const glyphBlock = iconSource.match(/const GLYPHS:[\s\S]*?= \{([\s\S]*?)\n\}/)
const sourcePairs = new Map(
  Array.from(glyphBlock?.[1].matchAll(/^\s{4}(\w+): cuts\((\w+),/gm) ?? [], (match) => [match[1], match[2]]),
)

/** Capture the meaning and concrete glyph columns from the canonical markdown table. */
const guidePairs = new Map(
  Array.from(iconGuide.matchAll(/^\| `(\w+)` \| [^|]+ \| `(\w+)` \|/gm), (match) => [match[1], match[2]]),
)

test("the feature table, IconName union and glyph map contain the same meanings", () => {
  assert.deepEqual(new Set(sourcePairs.keys()), iconNames)
  assert.deepEqual(new Set(guidePairs.keys()), iconNames)
})

test("the feature table names the glyph the source actually maps", () => {
  assert.deepEqual(guidePairs, sourcePairs)
})

test("different product meanings do not share one concrete glyph", () => {
  const owners = new Map()
  for (const [meaning, glyph] of guidePairs) {
    assert.equal(owners.has(glyph), false, `${glyph} is assigned to both ${owners.get(glyph)} and ${meaning}`)
    owners.set(glyph, meaning)
  }
})

test("pending is CheckCircleIcon with only the inner check removed", () => {
  const circleBlock = iconSource.match(/const CircleIcon[\s\S]*?\n\)/)?.[0] ?? ""

  assert.match(circleBlock, /M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z/)
  assert.doesNotMatch(circleBlock, /M9 12\.75 11\.25 15 15 9\.75/)
})
