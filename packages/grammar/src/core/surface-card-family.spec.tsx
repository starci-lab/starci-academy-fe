import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SurfaceCard } from "../common/index.js"
import { HeritageGrammarRoot } from "../heritage/index.js"
import { CoreGrammarRoot } from "./index.js"

describe("Common SurfaceCard family material anatomy", () => {
    it("renders the HeroUI v3 Card compound root, header, and content slots", () => {
        const markup = renderToStaticMarkup(
            <CoreGrammarRoot>
                <SurfaceCard label="Progress"><p>42%</p></SurfaceCard>
            </CoreGrammarRoot>,
        )
        expect(markup).toContain("data-grammar-family=\"core\"")
        expect(markup).toMatch(/<section[^>]*data-slot="card"/)
        expect(markup).toMatch(/data-slot="card-header"[^>]*data-grammar-surface-label="true"/)
        expect(markup).toMatch(/data-slot="card-content"[^>]*data-grammar-frame="bounded"/)
        expect(markup).toContain("data-grammar-surface-labelled=\"true\"")
        const outer = markup.indexOf("data-grammar-surface-labelled=\"true\"")
        const label = markup.indexOf("data-grammar-surface-label=\"true\"", outer)
        const frame = markup.indexOf("data-grammar-frame=\"bounded\"", label)
        expect(outer).toBeGreaterThanOrEqual(0)
        expect(label).toBeGreaterThan(outer)
        expect(frame).toBeGreaterThan(label)
    })

    it("keeps identical Common anatomy under Heritage for its label-outside paint binding", () => {
        const markup = renderToStaticMarkup(
            <HeritageGrammarRoot>
                <SurfaceCard label="Overview"><p>Content</p></SurfaceCard>
            </HeritageGrammarRoot>,
        )
        expect(markup).toContain("data-grammar-family=\"heritage\"")
        expect(markup).toMatch(/<section[^>]*data-slot="card"/)
        const label = markup.indexOf("data-slot=\"card-header\"")
        const material = markup.indexOf("data-slot=\"card-content\"")
        expect(label).toBeGreaterThanOrEqual(0)
        expect(material).toBeGreaterThan(label)
    })
})
