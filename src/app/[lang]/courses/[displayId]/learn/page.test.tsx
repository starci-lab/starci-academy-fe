import { describe, expect, it, vi } from "vitest"
import LearnIndexPage from "./page"

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }))

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }))

describe("LearnIndexPage", () => {
    it("keeps the legacy learn entry pointed at the content curriculum", async () => {
        await LearnIndexPage({ params: Promise.resolve({ lang: "vi", displayId: "fullstack-mastery" }) })

        expect(mocks.redirect).toHaveBeenCalledWith("/vi/courses/fullstack-mastery/learn/content")
    })
})
