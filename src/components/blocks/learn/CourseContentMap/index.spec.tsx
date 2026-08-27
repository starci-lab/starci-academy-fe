import { act, render, screen } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { CourseContentMap } from "."

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ push }),
}))

vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({
    useQueryCourseOutlineSwr: () => ({
        data: {
            progress: { completionPercent: 50, lessonsRead: 1, lessonsTotal: 2 },
            modules: [{
                id: "module-1",
                title: "Cached module",
                lessons: [{ id: "lesson-1", title: "Cached lesson", minutesRead: 5, isRead: true }],
            }],
        },
        error: undefined,
    }),
}))

describe("CourseContentMap hydration", () => {
    it("keeps cached browser data out of SSR and adopts it after mount", async () => {
        const html = renderToString(<CourseContentMap displayId="fullstack-mastery" />)

        expect(html).not.toContain("Cached module")
        expect(html).toContain("aria-label=\"today.progressLabel\"")
        expect(html).not.toContain("SelectionList")

        render(<CourseContentMap displayId="fullstack-mastery" />)
        expect(await screen.findByText("Cached module")).toBeInTheDocument()
    })

    it("hydrates the deterministic pending outline without replacing the server tree", async () => {
        const container = document.createElement("div")
        container.innerHTML = renderToString(<CourseContentMap displayId="fullstack-mastery" />)
        document.body.append(container)
        const errors: Array<Array<unknown>> = []
        const error = vi.spyOn(console, "error").mockImplementation((...args) => {
            errors.push(args)
        })

        await act(async () => {
            hydrateRoot(container, <CourseContentMap displayId="fullstack-mastery" />)
        })

        expect(errors.flat().join(" ")).not.toContain("Hydration failed")
        expect(await screen.findByText("Cached module")).toBeInTheDocument()
        error.mockRestore()
        container.remove()
    })
})
