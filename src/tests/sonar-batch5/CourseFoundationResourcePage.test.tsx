import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseFoundationResourcePage } from "../../components/pages/CourseFoundationResourcePage"
type StateProps = { state: string }

const useQueryFoundationSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryFoundationSwr", () => ({ useQueryFoundationSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("../../components/pages/CourseFoundationResourcePage/component", () => ({
    CourseFoundationResourcePageBase: ({ state }: StateProps) => <div data-testid="state">{state}</div>,
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
})
