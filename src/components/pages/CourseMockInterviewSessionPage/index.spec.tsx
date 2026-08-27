import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type MockPageProps = { readonly displayId: string; readonly sessionId: string }
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: { title: "Course" } }) }))
vi.mock("./component", () => ({ CourseMockInterviewSessionPageBase: ({ displayId, sessionId }: MockPageProps) => <output data-testid="route">{`${displayId}:${sessionId}`}</output> }))
import { CourseMockInterviewSessionPage } from "./index"

describe("CourseMockInterviewSessionPage route", () => {
    it("passes route identity to the page shell", () => {
        render(<CourseMockInterviewSessionPage displayId="course" sessionId="session" />)
        expect(screen.getByTestId("route")).toHaveTextContent("course:session")
    })
})
