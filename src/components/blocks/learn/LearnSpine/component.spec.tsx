import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Tree } from "@/components/branches/Tree"
import { learnSpine, type LearnSpineActions, type LearnSpineData } from "./component"

/**
 * What these tests guard: the spine is the only thing a learner navigates a course by, so the
 * facts it puts at the end of a row have to be the true ones. A locked mode that still shows a
 * due count tells the reader twice that they can do something they cannot.
 */

/** Draw the block the way the learn frame draws it - as the frame's own child. */
const renderSpine = (props: LearnSpineData, on?: LearnSpineActions, isLoading?: boolean) => render(
    <Tree contract="learn-course-navigation-rail" render={learnSpine({ props, on, isLoading })} />,
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

const base: LearnSpineData = { lockedLabel: "Locked", groups }

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
        renderSpine(base)
        expect(screen.getByText("Your path")).toBeInTheDocument()
        expect(screen.getByText("Modules")).toBeInTheDocument()
        expect(screen.getByText("Leaderboard")).toBeInTheDocument()
    })

    it("reports the pressed destination by its own id", () => {
        const openRow = vi.fn()
        renderSpine(base, { openRow })
        fireEvent.click(screen.getByText("Flashcards"))
        expect(openRow).toHaveBeenCalledWith("flashcards")
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
            groups: [{ id: "path", label: "Your path", rows: [{ id: "leaderboard", label: "Leaderboard", icon: "community" }] }],
        })
        expect(container.querySelectorAll("[data-node=learn-nav-row]")).toHaveLength(1)
        expect(screen.queryByText("Locked")).not.toBeInTheDocument()
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
})
