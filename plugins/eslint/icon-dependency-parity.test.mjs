import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const manifest = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"))
const dependencyNames = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })
const glyphDependency = /(?:icon|glyph|lucide|feather|tabler|fortawesome)/i

test("Heroicons is the only glyph dependency in the repository", () => {
  const glyphPackages = dependencyNames.filter((name) => glyphDependency.test(name)).sort()
  assert.deepEqual(glyphPackages, ["@heroicons/react"])
})
