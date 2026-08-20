import { describe, expect, it, vi } from "vitest"
import LearnIndexPage from "./page"

const mocks = vi.hoisted(() => ({ redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT") }) }))

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }))

describe("LearnIndexPage", () => {
    it("forwards the bare learn entry to the legacy content home", async () => {
        await expect(LearnIndexPage({
            params: Promise.resolve({ lang: "vi", displayId: "fullstack-mastery" }),
        })).rejects.toThrow("NEXT_REDIRECT")
        expect(mocks.redirect).toHaveBeenCalledWith("/vi/courses/fullstack-mastery/learn/content")
    })
})
