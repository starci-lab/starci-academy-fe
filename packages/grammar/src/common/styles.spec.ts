import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8")

describe("Common renderer anatomy CSS", () => {
    it("is complete without importing a visual family", () => {
        expect(css).not.toMatch(/@import\s+["']\.\.\/core/)
        for (const selector of [
            ".starci-core-page-container",
            ".starci-core-surface-card",
            ".starci-core-tabs",
            ".starci-core-workspace-shell",
            ".starci-core-chat-workspace",
        ]) expect(css).toContain(selector)
    })

    it("publishes universal geometry without selecting a family palette", () => {
        expect(css).toContain("--grammar-inline-gap: 0.5rem")
        expect(css).toContain("--grammar-page-inset: clamp(1rem, 3vw, 2rem)")
        expect(css).not.toContain("--starci-core-accent: #7547ff")
        expect(css).not.toContain("data-grammar-family=\"core\"")
    })
})
