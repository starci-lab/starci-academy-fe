import { describe, expect, it, vi } from "vitest"
import ContentChallengeResultRoute from "./page"

const mocks = vi.hoisted(() => ({ CourseLearnChallengeResultPage: vi.fn(() => null) }))

vi.mock("@/components/pages/CourseLearnChallengeResultPage", () => ({
    CourseLearnChallengeResultPage: mocks.CourseLearnChallengeResultPage,
}))

describe("ContentChallengeResultRoute", () => {
    it("hands every exact route segment to the connected result twin", async () => {
        const element = await ContentChallengeResultRoute({
            params: Promise.resolve({
                lang: "vi",
                displayId: "course-slug",
                moduleId: "module-1",
                contentId: "content-1",
                challengeId: "challenge-1",
            }),
        })

        expect(element.type).toBe(mocks.CourseLearnChallengeResultPage)
        expect(element.props).toEqual({
            displayId: "course-slug",
            moduleId: "module-1",
            contentId: "content-1",
            challengeId: "challenge-1",
        })
    })
})
