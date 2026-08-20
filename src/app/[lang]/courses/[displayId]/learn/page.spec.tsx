import { describe, expect, it, vi } from "vitest"
import LearnIndexPage from "./page"

const mocks = vi.hoisted(() => ({ CourseLearnTodayPage: vi.fn(() => null) }))

vi.mock("@/components/pages/CourseLearnTodayPage", () => ({
    CourseLearnTodayPage: mocks.CourseLearnTodayPage,
}))

describe("LearnIndexPage", () => {
    it("mounts the course dashboard at the bare learn entry", async () => {
        const element = await LearnIndexPage({
            params: Promise.resolve({ lang: "vi", displayId: "fullstack-mastery" }),
        })

        expect(element.type).toBe(mocks.CourseLearnTodayPage)
        expect(element.props).toEqual({ displayId: "fullstack-mastery" })
    })
})
