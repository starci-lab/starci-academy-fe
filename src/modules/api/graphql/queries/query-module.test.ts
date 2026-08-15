import { print } from "graphql"
import { describe, expect, it } from "vitest"
import { QueryModule, queryModuleMap } from "./query-module"

describe("queryModuleMap", () => {
    it("reads only the trial-safe module outline", () => {
        const document = print(queryModuleMap[QueryModule.Query1])

        expect(document).toContain("contents {\n        id\n        title\n        orderIndex")
        expect(document).not.toContain("minutesRead")
        expect(document).not.toContain("isPremium")
        expect(document).not.toContain("challenges")
    })
})
