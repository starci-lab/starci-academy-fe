import { describe, expect, it } from "vitest"
import { isLiveAssessmentRoute } from "./is-live-assessment-route"

describe("isLiveAssessmentRoute", () => {
    it.each([
        "/courses/course-1/learn/mind-map",
        "/courses/course-1/learn/mock-interview/interview/session-1",
        "/courses/course-1/learn/playground/react/session",
        "/courses/course-1/learn/flashcards/review/sessions/session-1",
        "/courses/course-1/learn/flashcards/quiz/sessions/session-1",
    ])("recognizes a live full-bleed learn route: %s", (pathname) => {
        expect(isLiveAssessmentRoute(pathname)).toBe(true)
    })

    it.each([
        "/courses/course-1/learn",
        "/courses/course-1/learn/content/modules/module-1/contents/content-1",
        "/courses/course-1/learn/content/modules/module-1/contents/content-1/challenges/challenge-1",
        "/courses/course-1/learn/mock-interview/interview/session-1/result",
        "/courses/course-1/learn/flashcards/quiz/sessions/session-1/result",
    ])("keeps ordinary and completed learn routes outside the live boundary: %s", (pathname) => {
        expect(isLiveAssessmentRoute(pathname)).toBe(false)
    })
})

