import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseFoundationResourcePage } from "./index"
type StateProps = { state: string; on?: { back?: () => void; retry?: () => void; openPlayground?: () => void } }

const useQueryFoundationSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryFoundationSwr", () => ({ useQueryFoundationSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("./component", () => ({
    CourseFoundationResourcePageBase: ({ state, on }: StateProps) => <><div data-testid="state">{state}</div><button onClick={on?.back}>back</button><button onClick={on?.retry}>retry</button><button onClick={on?.openPlayground}>playground</button></>,
}))

describe("CourseFoundationResourcePage", () => {
    beforeEach(() => useQueryFoundationSwr.mockReset())

    it.each([
        [{ error: new Error("network"), data: undefined }, "failed"],
        [{ error: undefined, data: undefined }, "pending"],
        [{ error: undefined, data: null }, "not-found"],
        [{ error: undefined, data: { id: "foundation-1" } }, "ready"],
    ])("resolves %s state", (query, state) => {
        useQueryFoundationSwr.mockReturnValue({ ...query, mutate: vi.fn() })
        render(<CourseFoundationResourcePage displayId="course" categoryId="category" foundationId="foundation" />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })
    it("dispatches resource navigation and retry", () => { useQueryFoundationSwr.mockReturnValue({ data: { id: "foundation" }, error: undefined, mutate: vi.fn() }); render(<CourseFoundationResourcePage displayId="course" categoryId="category" foundationId="foundation" />); screen.getByText("back").click(); screen.getByText("retry").click(); screen.getByText("playground").click() })
})
