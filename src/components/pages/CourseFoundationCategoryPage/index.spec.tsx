import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseFoundationCategoryPage } from "./index"
type StateProps = { state: string; on?: { search?: (value: string) => void; openResource?: (id: string) => void; retry?: () => void } }

const useQueryFoundationsSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryFoundationsSwr", () => ({ useQueryFoundationsSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("./component", () => ({
    CourseFoundationCategoryPageBase: ({ state, on }: StateProps) => <><div data-testid="state">{state}</div><button onClick={() => on?.search?.("query")}>search</button><button onClick={() => on?.openResource?.("foundation")}>open</button><button onClick={on?.retry}>retry</button></>,
}))

describe("CourseFoundationCategoryPage", () => {
    beforeEach(() => useQueryFoundationsSwr.mockReset())

    it.each([
        [{ error: new Error("network"), data: undefined }, "failed"],
        [{ error: undefined, data: undefined }, "pending"],
        [{ error: undefined, data: { data: [] } }, "empty"],
        [{ error: undefined, data: { data: [{ id: "foundation-1" }] } }, "ready"],
    ])("resolves %s state", (query, state) => {
        useQueryFoundationsSwr.mockReturnValue({ ...query, mutate: vi.fn() })
        render(<CourseFoundationCategoryPage displayId="course" categoryId="category" />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })
    it("dispatches search, resource and retry intents", () => { useQueryFoundationsSwr.mockReturnValue({ data: { data: [{ id: "foundation" }] }, error: undefined, mutate: vi.fn() }); render(<CourseFoundationCategoryPage displayId="course" categoryId="category" />); screen.getByText("search").click(); screen.getByText("open").click(); screen.getByText("retry").click() })
})
