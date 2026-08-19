type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as unknown, error: undefined as unknown, mutate: vi.fn(), push: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr", () => ({ useQueryMyInProgressMockInterviewSessionSwr: () => ({ data: undefined, error: undefined, mutate: vi.fn() }) }))
vi.mock("@/hooks/swr/useMutateStartMockInterviewSessionSwr", () => ({ useMutateStartMockInterviewSessionSwr: () => ({ isMutating: false, trigger: vi.fn() }) }))
vi.mock("./component", () => ({ _CourseMockInterviewSetupPage: ({ state }: TestPageInput) => <output data-testid="state">{state}</output> }))
import { CourseMockInterviewSetupPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined })
describe("CourseMockInterviewSetupPage route", () => { it("renders loading then failed transport states", () => { const view = render(<CourseMockInterviewSetupPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading/); m.error = new Error("offline"); view.rerender(<CourseMockInterviewSetupPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/failed|error/) }) })





