/**
 * Reader for the REGISTRY at `src/components/contracts/index.ts`.
 *
 * The registry is the single source of truth for class strings and the reason a node's children
 * sit the way they do. Rules that need to know which keys exist read them FROM that file rather
 * than restating them here, because a second copy of the vocabulary is a second thing to drift.
 *
 * THE PATH HAS MOVED THREE TIMES, AND THE FIRST TIME IT BROKE THIS FILE SILENTLY. It began as
 * `src/components/classNames.tsx`; it was split into `roles.ts` + `shapes.ts` inside a folder; the
 * folder was renamed to `contracts/`; and the two files then collapsed into one `index.ts` when a
 * contract stopped carrying children. When the FIRST of those moves happened and this reader still
 * pointed at the old path, every registry rule went quietly silent - `readRegistry` returned null,
 * the rules did nothing, and eslint reported a clean tree while an invented key walked through.
 * That is why the twin test asserts the REAL repository parses: a path constant is the one thing
 * here that can be wrong without anything turning red.
 *
 * Parsing is deliberately textual. An ESLint rule runs under one parser on one file at a time and
 * cannot import a TypeScript module.
 */
import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"

/** The registry folder, relative to the repository root. */
export const REGISTRY_DIR_RELATIVE = "src/components/contracts"

/** The entry table - keys, classes and reasons. Relative to the repository root. */
export const REGISTRY_SHAPES_RELATIVE = `${REGISTRY_DIR_RELATIVE}/index.ts`

/** Parsed registries, keyed by path and invalidated by the file's mtime. */
const cache = new Map()

/** Forward-slash form of a filename, so Windows paths compare like every other path. */
export const normalizePath = (filename) => String(filename || "").replace(/\\/g, "/")

/**
 * True when this file holds the entry table - the one place a class string or a `why` may be
 * written.
 */
export const isRegistryFile = (filename) => normalizePath(filename).endsWith(`/${REGISTRY_SHAPES_RELATIVE}`)

/** True when this file sits anywhere inside the registry folder. */
export const isRegistryFolderFile = (filename) =>
  normalizePath(filename).includes(`/${REGISTRY_DIR_RELATIVE}/`)

/**
 * True when this file is a LEAF.
 *
 * A leaf owns its own interior - an atom or a fixed cluster of atoms - so it writes its own
 * structural classes and its own element. That interior is the same everywhere and forever, so
 * there is nothing for the registry to tune and nothing for these rules to send back to it. The
 * exemption is a folder, which makes it a policy boundary rather than a type; the numbering test
 * is what keeps a region out of it, and that test is read by a person.
 */
export const isLeafFile = (filename) => normalizePath(filename).includes("/src/components/leaves/")

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

/** Every registry key, read off the `CONTRACTS` table. */
export const parseKeys = (source) => {
  const start = source.indexOf("buildContracts({")
  if (start < 0) return []
  const open = source.indexOf("{", start)
  if (open < 0) return []
  let depth = 0
  let quote = null
  let escaped = false
  let lineComment = false
  let blockComment = false
  let close = -1
  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]
    if (lineComment) {
      if (char === "\n") lineComment = false
      continue
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false
        index += 1
      }
      continue
    }
    if (quote !== null) {
      if (escaped) {
        escaped = false
      } else if (char === "\\") {
        escaped = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }
    if (char === "/" && next === "/") {
      lineComment = true
      index += 1
      continue
    }
    if (char === "/" && next === "*") {
      blockComment = true
      index += 1
      continue
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char
      continue
    }
    if (char === "{") depth += 1
    if (char === "}") {
      depth -= 1
      if (depth === 0) {
        close = index + 1
        break
      }
    }
  }
  if (close < 0) return []
  const block = source.slice(open, close)
  return [...block.matchAll(/^\s{4}"([a-z][a-z-]*)":\s*\{/gm)].map((hit) => hit[1])
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
 * Returns `null` when there is no registry above the file, or when it cannot be read as keys. A
 * rule that gets `null` must do nothing: a registry nobody can read is a reason to stay quiet,
 * never a reason to call every call site wrong.
 *
 * @param filename - The file being linted.
 */
export const readRegistry = (filename) => {
  const path = findRegistryFile(filename)
  if (!path) return null
  const stamp = stampOf(path)
  if (stamp === null) return null
  const hit = cache.get(path)
  if (hit && hit.stamp === stamp) return hit.value
  const source = textOf(path)
  if (source === null) return null
  const keys = parseKeys(source)
  const value = keys.length > 0 ? { path, keys } : null
  cache.set(path, { stamp, value })
  return value
}
