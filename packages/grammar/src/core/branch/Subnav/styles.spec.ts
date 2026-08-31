import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync(new URL("../../styles.css", import.meta.url), "utf8")

describe("Core Subnav styles", () => {
    it("centres title content within the subnav row", () => {
        expect(css).toMatch(/\.starci-core-subnav-title\s*\{[\s\S]*?display: flex;[\s\S]*?align-items: center;/)
    })
})
