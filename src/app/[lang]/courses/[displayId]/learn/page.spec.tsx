import { describe, expect, it, vi } from "vitest"
import LearnIndexPage from "./page"

const mocks = vi.hoisted(() => ({ CourseLearnContentHomePage: vi.fn(() => null) }))

vi.mock("@/components/pages/CourseLearnContentHomePage", () => ({
    CourseLearnContentHomePage: mocks.CourseLearnContentHomePage,
}))

describe("LearnIndexPage", () => {
    it("mounts the course dashboard at the bare learn entry", async () => {
        const element = await LearnIndexPage({
            params: Promise.resolve({ lang: "vi", displayId: "fullstack-mastery" }),
        })

        expect(element.type).toBe(mocks.CourseLearnContentHomePage)
        expect(element.props).toEqual({ displayId: "fullstack-mastery" })
    })
})
