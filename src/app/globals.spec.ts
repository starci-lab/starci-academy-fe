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
})
