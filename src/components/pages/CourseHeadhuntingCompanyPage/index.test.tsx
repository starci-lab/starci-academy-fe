import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as any, error: undefined as any, mutate: vi.fn(), push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("./component", () => ({ _CourseHeadhuntingCompanyPage: ({ state }: any) => <output data-testid="state">{state}</output> }))
import { CourseHeadhuntingCompanyPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined })
describe("CourseHeadhuntingCompanyPage route", () => {
 it("renders loading then failed transport states", () => { const view = render(<CourseHeadhuntingCompanyPage displayId="course" companyId="company" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/); m.error = new Error("offline"); view.rerender(<CourseHeadhuntingCompanyPage displayId="course" companyId="company" />); expect(screen.getByTestId("state")).toHaveTextContent(/failed|error/) })
})
