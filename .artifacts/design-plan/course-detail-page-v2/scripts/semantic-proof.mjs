import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"

const ROOT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2/candidate/out"
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr", "path", "circle", "rect", "line", "polyline", "polygon", "use", "stop"])
const LANDMARKS = ["main", "nav", "section", "aside", "ul", "ol", "li", "details", "summary"]

/**
 * Walk the tag stream keeping a stack, so a claim about STRUCTURE is answered structurally.
 * Counting `<li>` cannot tell you whose child it is, and "whose child" is the entire question:
 * a `ul` full of spans still contains plenty of `li` further down the page.
 */
const scan = (html) => {
    const stack = []
    const tags = Object.fromEntries(LANDMARKS.map((t) => [t, 0]))
    const nodes = {}
    const badListChildren = []
    let divs = 0

    for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(\/?)>/g)) {
        const [, closing, rawTag, attrs, selfClosing] = m
        const tag = rawTag.toLowerCase()
        if (closing === "/") {
            for (let i = stack.length - 1; i >= 0; i -= 1) {
                if (stack[i].tag === tag) { stack.length = i; break }
            }
            continue
        }
        if (tag === "div") divs += 1
        if (tag in tags) tags[tag] += 1
        const node = /data-node="([a-z0-9-]+)"/.exec(attrs)
        if (node !== null && nodes[node[1]] === undefined) nodes[node[1]] = tag

        const parent = stack[stack.length - 1]
        if (parent !== undefined && (parent.tag === "ul" || parent.tag === "ol") && tag !== "li" && tag !== "template" && tag !== "script") {
            badListChildren.push({ list: parent.tag, listNode: parent.node, child: tag, childNode: node?.[1] ?? null })
        }
        if (!VOID.has(tag) && selfClosing !== "/") stack.push({ tag, node: node?.[1] ?? null })
    }
    return { tags, nodes, divs, badListChildren }
}

const report = {}
for (const file of readdirSync(`${ROOT}/state`).filter((f) => f.endsWith(".html"))) {
    report[file.replace(".html", "")] = scan(readFileSync(`${ROOT}/state/${file}`, "utf8"))
}

let bad = 0
for (const [id, r] of Object.entries(report)) {
    console.log(`\n${id}`)
    console.log(`  ${LANDMARKS.filter((t) => r.tags[t] > 0).map((t) => `${t}:${r.tags[t]}`).join("  ")}   (div:${r.divs})`)
    console.log(`  ${Object.entries(r.nodes).map(([k, v]) => `${k}=${v}`).join(", ")}`)
    for (const b of r.badListChildren) {
        bad += 1
        console.log(`  INVALID: <${b.list}> "${b.listNode}" has a direct <${b.child}> child ("${b.childNode}")`)
    }
}

// `next build` empties out/, so the proof recreates its own home rather than depending on a
// directory an earlier run happened to leave behind.
mkdirSync(`${ROOT}/.well-known`, { recursive: true })
writeFileSync(`${ROOT}/.well-known/starci-preview-semantics.json`, JSON.stringify(report, null, 2))
console.log(`\ninvalid list children across all states: ${bad}`)
console.log("written: out/.well-known/starci-preview-semantics.json")
