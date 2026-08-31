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

    it("centres the first feature icon over the same inset as its active indicator", () => {
        expect(css).toMatch(/\.extended-tabs \.tabs__tab:first-child\s*\{[\s\S]*?padding-inline-start: 0\.75rem !important;/)
        expect(css).toMatch(/\.starci-core-navigation-feature-nav-primary\.starci-core-page-container,[\s\S]*?\.starci-core-navigation-feature-nav-feature\.starci-core-page-container\s*\{[\s\S]*?padding-inline: 0\.75rem !important;/)
        expect(css).not.toMatch(/\.starci-core-navigation-feature-nav-feature \.extended-tabs \.tabs__tab:first-child\s*\{[\s\S]*?padding-inline-start: 0 !important;/)
        expect(css).not.toMatch(/grid-template-columns: 16rem minmax\(0, 1fr\) !important;/)
    })

    it("centres nested compact-subnav links instead of baseline-aligning them", () => {
        expect(css).toMatch(/\.starci-core-subnav-title\s*\{[\s\S]*?display: flex !important;[\s\S]*?align-items: center !important;/)
    })
})
