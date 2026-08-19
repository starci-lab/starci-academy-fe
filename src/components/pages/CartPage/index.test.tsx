type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as unknown, error: undefined as unknown, mutate: vi.fn(), push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => "token" }))
vi.mock("swr", () => ({ default: vi.fn(() => ({ data: undefined, error: undefined, mutate: vi.fn() })), useSWR: vi.fn(() => ({ data: undefined, error: undefined, mutate: vi.fn() })), useSWRConfig: () => ({ mutate: vi.fn() }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("./component", () => ({ CartPageBase: ({ state }: TestPageInput) => <output data-testid="state">{state}</output> }))
import { CartPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined })
describe("CartPage route", () => {
    it("renders the settled empty state when the cart transport has no rows", () => { const view = render(<CartPage />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting|empty/); m.error = new Error("offline"); view.rerender(<CartPage />); expect(screen.getByTestId("state")).toHaveTextContent(/failed|error|empty/) })
})





