type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as unknown, error: undefined as unknown, company: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, consultants: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("@/hooks/swr/useQueryHeadhuntingCompanySwr", () => ({ useQueryHeadhuntingCompanySwr: () => m.company }))
vi.mock("@/hooks/swr/useQueryConsultantsSwr", () => ({ useQueryConsultantsSwr: () => m.consultants }))
vi.mock("./component", () => ({ CourseHeadhuntingCompanyPageBase: ({ state }: TestPageInput) => <output data-testid="state">{state}</output> }))
import { CourseHeadhuntingCompanyPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined; m.company.data = undefined; m.company.error = undefined; m.consultants.data = undefined; m.consultants.error = undefined })
describe("CourseHeadhuntingCompanyPage route", () => {
    it("renders loading then failed transport states", () => { const view = render(<CourseHeadhuntingCompanyPage displayId="course" companyId="company" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/); m.error = new Error("offline"); view.rerender(<CourseHeadhuntingCompanyPage displayId="course" companyId="company" />); expect(screen.getByTestId("state")).toHaveTextContent(/failed|error/) })
    it("renders a settled company and consultant directory", () => { m.data = { id: "course", title: "Course" }; m.company.data = { id: "company", title: "Company", email: "company@example.com", websiteUrl: "https://example.com" }; m.consultants.data = { data: [{ id: "u", fullName: "Ada", jobTitle: "Engineer", description: null, contactUnlocked: true, email: "ada@example.com", linkedinUrl: null, phoneNumber: null, zaloNumber: null, cvScoreUnlockThreshold: 70 }] }; const view = render(<CourseHeadhuntingCompanyPage displayId="course" companyId="company" />); expect(screen.getByTestId("state")).toHaveTextContent("ready"); view.unmount() })
})





