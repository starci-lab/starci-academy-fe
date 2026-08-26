import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/learn/LearnSpine", () => ({ LearnSpine: () => <output data-testid="learn-spine">spine</output> }))
type DrawerStubProps = { readonly isOpen: boolean; readonly title: string; readonly onDismiss: () => void }
vi.mock("@/components/branches/DrawerBranch", () => ({
    DrawerBranch: (input: DrawerStubProps) => input.isOpen ? <aside data-testid="course-drawer"><span>{input.title}</span><button onClick={input.onDismiss}>dismiss drawer</button></aside> : null,
}))
import { LearnShellLayoutBase } from "./component"

describe("LearnShellLayoutBase", () => {
    it("keeps the connected spine beside an ordinary routed surface", () => {
        const { container } = render(<LearnShellLayoutBase displayId="course" isFullBleed={false} surface={<div>Reader surface</div>} />)
        expect(screen.getByText("Reader surface")).toBeInTheDocument()
        expect(screen.getByTestId("learn-spine")).toBeInTheDocument()
        expect(container.querySelector("[data-node=learn-routed-body]")).not.toBeNull()
    })

    it("removes course furniture for a focused full-bleed session", () => {
        const { container } = render(<LearnShellLayoutBase displayId="course" isFullBleed surface={<div>Reader surface</div>} />)
        expect(screen.getByText("Reader surface")).toBeInTheDocument()
        expect(screen.queryByTestId("learn-spine")).toBeNull()
        expect(container.querySelector("[data-node=learn-shell-frame]")).not.toBeNull()
    })

    it("opens the shared course navigation from a compact current-location row", () => {
        const openCourseNavigation = vi.fn()
        const closeCourseNavigation = vi.fn()
        const { container, rerender } = render(<LearnShellLayoutBase displayId="course" isFullBleed={false} mobileCourseNavigation={{ label: "Course navigation", currentLabel: "Review", isOpen: false }} on={{ openCourseNavigation, closeCourseNavigation }} surface={<div>Review surface</div>} />)

        expect(container.querySelector("[data-node=learn-mobile-course-map-row]")).toBeTruthy()
        expect(screen.getByText("Review")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Course navigation" }))
        expect(openCourseNavigation).toHaveBeenCalledOnce()

        rerender(<LearnShellLayoutBase displayId="course" isFullBleed={false} mobileCourseNavigation={{ label: "Course navigation", currentLabel: "Review", isOpen: true }} on={{ openCourseNavigation, closeCourseNavigation }} surface={<div>Review surface</div>} />)
        expect(screen.getByTestId("course-drawer")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "dismiss drawer" }))
        expect(closeCourseNavigation).toHaveBeenCalledOnce()
    })

    it("keeps one semantic mobile navigation below the desktop rail breakpoint", () => {
        const { container } = render(<LearnShellLayoutBase
            displayId="course"
            isFullBleed={false}
            mobileTabs={[{ id: "today", label: "Today", icon: "course", isCurrent: true }]}
            surface={<div>Today surface</div>}
        />)

        const mobileNavigation = container.querySelector("nav[data-node=learn-mobile-tab-bar]")
        expect(mobileNavigation).not.toBeNull()
        expect(mobileNavigation?.className).toContain("md:hidden")
    })
})
