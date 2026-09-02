import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8")

describe("application CSS cascade", () => {
    it("keeps Tailwind reset below Grammar anatomy and utilities above it", () => {
        const order = "@layer theme, base, starci-grammar-common, starci-grammar-core, starci-grammar-extension, components, utilities;"

        expect(css).toContain(order)
        expect(css.indexOf(order)).toBeLessThan(css.indexOf("@import \"@starci/grammar/common/styles.css\""))
        expect(css.indexOf(order)).toBeLessThan(css.indexOf("@import \"tailwindcss\""))
    })

    it("hides native scrollbar chrome without removing scroll overflow", () => {
        expect(css).toMatch(/\*\s*\{[\s\S]*?-ms-overflow-style: none;[\s\S]*?scrollbar-width: none;/)
        expect(css).toMatch(/\*::-webkit-scrollbar\s*\{[\s\S]*?display: none;[\s\S]*?width: 0;[\s\S]*?height: 0;/)
    })

    it("does not reach through Grammar anatomy from the application stylesheet", () => {
        expect(css).not.toContain(".extended-tabs")
        expect(css).not.toMatch(/\.starci-core-[^,{\s]+\s+[>.]/)
    })
})
