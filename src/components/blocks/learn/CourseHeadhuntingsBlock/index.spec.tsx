import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { blockState: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    companies: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    suggestions: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    consultants: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    push: vi.fn(), locale: "en",
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryHeadhuntingCompaniesSwr", () => ({ useQueryHeadhuntingCompaniesSwr: () => mocks.companies }))
vi.mock("@/hooks/swr/useQueryHeadhuntingCompanySuggestionsSwr", () => ({ useQueryHeadhuntingCompanySuggestionsSwr: () => mocks.suggestions }))
vi.mock("@/hooks/swr/useQueryConsultantsSwr", () => ({ useQueryConsultantsSwr: () => mocks.consultants }))
vi.mock("./component", () => ({ CourseHeadhuntingsBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="directory" /> } }))

import { CourseHeadhuntingsBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.locale = "en"
    for (const item of [mocks.course, mocks.companies, mocks.suggestions, mocks.consultants]) { item.data = undefined; item.error = undefined }
})

describe("CourseHeadhuntingsBlock", () => {
    it("maps transport, search, company navigation and recovery", () => {
        const view = render(<CourseHeadhuntingsBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("pending")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseHeadhuntingsBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("failed")
        mocks.course.error = undefined
        mocks.course.data = { id: "c1", title: "Course" }
        mocks.companies.data = []
        mocks.suggestions.data = []
        mocks.consultants.data = { data: [] }
        view.rerender(<CourseHeadhuntingsBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("empty")
        mocks.companies.data = [{ id: "company", title: "Company", description: "Hiring" }]
        mocks.consultants.data = { data: [{ id: "ada", fullName: "Ada", jobTitle: "Engineer", description: null, contactUnlocked: true, email: "ada@example.com", linkedinUrl: null, phoneNumber: null, zaloNumber: null, cvScoreUnlockThreshold: 70 }] }
        view.rerender(<CourseHeadhuntingsBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("ready")
        act(() => { mocks.input?.on.search("company"); mocks.input?.on["open:company"]?.(); mocks.input?.on.course(); mocks.input?.on.retry() })
        expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/headhunting-companies/company")
        expect(mocks.course.mutate).toHaveBeenCalled()
    })
})
