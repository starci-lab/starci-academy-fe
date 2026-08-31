import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const pathname = vi.hoisted(() => ({ value: "/courses/course/learn" }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ usePathname: () => pathname.value }))
vi.mock("@/modules/learn/is-live-assessment-route", () => ({ isLiveAssessmentRoute: () => false }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: { title: "Fullstack Mastery" } }) }))
type FrameStub = {
    readonly mobileTabs?: ReadonlyArray<{ readonly id: string; readonly isCurrent?: boolean }>
    readonly mobileCourseNavigation?: { readonly label: string; readonly closeLabel: string; readonly courseTitle: string; readonly isOpen: boolean }
    readonly on?: { readonly openCourseNavigation?: () => void; readonly closeCourseNavigation?: () => void }
    readonly surface: React.ReactNode
}
vi.mock("./component", () => ({ LearnShellLayoutBase: (input: FrameStub) => <><output data-testid="tabs">{input.mobileTabs?.map((tab) => `${tab.id}:${String(tab.isCurrent)}`).join(",")}</output><output data-testid="course-navigation">{input.mobileCourseNavigation === undefined ? "none" : `${input.mobileCourseNavigation.label}:${input.mobileCourseNavigation.courseTitle}:${String(input.mobileCourseNavigation.isOpen)}`}</output><button onClick={input.on?.openCourseNavigation}>open course navigation</button><button onClick={input.on?.closeCourseNavigation}>close course navigation</button>{input.surface}</> }))
import { LearnShellLayout } from "./index"

describe("LearnShellLayout", () => {
    it("offers today panels on the course home", () => {
        render(<LearnShellLayout displayId="course" surface={<div>surface</div>} />)
        expect(screen.getByTestId("tabs")).toHaveTextContent("today:true,course:false,progress:false")
    })

    it("offers reader panels inside a lesson", () => {
        pathname.value = "/courses/course/learn/content/modules/m/contents/c"
        render(<LearnShellLayout displayId="course" surface={<div>surface</div>} />)
        expect(screen.getByTestId("tabs")).toHaveTextContent("contents:false,lesson:true,outline:false")
    })

    it("names and opens the compact course navigation on an ordinary learn page", () => {
        pathname.value = "/courses/course/learn/flashcards/review"
        render(<LearnShellLayout displayId="course" surface={<div>surface</div>} />)

        expect(screen.getByTestId("course-navigation")).toHaveTextContent("mobileCourseNavigation:Fullstack Mastery:false")
        fireEvent.click(screen.getByRole("button", { name: "open course navigation" }))
        expect(screen.getByTestId("course-navigation")).toHaveTextContent("mobileCourseNavigation:Fullstack Mastery:true")
        fireEvent.click(screen.getByRole("button", { name: "close course navigation" }))
        expect(screen.getByTestId("course-navigation")).toHaveTextContent("mobileCourseNavigation:Fullstack Mastery:false")
    })
})
