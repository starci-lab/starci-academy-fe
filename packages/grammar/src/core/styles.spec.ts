import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8")

describe("Core capability styles", () => {
    it("keeps canonical surface, collection and rail selectors", () => {
        expect(css).toContain("[data-grammar-scroll=\"contained\"]")
        expect(css).toContain(".starci-core-surface.starci-core-frameless-surface")
        expect(css).toContain(".starci-core-owned-collection")
        expect(css).toContain("[data-grammar-collapse=\"collapsed\"]")
    })

    it("keeps every rail control at least 44 by 44 CSS pixels", () => {
        expect(css).toContain(".starci-core-rail :where(button, [role=\"button\"])")
        expect(css).toContain("min-inline-size: 44px")
        expect(css).toContain("min-block-size: 44px")
    })

    it("retains narrow-viewport and reduced-motion safeguards", () => {
        expect(css).toContain("@media (max-width: 47.999rem)")
        expect(css).toContain("@media (prefers-reduced-motion: reduce)")
    })
})
