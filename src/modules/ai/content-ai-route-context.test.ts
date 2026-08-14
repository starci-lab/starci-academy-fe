import { describe, expect, it } from "vitest"
import {
    isContentAiRouteHidden,
    normalizeContentAiPath,
    resolveContentAiRouteAnchor,
} from "./content-ai-route-context"

describe("content-ai-route-context", () => {
    it("normalizes locale, query and trailing slash", () => {
        expect(normalizeContentAiPath("/vi/courses/fullstack/learn/?tab=source")).toBe("/courses/fullstack/learn")
    })

    it("selects the narrowest supported route scope", () => {
        expect(resolveContentAiRouteAnchor("/en/courses/course-1/learn/content/modules/module-1/contents/content-1"))
            .toMatchObject({ scope: "content", id: "content-1" })
        expect(resolveContentAiRouteAnchor("/courses/course-1/foundations/foundation-1"))
            .toMatchObject({ scope: "foundation", id: "foundation-1" })
        expect(resolveContentAiRouteAnchor("/dashboard")).toEqual({ scope: "global", path: "/dashboard" })
    })

    it("hides authentication and live full-bleed evaluation routes", () => {
        expect(isContentAiRouteHidden("/en/authentication")).toBe(true)
        expect(isContentAiRouteHidden("/en/courses/a/learn/challenge/b")).toBe(true)
        expect(isContentAiRouteHidden("/en/courses/a/learn/content/b")).toBe(false)
    })
})
