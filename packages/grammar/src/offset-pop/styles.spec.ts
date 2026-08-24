import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8")

const indexOf = (fragment: string) => {
    const index = css.indexOf(fragment)
    expect(index, `missing CSS fragment: ${fragment}`).toBeGreaterThanOrEqual(0)
    return index
}

describe("offset-pop layered CSS", () => {
    it("declares one deterministic layer order", () => {
        const tokens = indexOf("starci-grammar.offset-pop.tokens")
        const foundation = indexOf("starci-grammar.offset-pop.foundation")
        const components = indexOf("starci-grammar.offset-pop.components")
        const composition = indexOf("starci-grammar.offset-pop.composition")
        const states = indexOf("starci-grammar.offset-pop.states")
        const responsive = indexOf("starci-grammar.offset-pop.responsive")

        expect(tokens).toBeLessThan(foundation)
        expect(foundation).toBeLessThan(components)
        expect(components).toBeLessThan(composition)
        expect(composition).toBeLessThan(states)
        expect(states).toBeLessThan(responsive)
    })

    it("scopes component selectors to the routed Grammar", () => {
        const selectorLines = css
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("[") && line.endsWith("{") && !line.startsWith("[data-theme"))

        expect(selectorLines.length).toBeGreaterThan(20)
        for (const selector of selectorLines) {
            expect(selector).toContain("[data-grammar=\"offset-pop\"]")
        }
    })

    it("keeps a hard zero-blur top shadow and a flat nested surface", () => {
        expect(css).toContain("--offset-pop-shadow-x: 6px")
        expect(css).toContain("--offset-pop-shadow-y: 7px")
        expect(css).toContain("--offset-pop-shadow-blur: 0")

        const topRule = css.match(/\[data-grammar-surface-depth="top"\][^{]*\{([\s\S]*?)\n\s*\}/)?.[1]
        const nestedRule = css.match(/\[data-grammar-surface-depth="nested"\][^{]*\{([\s\S]*?)\n\s*\}/)?.[1]

        expect(topRule).toContain("box-shadow")
        expect(topRule).toContain("var(--offset-pop-shadow-blur)")
        expect(nestedRule).toContain("box-shadow: none")
    })

    it("keeps one list shell with strong dividers", () => {
        expect(css).toContain("[data-grammar-list]")
        expect(css).toContain("[data-grammar-row]:last-child")
        expect(css).toContain("border-block-end: var(--offset-pop-divider-width) solid var(--offset-pop-ink)")
    })

    it("covers the closed neutral state vocabulary", () => {
        const expected = new Set([
            "affirmative",
            "informative",
            "cautionary",
            "negative",
            "pending",
            "unavailable",
        ])
        const actual = new Set(Array.from(css.matchAll(/data-grammar-state="([a-z-]+)"/g), (match) => match[1]))

        expect(actual).toEqual(expected)
    })

    it("bounds floating composition and flattens it in a narrow container", () => {
        expect(css).toContain("container: offset-pop-cluster / inline-size")
        expect(css).toContain("[data-grammar-floating-item]:nth-child(3n + 1)")
        expect(css).toContain("[data-grammar-floating-item]:nth-child(3n + 2)")
        expect(css).toContain("[data-grammar-floating-item]:nth-child(3n)")
        expect(css).toContain("@container offset-pop-cluster (max-width: 34rem)")
        expect(css).toMatch(/@container offset-pop-cluster[\s\S]*?transform: rotate\(0deg\)/)
    })

    it("has explicit reduced-motion and forced-color treatments", () => {
        expect(css).toContain("@media (prefers-reduced-motion: reduce)")
        expect(css).toContain("--offset-pop-transition: 0ms linear")
        expect(css).toContain("@media (forced-colors: active)")
        expect(css).toContain("outline-color: Highlight")
    })

    it("contains no domain vocabulary", () => {
        const forbidden = [
            ["pri", "ce"],
            ["check", "out"],
            ["enroll", "ment"],
            ["stu", "dent"],
            ["exam"],
            ["course"],
            ["entitle", "ment"],
        ].map((parts) => parts.join(""))

        for (const word of forbidden) expect(css.toLowerCase()).not.toContain(word)
    })
})
