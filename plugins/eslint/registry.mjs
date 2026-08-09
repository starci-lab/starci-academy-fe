/**
 * Reader for the NAMED REGISTRY at `src/components/contracts/`.
 *
 * The registry is the single source of truth for class strings, child roles and the reason
 * a node exists. Rules that need to know which keys and which roles exist read them FROM
 * those files rather than restating them here, because a second copy of the vocabulary is a
 * second thing to drift - and the whole point of the registry is that there is one place.
 *
 * THE PATH HAS MOVED TWICE, AND THE FIRST TIME IT BROKE THIS FILE SILENTLY. It began as the
 * single file `src/components/classNames.tsx`, holding the role union and the entry table
 * together; that was split into `roles.ts` and `shapes.ts` inside a folder, so the generic
 * vocabulary could stay free of the chain layer beside it. The folder was then renamed to
 * `contracts/`. When the FIRST of those moves happened and this reader still pointed at the
 * old path, every registry rule went quietly silent - `readRegistry` returned null, the rules
 * did nothing, and eslint reported a clean tree while an invented key and an invented role
 * both walked through. That is why the twin test asserts the REAL repository parses, not just
 * that the parser works: a path constant is the one thing here that can be wrong without
 * anything turning red.
 *
 * Parsing is deliberately textual. An ESLint rule runs under one parser on one file at a
 * time and cannot import a TypeScript module; the two shapes read below (`ContractRole` and
 * `CONTRACTS`) are stable, and the registry's own twin tests are what keep them honest.
 */
import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"

/** The registry folder, relative to the repository root. */
export const REGISTRY_DIR_RELATIVE = "src/components/contracts"

/** The entry table - keys, classes, roles and reasons. Relative to the repository root. */
export const REGISTRY_SHAPES_RELATIVE = `${REGISTRY_DIR_RELATIVE}/shapes.ts`

/** The closed role vocabulary. Relative to the repository root. */
export const REGISTRY_ROLES_RELATIVE = `${REGISTRY_DIR_RELATIVE}/roles.ts`

/** Parsed registries, keyed by the shapes path and invalidated by both files' mtimes. */
const cache = new Map()

/** Forward-slash form of a filename, so Windows paths compare like every other path. */
export const normalizePath = (filename) => String(filename || "").replace(/\\/g, "/")

/**
 * True when this file holds the entry table - the one place a class string or an `explain`
 * may be written.
 *
 * It is the SHAPES file specifically, not the whole folder: `roles.ts` declares a vocabulary
 * with no classes in it, and the chain modules declare no classes either, so widening this
 * would hand three more files an exemption none of them needs.
 */
export const isRegistryFile = (filename) => normalizePath(filename).endsWith(`/${REGISTRY_SHAPES_RELATIVE}`)

/** True when this file sits anywhere inside the registry folder. */
export const isRegistryFolderFile = (filename) =>
  normalizePath(filename).includes(`/${REGISTRY_DIR_RELATIVE}/`)

/** Walk up from a linted file to the registry; null when no registry sits above it. */
export const findRegistryFile = (filename) => {
  let dir = dirname(normalizePath(filename))
  for (let depth = 0; depth < 40; depth += 1) {
    const candidate = normalizePath(join(dir, REGISTRY_SHAPES_RELATIVE))
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (!parent || parent === dir) return null
    dir = parent
  }
  return null
}

/** Every double-quoted lowercase word in a slice of source. */
const quotedWords = (text) => [...String(text).matchAll(/"([a-z][a-z-]*)"/g)].map((hit) => hit[1])

/** The closed role vocabulary, read off the `ContractRole` union in `roles.ts`. */
const parseRoles = (source) => {
  const match = source.match(/export type ContractRole\s*=([\s\S]*?)(?:\n\s*\n|\nexport )/)
  return match ? quotedWords(match[1]) : []
}

/** Every registry key mapped to the ordered roles it declares, read off `shapes.ts`. */
const parseEntries = (source) => {
  const start = source.indexOf("export const CONTRACTS")
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

/** Modification time of a file, or null when it cannot be read. */
const stampOf = (path) => {
  try {
    return statSync(path).mtimeMs
  } catch {
    return null
  }
}

/** Text of a file, or null when it cannot be read. */
const textOf = (path) => {
  try {
    return readFileSync(path, "utf8")
  } catch {
    return null
  }
}

/**
 * Read the registry that governs a linted file.
 *
 * Returns `null` when there is no registry above the file, or when it cannot be read as
 * keys plus roles. A rule that gets `null` must do nothing: a registry nobody can read is
 * a reason to stay quiet, never a reason to call every call site wrong.
 *
 * @param filename - The file being linted.
 */
export const readRegistry = (filename) => {
  const shapesPath = findRegistryFile(filename)
  if (!shapesPath) return null
  const rolesPath = normalizePath(join(dirname(shapesPath), "roles.ts"))
  const shapesStamp = stampOf(shapesPath)
  const rolesStamp = stampOf(rolesPath)
  if (shapesStamp === null || rolesStamp === null) return null
  const stamp = `${shapesStamp}:${rolesStamp}`
  const hit = cache.get(shapesPath)
  if (hit && hit.stamp === stamp) return hit.value
  const shapesSource = textOf(shapesPath)
  const rolesSource = textOf(rolesPath)
  if (shapesSource === null || rolesSource === null) return null
  const rolesByKey = parseEntries(shapesSource)
  const keys = Object.keys(rolesByKey)
  const roles = parseRoles(rolesSource)
  const value = keys.length > 0 && roles.length > 0
    ? { path: shapesPath, rolesPath, keys, roles, rolesByKey }
    : null
  cache.set(shapesPath, { stamp, value })
  return value
}
