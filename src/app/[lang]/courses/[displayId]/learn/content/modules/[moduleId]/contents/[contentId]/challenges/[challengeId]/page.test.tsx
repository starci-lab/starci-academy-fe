import { describe, expect, it, vi } from "vitest"
import ContentChallengeRoute from "./page"

const mocks = vi.hoisted(() => ({ CourseLearnChallengePage: vi.fn(() => null) }))

vi.mock("@/components/pages/CourseLearnChallengePage", () => ({
    CourseLearnChallengePage: mocks.CourseLearnChallengePage,
}))

describe("ContentChallengeRoute", () => {
    it("hands every exact route segment to the connected challenge twin", async () => {
        const element = await ContentChallengeRoute({
            params: Promise.resolve({
                lang: "en",
                displayId: "course-slug",
                moduleId: "module-1",
                contentId: "content-1",
                challengeId: "challenge-1",
            }),
        })

        expect(element.type).toBe(mocks.CourseLearnChallengePage)
        expect(element.props).toEqual({
            displayId: "course-slug",
            moduleId: "module-1",
            contentId: "content-1",
            challengeId: "challenge-1",
        })
    })
})
