import { describe, expect, it } from "vitest"
import {
    isContentAiRouteHidden,
    isSameContentAiAnchor,
    normalizeContentAiPath,
    resolveContentAiAnchorRequest,
    resolveContentAiRouteAnchor,
} from "./content-ai-route-context"

describe("content-ai-route-context", () => {
    it("normalizes locale, query and trailing slash", () => {
        expect(normalizeContentAiPath("/vi/courses/fullstack/learn/?tab=source")).toBe("/courses/fullstack/learn")
    })

    it("selects the narrowest supported route scope", () => {
        expect(resolveContentAiRouteAnchor("/en/courses/course-1/learn/content/modules/module-1/contents/content-1/challenges/challenge-1"))
            .toMatchObject({ scope: "challenge", id: "challenge-1" })
        expect(resolveContentAiRouteAnchor("/en/courses/course-1/learn/content/modules/module-1/contents/content-1"))
            .toMatchObject({ scope: "content", id: "content-1" })
        expect(resolveContentAiRouteAnchor("/courses/course-1/learn/personal-project/tasks/task-1"))
            .toMatchObject({ scope: "task", id: "task-1" })
        expect(resolveContentAiRouteAnchor("/courses/course-1/learn/foundations/category-1/foundation-1"))
            .toMatchObject({ scope: "foundation", id: "foundation-1" })
        expect(resolveContentAiRouteAnchor("/courses/course-1/learn/foundations/category-1"))
            .toMatchObject({ scope: "course", id: "course-1" })
        expect(resolveContentAiRouteAnchor("/dashboard")).toEqual({ scope: "global", path: "/dashboard" })
    })

    it("builds backend anchors without sending a route slug as the course UUID", () => {
        const courseAnchor = resolveContentAiRouteAnchor("/en/courses/fullstack-mastery/learn/content")
        expect(resolveContentAiAnchorRequest(courseAnchor)).toBeNull()
        expect(resolveContentAiAnchorRequest(courseAnchor, "course-uuid"))
            .toEqual({ scope: "course", courseId: "course-uuid" })

        const challengeAnchor = resolveContentAiRouteAnchor("/en/courses/a/learn/content/modules/m/contents/c/challenges/x")
        expect(resolveContentAiAnchorRequest(challengeAnchor))
            .toEqual({ scope: "challenge", challengeId: "x" })
    })

    it("hides authentication and live full-bleed evaluation routes", () => {
        expect(isContentAiRouteHidden("/en/authentication")).toBe(true)
        expect(isContentAiRouteHidden("/en/courses/a/learn/flashcards/quiz/sessions/session-1")).toBe(true)
        expect(isContentAiRouteHidden("/en/courses/a/learn/mock-interview/interview/session-1")).toBe(true)
        expect(isContentAiRouteHidden("/en/courses/a/learn/playground/react/session")).toBe(true)
        expect(isContentAiRouteHidden("/en/courses/a/learn/content/modules/m/contents/c/challenges/x")).toBe(false)
        expect(isContentAiRouteHidden("/en/courses/a/learn/content/b")).toBe(false)
    })

    it("collapses a bare locale, a hash and a trailing slash to the root", () => {
        expect(normalizeContentAiPath("/en")).toBe("/")
        expect(normalizeContentAiPath("/")).toBe("/")
        expect(normalizeContentAiPath("/vi/dashboard#section")).toBe("/dashboard")
        expect(normalizeContentAiPath("/dashboard/")).toBe("/dashboard")
    })

    it("ignores a segment keyword that names nothing after it", () => {
        expect(resolveContentAiRouteAnchor("/challenges")).toEqual({ scope: "global", path: "/challenges" })
        expect(resolveContentAiRouteAnchor("/tasks")).toEqual({ scope: "global", path: "/tasks" })
        expect(resolveContentAiRouteAnchor("/contents")).toEqual({ scope: "global", path: "/contents" })
        expect(resolveContentAiRouteAnchor("/foundations/category-1"))
            .toEqual({ scope: "global", path: "/foundations/category-1" })
        expect(resolveContentAiRouteAnchor("/courses")).toEqual({ scope: "global", path: "/courses" })
    })

    it("builds the request for every non-course scope from the anchor id alone", () => {
        const path = "/anything"
        expect(resolveContentAiAnchorRequest({ scope: "content", id: "c1", path }))
            .toEqual({ scope: "content", contentId: "c1" })
        expect(resolveContentAiAnchorRequest({ scope: "task", id: "t1", path }))
            .toEqual({ scope: "task", taskId: "t1" })
        expect(resolveContentAiAnchorRequest({ scope: "foundation", id: "f1", path }))
            .toEqual({ scope: "foundation", foundationId: "f1" })
        expect(resolveContentAiAnchorRequest({ scope: "global", path }))
            .toEqual({ scope: "global" })
    })

    it("falls back to the global conversation when a scoped anchor lost its id", () => {
        expect(resolveContentAiAnchorRequest({ scope: "content", path: "/contents" }))
            .toEqual({ scope: "global" })
    })

    it("hides every route nested under authentication", () => {
        expect(isContentAiRouteHidden("/authentication/callback")).toBe(true)
        expect(isContentAiRouteHidden("/dashboard")).toBe(false)
    })

    it("treats grounding as unchanged only when scope, id and path all agree", () => {
        const anchor = { scope: "content", id: "c1", path: "/contents/c1" } as const
        expect(isSameContentAiAnchor(anchor, { ...anchor })).toBe(true)
        expect(isSameContentAiAnchor(anchor, { ...anchor, scope: "task" })).toBe(false)
        expect(isSameContentAiAnchor(anchor, { ...anchor, id: "c2" })).toBe(false)
        expect(isSameContentAiAnchor(anchor, { ...anchor, path: "/contents/c1/notes" })).toBe(false)
    })
})
