/**
 * Reader for the NAMED REGISTRY at `src/components/classNames.tsx`.
 *
 * The registry is the single source of truth for class strings, child roles and the reason
 * a node exists. Rules that need to know which keys and which roles exist read them FROM
 * that file rather than restating them here, because a second copy of the vocabulary is a
 * second thing to drift - and the whole point of the registry is that there is one place.
 *
 * Parsing is deliberately textual. An ESLint rule runs under one parser on one file at a
 * time and cannot import a TypeScript module; the two shapes read below (`TreeRole` and
 * `CLASS_NAMES`) are stable, and the registry's own twin test is what keeps them honest.
 */
import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"

/** Location of the registry, relative to the repository root. */
export const REGISTRY_RELATIVE = "src/components/classNames.tsx"

/** Parsed registries, keyed by absolute path and invalidated by mtime. */
const cache = new Map()

/** Forward-slash form of a filename, so Windows paths compare like every other path. */
export const normalizePath = (filename) => String(filename || "").replace(/\\/g, "/")

/** True when this file IS the registry - the one place a class string may be written. */
export const isRegistryFile = (filename) => normalizePath(filename).endsWith(`/${REGISTRY_RELATIVE}`)

/** Walk up from a linted file to the registry; null when no registry sits above it. */
export const findRegistryFile = (filename) => {
  let dir = dirname(normalizePath(filename))
  for (let depth = 0; depth < 40; depth += 1) {
    const candidate = normalizePath(join(dir, REGISTRY_RELATIVE))
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (!parent || parent === dir) return null
    dir = parent
  }
  return null
}

/** Every double-quoted lowercase word in a slice of source. */
const quotedWords = (text) => [...String(text).matchAll(/"([a-z][a-z-]*)"/g)].map((hit) => hit[1])

/** The closed role vocabulary, read off the `TreeRole` union. */
const parseRoles = (source) => {
  const match = source.match(/export type TreeRole\s*=([\s\S]*?)(?:\n\s*\n|\nexport )/)
  return match ? quotedWords(match[1]) : []
}

/** Every registry key mapped to the ordered roles it declares. */
const parseEntries = (source) => {
  const start = source.indexOf("export const CLASS_NAMES")
  if (start < 0) return {}
  const end = source.indexOf("} as const", start)
  const block = source.slice(start, end < 0 ? source.length : end)
  const entries = {}
  const pattern = /(?:"([a-z][a-z-]*)"|([a-z][a-z-]*))\s*:\s*\{[\s\S]*?roles:\s*\[([^\]]*)\]/g
  for (const hit of block.matchAll(pattern)) {
    entries[hit[1] || hit[2]] = quotedWords(hit[3])
  }
  return entries
}

/**
 * Read the registry that governs a linted file.
 *
 * Returns `null` when there is no registry above the file, or when it cannot be read as
 * keys plus roles. A rule that gets `null` must do nothing: a registry nobody can read is
 * a reason to stay quiet, never a reason to call every call site wrong.
 */
export const readRegistry = (filename) => {
  const path = findRegistryFile(filename)
  if (!path) return null
  let stamp = 0
  try {
    stamp = statSync(path).mtimeMs
  } catch {
    return null
  }
  const hit = cache.get(path)
  if (hit && hit.stamp === stamp) return hit.value
  let source = ""
  try {
    source = readFileSync(path, "utf8")
  } catch {
    return null
  }
  const rolesByKey = parseEntries(source)
  const keys = Object.keys(rolesByKey)
  const roles = parseRoles(source)
  const value = keys.length > 0 && roles.length > 0 ? { path, keys, roles, rolesByKey } : null
  cache.set(path, { stamp, value })
  return value
}
