import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8")

describe("Core capability styles", () => {
    it("keeps canonical surface, collection and rail selectors", () => {
        expect(css).toContain("[data-grammar-scroll=\"contained\"]")
        expect(css).toContain(".starci-core-surface.starci-core-frameless-surface")
        expect(css).toContain(".starci-core-owned-collection")
        expect(css).toContain("[data-grammar-collapse=\"collapsed\"]")
        expect(css).toContain(".starci-core-surface-accordion-card")
    })

    it("keeps disclosure geometry full-width, full-bleed and hover-invariant", () => {
        expect(css).toMatch(/\.starci-core-accordion-shell\s*\{[\s\S]*?width: 100%/)
        expect(css).toMatch(/\.starci-core-accordion-row \+ \.starci-core-accordion-row\s*\{[\s\S]*?border-top:/)
        expect(css).toMatch(/\.starci-core-accordion-trigger\s*\{[\s\S]*?padding:/)
        expect(css).toMatch(/\.starci-core-accordion-trigger:hover,[\s\S]*?background: transparent;[\s\S]*?box-shadow: none;[\s\S]*?transform: none;/)
    })

    it("keeps static joined lists full-bleed and hover-invariant", () => {
        expect(css).toMatch(/\.starci-core-static-row \+ \.starci-core-static-row\s*\{[\s\S]*?border-top:/)
        expect(css).toMatch(/\.starci-core-list-shell\[data-grammar-hover="invariant"\] \.starci-core-static-row:hover\s*\{[\s\S]*?background: transparent;[\s\S]*?box-shadow: none;[\s\S]*?transform: none;/)
    })

    it("keeps ordered row prefixes quiet and free of badge decoration", () => {
        const rule = css.match(/\.starci-core-leading-number\s*\{([\s\S]*?)\}/)?.[1] ?? ""
        expect(rule).toContain("font-size: 0.875rem")
        expect(rule).toContain("font-variant-numeric: tabular-nums")
        expect(rule).not.toContain("border-radius")
        expect(rule).not.toContain("background")
    })

    it("keeps Markdown semantic rhythm, code-chip treatment and bounded overflow", () => {
        expect(css).toMatch(/\.starci-core-markdown-article\s*\{[\s\S]*?font-size: 0\.875rem;/)
        expect(css).toMatch(/\.starci-core-markdown-article :not\(pre\) > code\s*\{[\s\S]*?border-radius: 999px;/)
        expect(css).toMatch(/\.starci-core-markdown-article pre,[\s\S]*?overflow-x: auto;/)
        expect(css).toMatch(/\.starci-core-markdown-article table,[\s\S]*?\.starci-core-markdown-table-frame\s*\{[\s\S]*?overflow-x: auto;/)
        expect(css).toContain(".starci-core-markdown-table-frame")
        expect(css).toContain("[data-grammar-fenced-code-highlight=\"true\"]")
    })

    it("keeps every rail control at least 44 by 44 CSS pixels", () => {
        expect(css).toContain(".starci-core-rail :where(button, [role=\"button\"])")
        expect(css).toContain("min-inline-size: 44px")
        expect(css).toContain("min-block-size: 44px")
    })

    it("lets a layout-owned rail fill its host while its child owns scrolling", () => {
        expect(css).toMatch(/\.starci-core-rail\[data-grammar-rail-height="fill"\][\s\S]*?height: 100%/)
        expect(css).toMatch(/data-grammar-rail-height="fill"\] \.starci-core-rail-frame\s*\{[\s\S]*?max-height: none;/)
        expect(css).toMatch(/data-grammar-rail-height="fill"\] \.starci-core-rail-body\s*\{[\s\S]*?overflow: hidden;/)
    })

    it("retains narrow-viewport and reduced-motion safeguards", () => {
        expect(css).toContain("@media (max-width: 47.999rem)")
        expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    })
})
