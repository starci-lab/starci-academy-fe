type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
type PriceOverlayInput = { isOpen: boolean; onDismiss: () => void }
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ catalog: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, mine: { data: undefined as unknown }, push: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push }) }))
vi.mock("@/hooks", () => ({ useQueryCoursesSwr: () => m.catalog, useQueryMyCoursesSwr: () => m.mine }))
vi.mock("@/components/overlays/courses/CoursePriceOverlay", () => ({ CoursePriceOverlay: ({ isOpen, onDismiss }: PriceOverlayInput) => isOpen ? <button onClick={onDismiss}>dismiss</button> : null }))
vi.mock("./component", () => ({ CoursesCatalogPageBase: ({ state, on }: TestPageInput) => <><output data-testid="state">{state}</output><button onClick={on.goHome}>home</button><button onClick={() => on.search("x")}>search</button><button onClick={() => on.changeView("line")}>line</button><button onClick={() => on.recover()}>recover</button><button onClick={() => on["view:c1"]?.()}>view</button></> }))
import { CoursesCatalogPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.catalog.data = undefined; m.catalog.error = undefined; m.mine.data = []; Object.defineProperty(window, "localStorage", { configurable: true, value: { getItem: vi.fn(), setItem: vi.fn() } }) })
describe("CoursesCatalogPage route", () => {
    it("distinguishes pending, failed, empty and ready catalog answers", () => { const view = render(<CoursesCatalogPage />); expect(screen.getByTestId("state")).toHaveTextContent("pending"); m.catalog.error = new Error("offline"); view.rerender(<CoursesCatalogPage />); expect(screen.getByTestId("state")).toHaveTextContent("failed"); m.catalog.error = undefined; m.catalog.data = { count: 0, data: [] }; view.rerender(<CoursesCatalogPage />); expect(screen.getByTestId("state")).toHaveTextContent("empty"); m.catalog.data = { count: 1, data: [{ id: "c1", title: "Course", originalPrice: 100, pricingPhases: [] }] }; view.rerender(<CoursesCatalogPage />); expect(screen.getByTestId("state")).toHaveTextContent("ready") })
    it("wires recovery, search, layout and navigation", () => { m.catalog.data = { count: 1, data: [{ id: "c1", title: "Course", originalPrice: 100, pricingPhases: [] }] }; render(<CoursesCatalogPage />); fireEvent.click(screen.getByText("home")); fireEvent.click(screen.getByText("search")); fireEvent.click(screen.getByText("line")); fireEvent.click(screen.getByText("view")); expect(m.push).toHaveBeenCalledWith("/dashboard"); expect(m.push).toHaveBeenCalledWith("/courses/c1") })
})





