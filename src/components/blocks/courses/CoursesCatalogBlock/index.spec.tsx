import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestBlockInput = { blockState: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }

const mocks = vi.hoisted(() => ({
    catalog: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    mine: { data: undefined as unknown },
    push: vi.fn(),
}))

vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks", () => ({ useQueryCoursesSwr: () => mocks.catalog, useQueryMyCoursesSwr: () => mocks.mine }))
vi.mock("./component", () => ({
    CoursesCatalogBlockBase: ({ blockState, on }: TestBlockInput) => (
        <>
            <output data-testid="state">{blockState}</output>
            <button onClick={on.goHome}>home</button>
            <button onClick={() => on.search("x")}>search</button>
            <button onClick={() => on.changeView("line")}>line</button>
            <button onClick={() => on.recover()}>recover</button>
            <button onClick={() => on["view:c1"]?.()}>view</button>
        </>
    ),
}))

import { CoursesCatalogBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.catalog.data = undefined
    mocks.catalog.error = undefined
    mocks.mine.data = []
    window.localStorage.clear()
})

describe("CoursesCatalogBlock", () => {
    it("distinguishes pending, failed, empty and ready catalog answers", () => {
        const view = render(<CoursesCatalogBlock />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        mocks.catalog.error = new Error("offline")
        view.rerender(<CoursesCatalogBlock />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        mocks.catalog.error = undefined
        mocks.catalog.data = { count: 0, data: [] }
        view.rerender(<CoursesCatalogBlock />)
        expect(screen.getByTestId("state")).toHaveTextContent("empty")
        mocks.catalog.data = { count: 1, data: [{ id: "c1", title: "Course", originalPrice: 100, pricingPhases: [] }] }
        view.rerender(<CoursesCatalogBlock />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })

    it("wires recovery, search, layout and navigation", () => {
        mocks.catalog.data = { count: 1, data: [{ id: "c1", title: "Course", originalPrice: 100, pricingPhases: [] }] }
        render(<CoursesCatalogBlock />)
        fireEvent.click(screen.getByText("home"))
        fireEvent.click(screen.getByText("search"))
        fireEvent.click(screen.getByText("line"))
        fireEvent.click(screen.getByText("recover"))
        fireEvent.click(screen.getByText("view"))
        expect(mocks.push).toHaveBeenCalledWith("/dashboard")
        expect(mocks.push).toHaveBeenCalledWith("/courses/c1")
    })
})
