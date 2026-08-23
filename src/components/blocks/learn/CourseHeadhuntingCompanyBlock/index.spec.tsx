import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { blockState: string; on: Record<string, ((...args: ReadonlyArray<unknown>) => unknown) | undefined> }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    company: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    consultants: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    push: vi.fn(), locale: "en",
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryHeadhuntingCompanySwr", () => ({ useQueryHeadhuntingCompanySwr: () => mocks.company }))
vi.mock("@/hooks/swr/useQueryConsultantsSwr", () => ({ useQueryConsultantsSwr: () => mocks.consultants }))
vi.mock("./component", () => ({ CourseHeadhuntingCompanyBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="company" /> } }))

import { CourseHeadhuntingCompanyBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    window.open = vi.fn()
    for (const item of [mocks.course, mocks.company, mocks.consultants]) { item.data = undefined; item.error = undefined }
})

describe("CourseHeadhuntingCompanyBlock", () => {
    it("maps pending, failed, missing and ready company states", () => {
        const view = render(<CourseHeadhuntingCompanyBlock displayId="course" companyId="company" />)
        expect(mocks.input?.blockState).toBe("pending")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseHeadhuntingCompanyBlock displayId="course" companyId="company" />)
        expect(mocks.input?.blockState).toBe("failed")
        mocks.course.error = undefined
        mocks.course.data = { id: "c1", title: "Course" }
        mocks.company.data = null
        mocks.consultants.data = { data: [] }
        view.rerender(<CourseHeadhuntingCompanyBlock displayId="course" companyId="company" />)
        expect(mocks.input?.blockState).toBe("not-found")
        mocks.company.data = { id: "company", title: "Company", websiteUrl: "https://example.com", email: null, linkedinUrl: null }
        mocks.consultants.data = { data: [{ id: "ada", fullName: "Ada", jobTitle: "Engineer", description: null, contactUnlocked: true, email: null, linkedinUrl: "https://linkedin.com/ada", phoneNumber: null, zaloNumber: null, cvScoreUnlockThreshold: 70 }] }
        view.rerender(<CourseHeadhuntingCompanyBlock displayId="course" companyId="company" />)
        expect(mocks.input?.blockState).toBe("ready")
        act(() => { mocks.input?.on.course?.(); mocks.input?.on.back?.(); mocks.input?.on.companyContact?.(); mocks.input?.on["contact:ada"]?.(); mocks.input?.on.retry?.() })
        expect(window.open).toHaveBeenCalled()
        expect(mocks.company.mutate).toHaveBeenCalled()
    })
})
