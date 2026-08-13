import { readFileSync, writeFileSync } from "node:fs"

/**
 * Merge the seventeen approved entries and twelve class members into the locked registry.
 *
 * A script, not a hand edit, because this is the one file the whole design lands on and a hand merge
 * into a 1400-line table is where an entry silently goes missing or lands inside the wrong object.
 * Every anchor is located by an exact string and the run FAILS if an anchor is missing or ambiguous,
 * so a change to the locked file upstream stops this rather than putting the entries somewhere
 * plausible.
 */
const TARGET = "D:/Repositories/starci-academy-fe/src/components/contracts/index.ts"
const CANDIDATE = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2/candidate/src/components/contracts/index.ts"

const NEW_CLASSES = `    // The course detail page is the first right-hand rail and the first bottom-pinned bar in this
    // repository, which is why these read as gaps rather than omissions: every one is the mirror of a
    // member already present for the opposite child or the opposite edge.
    | "[&>*:last-child]:min-w-0" | "[&>*:last-child]:grow"
    | "md:[&>*:last-child]:sticky" | "md:[&>*:last-child]:top-6"
    | "md:[&>*:last-child]:self-start" | "md:[&>*:last-child]:max-h-rail"
    | "md:[&>*:last-child]:overflow-y-auto"
    | "bottom-0" | "border-t" | "md:hidden"
    // py-6 is both at once, and both at once is exactly what a page with a bottom-pinned bar cannot
    // use: padding under the last child lifts the bar off the edge it is pinned to.
    | "pt-6" | "pb-6"
`

const source = readFileSync(TARGET, "utf8")
const candidate = readFileSync(CANDIDATE, "utf8")

/** Find exactly one occurrence, or stop. */
const anchor = (text, needle, label) => {
    const first = text.indexOf(needle)
    if (first === -1) throw new Error(`anchor not found: ${label}`)
    if (text.indexOf(needle, first + 1) !== -1) throw new Error(`anchor is ambiguous: ${label}`)
    return first
}

// 1. The class union. Insert before the line that closes it.
const unionEnd = anchor(source, "\n/** Literal values a contract may require from a child component's data props. */", "LayoutClassName end")
let merged = `${source.slice(0, unionEnd)}\n${NEW_CLASSES}${source.slice(unionEnd)}`

// 2. The entries. Lift them out of the candidate table verbatim - retyping is how a `why` loses the
//    sentence that made it worth reading.
const entriesStart = anchor(candidate, "export const PROPOSED_CONTRACTS = {\n", "candidate table start")
const entriesEnd = anchor(candidate, "\n} as const satisfies Readonly<Record<string, ProposedSpec>>", "candidate table end")
const entries = candidate.slice(entriesStart + "export const PROPOSED_CONTRACTS = {\n".length, entriesEnd)

// The locked table is `buildContracts({ … })`, so its closing token is `})` at column 0 - not the
// `as const satisfies` the candidate file uses. Anchoring on the wrong one is why this stopped
// instead of writing the entries into whatever came first.
const registryEnd = anchor(merged, "\n})\n\n/** Every key in the registry.", "locked table end")
merged = `${merged.slice(0, registryEnd)}\n${entries}${merged.slice(registryEnd)}`

writeFileSync(TARGET, merged, "utf8")

const keys = [...entries.matchAll(/^ {4}"([a-z0-9-]+)": \{$/gm)].map((match) => match[1])
console.log(`entries merged: ${keys.length}`)
for (const key of keys) console.log(`  ${key}`)
console.log(`class members added: ${(NEW_CLASSES.match(/\| "/g) ?? []).length}`)
console.log(`file grew from ${source.length} to ${merged.length} bytes`)
