import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Read one app-router source file exactly as Next sees it.
 *
 * The paths are relative to the LOCALE SHELL, not to `src/app`. When the locale moved into the
 * address every route gained a `[lang]` segment, and this test kept reading the old root - so it
 * asserted things about a file that no longer existed and failed for a reason that had nothing to
 * do with what it guards.
 */
const readAppFile = (path: string): string =>
    readFileSync(join(process.cwd(), "src", "app", "[lang]", path), "utf8")

describe("authentication layout boundary", () => {
    it("keeps product navigation out of the shell shared by authentication", () => {
        expect(readAppFile("layout.tsx")).not.toContain("ShellNav")
    })

    it("mounts product navigation only inside the route families that own it", () => {
        for (const family of ["dashboard", "league"]) {
            const layout = readAppFile(join(family, "layout.tsx"))
            expect(layout).toContain("from \"@/components/layouts/ShellNav\"")
            expect(layout).toContain("<ShellNav {...{}} />")
        }
    })
})
