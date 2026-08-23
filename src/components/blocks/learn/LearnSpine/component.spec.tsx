import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Tree } from "@/components/branches/Tree"
import { LearnSpineBase, learnSpine, learnSpineCollapsed, type LearnSpineActions, type LearnSpineData } from "./component"

/**
 * What these tests guard: the spine is the only thing a learner navigates a course by, so the
 * facts it puts at the end of a row have to be the true ones. A locked mode that still shows a
 * due count tells the reader twice that they can do something they cannot.
 */

/** Draw the block the way the learn frame draws it - as the frame's own child. */
const renderSpine = (props: LearnSpineData, on?: LearnSpineActions, isLoading?: boolean) => (
    props.isCollapsed
        ? render(<Tree contract="learn-course-navigation-rail-collapsed" render={learnSpineCollapsed({ props, on, isLoading })} />)
        : render(<Tree contract="learn-course-navigation-rail" render={learnSpine({ props, on, isLoading })} />)
)

const groups: LearnSpineData["groups"] = [{
    id: "path",
    label: "Your path",
    rows: [
        { id: "content", label: "Modules", icon: "course", isCurrent: true },
        { id: "flashcards", label: "Flashcards", icon: "review", fact: "12 due" },
        { id: "capstone", label: "Capstone", icon: "jobs", isLocked: true, fact: "3 tasks" },
        { id: "leaderboard", label: "Leaderboard", icon: "community" },
    ],
}]

const base: LearnSpineData = {
    lockedLabel: "Locked",
    collapseLabel: "Collapse",
    expandLabel: "Expand",
    isCollapsed: false,
    home: { id: "home", label: "Home", icon: "home", isCurrent: false },
    groups,
}

const withResume: LearnSpineData = {
    ...base,
    resume: {
        label: "Pick up where you left off",
        title: "Designing the write path",
        percent: 62,
        percentText: "62%",
    },
}

describe("learnSpine", () => {
    it("names every group and every destination it offers", () => {
        const { container } = renderSpine(base)
        expect(screen.getByText("Your path")).toBeInTheDocument()
        expect(screen.getByText("Home")).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Home" })).toBeInTheDocument()
        expect(screen.getByText("Modules")).toBeInTheDocument()
        expect(screen.getByText("Leaderboard")).toBeInTheDocument()
        expect(container.querySelector("[data-component=SelectionList][data-variant=navigation]")).toBeTruthy()
        expect(container.querySelector("[data-node=learn-course-navigation-rail]")).toHaveClass(
            "border-separator",
            "px-3",
            "py-6",
            "md:border-r",
        )
        expect(container.querySelector("[data-node=learn-course-navigation-rail]")).not.toHaveClass("p-4")
        expect(container.querySelector("[data-node=learn-course-navigation-groups-scroll]")).toHaveClass(
            "scroll-shadow--vertical",
            "scroll-shadow--hide-scrollbar",
        )
    })

    it("reports the pressed destination by its own id", () => {
        const openRow = vi.fn()
        renderSpine(base, { openRow })
        fireEvent.click(screen.getByText("Flashcards"))
        expect(openRow).toHaveBeenCalledWith("flashcards")
    })

    it("uses one icon control to collapse and restore the rail", () => {
        const toggleCollapse = vi.fn()
        const { container, rerender } = renderSpine(base, { toggleCollapse })
        fireEvent.click(screen.getByRole("button", { name: "Collapse" }))
        expect(toggleCollapse).toHaveBeenCalledTimes(1)

        rerender(
            <Tree
                contract="learn-course-navigation-rail-collapsed"
                render={learnSpineCollapsed({ props: { ...base, isCollapsed: true }, on: { toggleCollapse } })}
            />,
        )
        expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument()
        expect(screen.queryByText("Your path")).not.toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Home" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Modules" })).toBeInTheDocument()
        expect(container.querySelector("[data-node=learn-course-navigation-rail-collapsed]")).toHaveClass(
            "border-separator",
            "px-3",
            "py-6",
            "md:border-r",
        )
        expect(container.querySelector("[data-node=learn-course-navigation-rail-collapsed]")).not.toHaveClass("p-2", "px-2")
    })

    it("stays inert rather than throwing when the frame reported no handlers", () => {
        renderSpine(base)
        expect(() => fireEvent.click(screen.getByText("Modules"))).not.toThrow()
        renderSpine(base, {})
        expect(() => fireEvent.click(screen.getAllByText("Modules")[1]!)).not.toThrow()
    })

    it("ends a locked row in the word rather than the due count it cannot honour", () => {
        renderSpine(base)
        expect(screen.getByText("Locked")).toBeInTheDocument()
        expect(screen.queryByText("3 tasks")).not.toBeInTheDocument()
        expect(screen.getByText("12 due")).toBeInTheDocument()
    })

    it("leaves the trailing slot empty for a row with no supporting fact", () => {
        const { container } = renderSpine({
            lockedLabel: "Locked",
            collapseLabel: "Collapse",
            expandLabel: "Expand",
            isCollapsed: false,
            home: { id: "home", label: "Home", icon: "home" },
            groups: [{ id: "path", label: "Your path", rows: [{ id: "leaderboard", label: "Leaderboard", icon: "community" }] }],
        })
        expect(container.querySelectorAll("[data-component=SelectionList][data-variant=navigation] [role=option]")).toHaveLength(2)
        expect(screen.queryByText("Locked")).not.toBeInTheDocument()
    })

    it("keeps locked destinations operable so they can open the explanatory gate", () => {
        const openRow = vi.fn()
        renderSpine(base, { openRow })
        const capstone = screen.getByRole("option", { name: /Capstone/ })
        expect(capstone).not.toHaveAttribute("aria-disabled")
        fireEvent.click(capstone)
        expect(openRow).toHaveBeenCalledWith("capstone")
    })

    it("renders locked and rank facts as prominent semantic chips", () => {
        renderSpine({
            ...base,
            groups: [{
                id: "track",
                label: "Track",
                rows: [
                    { id: "capstone", label: "Capstone", icon: "jobs", isLocked: true },
                    { id: "leaderboard", label: "Leaderboard", icon: "league", fact: "#7" },
                ],
            }],
        })

        expect(screen.getByText("Locked").closest("[data-component=Badge]")).toHaveAttribute("data-tone", "warning")
        expect(screen.getByText("#7").closest("[data-component=Badge]")).toHaveAttribute("data-tone", "accent")
    })

    it("omits the resume card entirely when there is nowhere to go back to", () => {
        const { container } = renderSpine(base)
        expect(container.querySelector("[data-node=learn-resume-card]")).toBeNull()
    })

    it("raises a resume card that reports where the learner left off", () => {
        const resume = vi.fn()
        renderSpine(withResume, { resume })
        const card = screen.getByRole("button", { name: "Designing the write path" })
        fireEvent.click(card)
        expect(resume).toHaveBeenCalledTimes(1)
        expect(screen.getByText("Pick up where you left off")).toBeInTheDocument()
        expect(screen.getByText("62%")).toBeInTheDocument()
    })

    it("rests only the learner's own figures while the course frame stays named", () => {
        renderSpine(withResume, undefined, true)
        expect(screen.getByText("Your path")).toBeInTheDocument()
        expect(screen.getByText("Pick up where you left off")).toBeInTheDocument()
        expect(screen.queryByText("62%")).not.toBeInTheDocument()
    })

    it("moves the same grouped destinations into the narrow drawer without rail controls", () => {
        const openRow = vi.fn()
        const { container } = render(<LearnSpineBase isCollapsed={false} presentation="drawer" props={base} on={{ openRow }} />)

        expect(container.querySelector("[data-node=learn-course-navigation-drawer]")).toBeTruthy()
        expect(screen.getByText("Your path")).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Home" })).toBeInTheDocument()
        fireEvent.click(screen.getByText("Flashcards"))
        expect(openRow).toHaveBeenCalledWith("flashcards")
        expect(screen.queryByRole("button", { name: "Collapse" })).not.toBeInTheDocument()
    })
})
