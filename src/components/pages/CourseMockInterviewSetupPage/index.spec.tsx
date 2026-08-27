import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type MockPageProps = { readonly displayId: string; readonly currentLabel?: string }
const mocks = vi.hoisted(() => ({ tab: null as string | null }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => mocks.tab }) }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: { title: "Course" } }) }))
vi.mock("./component", () => ({ CourseMockInterviewSetupPageBase: ({ displayId, currentLabel }: MockPageProps) => <output data-testid="route">{displayId}:{currentLabel}</output> }))
import { CourseMockInterviewSetupPage } from "./index"

describe("CourseMockInterviewSetupPage route", () => {
    it("passes route identity to the page shell", () => {
        mocks.tab = null
        render(<CourseMockInterviewSetupPage displayId="course"  />)
        expect(screen.getByTestId("route")).toHaveTextContent("course")
    })

    it("names the selected history destination in the breadcrumb", () => {
        mocks.tab = "history"
        render(<CourseMockInterviewSetupPage displayId="course" />)
        expect(screen.getByTestId("route")).toHaveTextContent("course:History")
    })
})
