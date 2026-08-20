import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoursePlaygroundPage } from "./index"
type StateProps = { state: string; on?: { openSetup?: (slug: string) => void; retry?: () => void } }

const useQueryCourseSwr = vi.hoisted(() => vi.fn())
const useQueryPlaygroundsSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr }))
vi.mock("@/hooks/swr/useQueryPlaygroundsSwr", () => ({ useQueryPlaygroundsSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("./component", () => ({
    CoursePlaygroundPageBase: ({ state, on }: StateProps) => <><div data-testid="state">{state}</div><button onClick={() => on?.openSetup?.("python")}>open</button><button onClick={on?.retry}>retry</button></>,
}))

describe("CoursePlaygroundPage", () => {
    beforeEach(() => {
        useQueryCourseSwr.mockReset()
        useQueryPlaygroundsSwr.mockReset()
    })

    it.each([
        [{ error: new Error("course"), data: null }, { error: undefined, data: [] }, "failed"],
        [{ error: undefined, data: undefined }, { error: undefined, data: [] }, "pending"],
        [{ error: undefined, data: { id: "course-1" } }, { error: undefined, data: [] }, "empty"],
        [{ error: undefined, data: { id: "course-1" } }, { error: undefined, data: [{ slug: "python" }] }, "ready"],
    ])("resolves %s state", (course, playgrounds, state) => {
        useQueryCourseSwr.mockReturnValue(course)
        useQueryPlaygroundsSwr.mockReturnValue({ ...playgrounds, mutate: vi.fn() })
        render(<CoursePlaygroundPage displayId="course" />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })
    it("dispatches setup and retry intents", () => { useQueryCourseSwr.mockReturnValue({ data: { id: "course" }, error: undefined, mutate: vi.fn() }); useQueryPlaygroundsSwr.mockReturnValue({ data: [{ slug: "python" }], error: undefined, mutate: vi.fn() }); render(<CoursePlaygroundPage displayId="course" />); screen.getByText("open").click(); screen.getByText("retry").click() })
    it("waits for the playground catalog after course identity settles", () => { useQueryCourseSwr.mockReturnValue({ data: { id: "course" }, error: undefined, mutate: vi.fn() }); useQueryPlaygroundsSwr.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() }); render(<CoursePlaygroundPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent("pending") })
})
