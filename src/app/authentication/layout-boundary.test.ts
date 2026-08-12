import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/** Read one app-router source file exactly as Next sees it. */
const readAppFile = (path: string): string => readFileSync(join(process.cwd(), "src", "app", path), "utf8")

describe("authentication layout boundary", () => {
    it("keeps product navigation out of the root shared by authentication", () => {
        expect(readAppFile("layout.tsx")).not.toContain("ShellNav")
    })

    it("mounts product navigation only inside the dashboard route family", () => {
        const dashboardLayout = readAppFile(join("dashboard", "layout.tsx"))
        expect(dashboardLayout).toContain("from \"@/components/layouts/ShellNav\"")
        expect(dashboardLayout).toContain("<ShellNav />")
    })
})
