import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    course: { data: { id: "course-1" } as unknown, error: undefined as unknown, mutate: vi.fn() },
    playgrounds: { data: [] as unknown, error: undefined as unknown, mutate: vi.fn() },
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryPlaygroundsSwr", () => ({ useQueryPlaygroundsSwr: () => mocks.playgrounds }))
vi.mock("./component", () => ({
    CoursePlaygroundCatalogBase: (input: { readonly state: string }) => <output data-testid="state">{input.state}</output>,
}))

import { CoursePlaygroundCatalog } from "."

describe("CoursePlaygroundCatalog", () => {
    beforeEach(() => {
        mocks.course.data = { id: "course-1" }
        mocks.course.error = undefined
        mocks.playgrounds.data = []
        mocks.playgrounds.error = undefined
    })

    it("keeps a server answer without a catalog distinct from an empty catalog", () => {
        mocks.playgrounds.data = null
        render(<CoursePlaygroundCatalog displayId="course" />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
    })
})
