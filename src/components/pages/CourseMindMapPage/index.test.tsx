type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as unknown, error: undefined as unknown, mutate: vi.fn(), push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))

vi.mock("@/hooks/swr/useQueryCourseMindMapSwr", () => ({ useQueryCourseMindMapSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("./component", () => ({ CourseMindMapPageBase: ({ state }: TestPageInput) => <output data-testid="state">{state}</output> }))
import { CourseMindMapPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined })
describe("CourseMindMapPage route", () => {
    it("renders loading then failed transport states", () => { const view = render(<CourseMindMapPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/); m.error = new Error("offline"); view.rerender(<CourseMindMapPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/failed|error/) })
})





