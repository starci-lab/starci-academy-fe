/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseContentMap } from "."

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    useQueryCourseOutlineSwr: vi.fn(),
}))

type TranslationValues = { readonly total?: number; readonly minutes?: number }

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: TranslationValues) =>
        values?.total === undefined
            ? values?.minutes === undefined ? key : `${values.minutes} min`
            : `${values.total} contents`,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({
    useQueryCourseOutlineSwr: mocks.useQueryCourseOutlineSwr,
}))

beforeEach(() => {
    mocks.push.mockReset()
    mocks.useQueryCourseOutlineSwr.mockReset().mockReturnValue({
        data: {
            progress: { completionPercent: 25, lessonsRead: 1, lessonsTotal: 4 },
            modules: [{
                id: "module-1",
                title: "Foundations",
                lessons: [{
                    id: "lesson-1",
                    title: "Latency",
                    minutesRead: 8,
                    isRead: false,
                }],
            }],
        },
        error: undefined,
    })
})

describe("CourseContentMap", () => {
    it("routes a selected source lesson through its owning module", () => {
        render(<CourseContentMap displayId="system-design" currentLessonId="lesson-1" />)
        fireEvent.click(screen.getByText("Latency"))
        expect(mocks.push).toHaveBeenCalledWith(
            "/courses/system-design/learn/content/modules/module-1/contents/lesson-1",
        )
    })

    it("filters the source-backed tree from the submitted course search", () => {
        render(<CourseContentMap displayId="system-design" />)
        const search = screen.getByRole("searchbox", { name: "content.searchLabel" })
        fireEvent.change(search, { target: { value: "missing" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(screen.queryByText("Foundations")).toBeNull()
    })
})
