import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type SpineStubProps = { readonly isCollapsed?: boolean; readonly presentation?: "rail" | "drawer" }
vi.mock("@/components/blocks/learn/LearnSpine", () => ({
    LearnSpine: (props: SpineStubProps) => <output data-testid="learn-spine" data-collapsed={String(props.isCollapsed === true)} data-presentation={props.presentation ?? "rail"}>spine</output>,
}))
type DrawerStubProps = { readonly isOpen: boolean; readonly title: string; readonly onDismiss: () => void; readonly children: React.ReactNode }
vi.mock("@/components/branches/DrawerBranch", () => ({
    DrawerBranch: (props: DrawerStubProps) => props.isOpen ? <aside data-testid="course-drawer"><span>{props.title}</span>{props.children}<button onClick={props.onDismiss}>dismiss drawer</button></aside> : null,
}))
import { LearnShellLayoutBase } from "./component"

describe("LearnShellLayoutBase", () => {
    it("projects the connected spine and caller-owned main through WorkspaceShell", () => {
        const { container } = render(<LearnShellLayoutBase displayId="course" navigationLabel="Course navigation" isFullBleed={false} surface={<main>Reader surface</main>} />)
        expect(screen.getByRole("navigation", { name: "Course navigation" })).toContainElement(screen.getByTestId("learn-spine"))
        expect(container.querySelector("[data-grammar-workspace-shell='true']")).not.toBeNull()
        expect(container.querySelector("[data-grammar-main-landmark='caller']")).not.toBeNull()
        expect(container.querySelectorAll("main")).toHaveLength(1)
    })

    it("hands collapsed state to Sidebar without owning rail geometry", () => {
        const { container } = render(<LearnShellLayoutBase displayId="course" navigationLabel="Course navigation" isFullBleed={false} isRailCollapsed surface={<div>Reader surface</div>} />)
        expect(screen.getByTestId("learn-spine")).toHaveAttribute("data-collapsed", "true")
        expect(container.querySelector("[data-grammar-workspace-navigation-track='intrinsic']")).not.toBeNull()
        expect(container.querySelector("[data-grammar-workspace-navigation-visibility='wide']")).not.toBeNull()
    })

    it("removes course furniture for a focused full-bleed session", () => {
        const { container } = render(<LearnShellLayoutBase displayId="course" navigationLabel="Course navigation" isFullBleed surface={<div>Reader surface</div>} />)
        expect(screen.queryByTestId("learn-spine")).toBeNull()
        expect(container.querySelector("[data-grammar-workspace-navigation='absent']")).not.toBeNull()
    })

    it("opens the shared course drawer from Grammar Subnav", () => {
        const openCourseNavigation = vi.fn()
        const closeCourseNavigation = vi.fn()
        const shared = { displayId: "course", navigationLabel: "Course navigation", isFullBleed: false, on: { openCourseNavigation, closeCourseNavigation }, surface: <div>Review surface</div> } as const
        const { rerender } = render(<LearnShellLayoutBase {...shared} mobileCourseNavigation={{ label: "Course navigation", closeLabel: "Close course navigation", courseTitle: "Fullstack Mastery", isOpen: false }} />)
        fireEvent.click(screen.getByRole("button", { name: "Course navigation" }))
        expect(openCourseNavigation).toHaveBeenCalledOnce()

        rerender(<LearnShellLayoutBase {...shared} mobileCourseNavigation={{ label: "Course navigation", closeLabel: "Close course navigation", courseTitle: "Fullstack Mastery", isOpen: true }} />)
        expect(screen.getByTestId("course-drawer").querySelector("[data-testid='learn-spine']")).toHaveAttribute("data-presentation", "drawer")
        fireEvent.click(screen.getByRole("button", { name: "dismiss drawer" }))
        expect(closeCourseNavigation).toHaveBeenCalledOnce()
    })

    it("projects compact peer views through Grammar Tabs", async () => {
        const openMobileTab = vi.fn()
        render(<LearnShellLayoutBase displayId="course" navigationLabel="Course views" isFullBleed={false} mobileTabs={[{ id: "today", label: "Today", icon: "course", isCurrent: true }, { id: "progress", label: "Progress", icon: "league" }]} on={{ openMobileTab }} surface={<div>Today surface</div>} />)

        fireEvent.click(await screen.findByRole("tab", { name: "Progress" }))
        expect(openMobileTab).toHaveBeenCalledWith("progress")
        expect(screen.getByRole("tablist", { name: "Course views" }).closest("nav")).toHaveAttribute("data-grammar-workspace-compact-navigation", "true")
    })
})
