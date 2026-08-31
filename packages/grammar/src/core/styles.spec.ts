import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { STARCI_CORE_TOKEN_DEFAULTS, STARCI_CORE_TOKEN_NAMES } from "./dna.js"

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8")

describe("Core capability styles", () => {
    it("packages the StarCi DNA behind one explicit root boundary", () => {
        expect(css).toMatch(/\.starci-core-root\s*\{[\s\S]*?--starci-core-accent: #7547ff;/)
        expect(css).toMatch(/\.starci-core-root\s*\{[\s\S]*?--starci-core-surface-radius: 1rem;/)
        expect(css).toMatch(/\.starci-core-root\[data-grammar-theme="dark"\]\s*\{[\s\S]*?color-scheme: dark;/)
        expect(css).toContain(".starci-core-root[data-grammar-theme=\"system\"]")
        expect(css).toContain("@media (forced-colors: active)")
        for (const tokenName of Object.values(STARCI_CORE_TOKEN_NAMES)) {
            expect(css, `missing CSS definition for ${tokenName}`).toContain(`${tokenName}:`)
        }
        for (const [tokenName, value] of Object.entries(STARCI_CORE_TOKEN_DEFAULTS)) {
            expect(css, `CSS default drifted from ${tokenName}`).toContain(`${tokenName}: ${value};`)
        }
    })

    it("owns reusable page, section, media and primary-rail compositions", () => {
        expect(css).toContain(".starci-core-page-container")
        expect(css).toContain(".starci-core-section-header")
        expect(css).toContain(".starci-core-media-viewport")
        expect(css).toMatch(/\.starci-core-primary-rail-container\s*\{[\s\S]*?container: starci-core-primary-rail \/ inline-size;/)
        expect(css).toContain("@container starci-core-primary-rail (max-width: 56rem)")
    })

    it("owns included-mark, compact copy and accordion anatomy instead of UI knowledge", () => {
        expect(css).toMatch(/\.starci-core-included-mark\s*\{[\s\S]*?width: 1\.25rem;[\s\S]*?height: 1\.25rem;[\s\S]*?color: inherit;/)
        expect(css).toMatch(/\.starci-core-surface-copy-group\s*\{[\s\S]*?gap: 0\.5rem;/)
        expect(css).toContain(".starci-core-accordion-trigger")
        expect(css).toContain(".starci-core-accordion-panel")
    })

    it("owns compact form measure, bounded branch scrolling and field rhythm", () => {
        expect(css).toMatch(/\.starci-core-form-page\s*\{[\s\S]*?align-items: center;[\s\S]*?justify-content: center;[\s\S]*?overflow: hidden;/)
        expect(css).toMatch(/\.starci-core-form-scroll-viewport\s*\{[\s\S]*?width: 100%;[\s\S]*?max-height: calc\(100dvh - 3rem\);/)
        expect(css.match(/\.starci-core-form-scroll-viewport\s*\{[\s\S]*?\}/)?.[0]).not.toContain("overflow-y")
        expect(css).toMatch(/\.starci-core-form-surface\s*\{[\s\S]*?width: min\(100%, var\(--starci-core-form-measure, 30rem\)\);/)
        expect(css).toMatch(/\.starci-core-form-surface--compact\s*\{[\s\S]*?width: min\(100%, var\(--starci-core-form-compact-measure, 28rem\)\);/)
        expect(css).toMatch(/\.starci-core-form-surface > \.card\s*\{[\s\S]*?max-height: calc\(100dvh - 3rem\);[\s\S]*?overflow: hidden !important;[\s\S]*?padding: 0 !important;/)
        expect(css).toMatch(/\.starci-core-form-field\s*\{[\s\S]*?flex-direction: column;[\s\S]*?gap: var\(--starci-core-field-gap, 0\.5rem\);/)
        expect(css).toMatch(/\.starci-core-form-label--screen-reader\s*\{[\s\S]*?position: absolute;[\s\S]*?clip: rect\(0, 0, 0, 0\);/)
        expect(css).toMatch(/\.starci-core-horizontal-scroll-region\s*\{[\s\S]*?overscroll-behavior-inline: contain;/)
        expect(css).toMatch(/\.starci-core-horizontal-scroll-region > \*\s*\{[\s\S]*?min-width: max-content;/)
    })

    it("keeps canonical surface, collection and rail selectors", () => {
        expect(css).toContain("[data-grammar-scroll=\"contained\"]")
        expect(css).toContain(".starci-core-surface.starci-core-frameless-surface")
        expect(css).toContain(".starci-core-surface-highlight-sweep")
        expect(css).toContain(".starci-core-label")
        expect(css).toContain(".starci-core-tooltip")
        expect(css).toMatch(/\.starci-core-tooltip:hover > \.starci-core-tooltip-content,[\s\S]*?opacity: 1;/)
        expect(css).toContain("animation: starci-core-highlight-spin 3s linear infinite")
        const highlightRule = css.match(/\.starci-core-surface-highlight-sweep\s*\{([\s\S]*?)\}/)?.[1] ?? ""
        expect(highlightRule).toContain("inset: var(--starci-core-highlight-inset, 0)")
        expect(highlightRule).toContain("padding: 2px")
        expect(highlightRule).toContain("mask-composite: exclude")
        expect(highlightRule).not.toContain("inset: -")
        expect(css).toContain(".starci-core-owned-collection")
        expect(css).toContain("[data-grammar-collapse=\"collapsed\"]")
        expect(css).toContain(".starci-core-surface-accordion-card")
    })

    it("hides scrollbar chrome by default without disabling overflow", () => {
        expect(css).toMatch(/\.starci-core-root,\s*\.starci-core-root \*\s*\{[\s\S]*?scrollbar-width: none;/)
        expect(css).toMatch(/\.starci-core-root::-webkit-scrollbar,[\s\S]*?display: none;[\s\S]*?width: 0;[\s\S]*?height: 0;/)
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

    it("supports a leading dashboard rail with a vertical separator", () => {
        expect(css).toMatch(/data-grammar-dashboard-rail-position="leading"\]\[data-grammar-dashboard-navigation="absent"\]\[data-grammar-dashboard-rail="present"\][\s\S]*?grid-template-areas: "rail rule primary"/)
        expect(css).toContain(".starci-core-dashboard-shell-leading-rule")
        expect(css).toMatch(/\.starci-core-dashboard-shell-leading-rule[\s\S]*?align-self: stretch/)
    })
})
