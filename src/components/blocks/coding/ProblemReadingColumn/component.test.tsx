import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProblemReadingColumnBase, type ProblemReadingColumnData } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

const tabLabels = {
    statement: "Statement",
    hint: "Hint",
    solution: "Solution",
    submissions: "Submissions",
    group: "Problem readings",
}

const props: ProblemReadingColumnData = {
    tab: "statement",
    tabLabels,
    title: "Two Sum",
    difficulty: "Easy",
    body: "Return the indices of the two numbers that add up to the target.",
    tags: ["array", "hash-table"],
}

const chipRun = () => document.querySelector("[data-node=\"profile-topic-chip-run\"]")

describe("ProblemReadingColumnBase", () => {
    it("keeps all four readings reachable and marks the open one", () => {
        render(<ProblemReadingColumnBase state="ready" props={props} />)

        expect(screen.getByRole("tablist", { name: "Problem readings" })).toBeInTheDocument()
        expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
            "Statement",
            "Hint",
            "Solution",
            "Submissions",
        ])
        expect(screen.getByRole("tab", { name: "Statement" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "Solution" })).toHaveAttribute("aria-selected", "false")
    })

    it("reads the problem as a heading, a difficulty on its baseline, prose and its tags", () => {
        render(<ProblemReadingColumnBase state="ready" props={props} />)

        expect(screen.getByRole("heading", { name: "Two Sum" })).toBeInTheDocument()
        expect(screen.getByText("Easy")).toHaveAttribute("data-tone", "muted")
        expect(screen.getByText("Return the indices of the two numbers that add up to the target.")).toBeInTheDocument()
        expect(chipRun()).toBeInTheDocument()
        expect(screen.getByText("array")).toBeInTheDocument()
        expect(screen.getByText("hash-table")).toBeInTheDocument()
    })

    it("reports the reading the reader moved to", () => {
        const selectTab = vi.fn()
        render(<ProblemReadingColumnBase state="ready" props={props} on={{ selectTab }} />)

        fireEvent.click(screen.getByRole("tab", { name: "Hint" }))
        expect(selectTab).toHaveBeenCalledWith("hint")
        fireEvent.click(screen.getByRole("tab", { name: "Submissions" }))
        expect(selectTab).toHaveBeenCalledWith("submissions")
        expect(selectTab).toHaveBeenCalledTimes(2)
    })

    it("leaves the tabs inert when the page reported no reader for them", () => {
        render(<ProblemReadingColumnBase state="ready" props={{ ...props, tags: [] }} on={{}} />)

        fireEvent.click(screen.getByRole("tab", { name: "Solution" }))
        expect(screen.getByRole("tab", { name: "Statement" })).toHaveAttribute("aria-selected", "true")
        expect(chipRun()).toBeNull()
    })

    it("drops the tag run entirely when the problem carries no tags", () => {
        render(<ProblemReadingColumnBase state="ready" props={{ ...props, tags: undefined }} />)

        expect(chipRun()).toBeNull()
        expect(screen.getByRole("heading", { name: "Two Sum" })).toBeInTheDocument()
    })

    it("rests the heading, the difficulty and the prose while the problem is in flight", () => {
        render(<ProblemReadingColumnBase state="pending" props={{ tab: "statement", tabLabels }} />)

        expect(document.querySelector("[data-component=\"Heading\"]")).toHaveAttribute("data-loading", "true")
        expect(document.querySelector("[data-component=\"Text\"]")).toHaveAttribute("data-loading", "true")
        expect(document.querySelector("[data-component=\"Article\"]")).toHaveAttribute("data-resting", "true")
        expect(screen.getAllByRole("tab")).toHaveLength(4)
    })

    it("settles an absent hint as a quiet nothing rather than an error", () => {
        render(
            <ProblemReadingColumnBase
                state="hint-absent"
                props={{ ...props, tab: "hint", body: undefined }}
            />,
        )

        expect(screen.getByRole("tab", { name: "Hint" })).toHaveAttribute("aria-selected", "true")
        expect(document.querySelector("[data-component=\"Article\"]")).toHaveAttribute("data-resting", "true")
        expect(screen.getByRole("heading", { name: "Two Sum" })).toBeInTheDocument()
    })

    it("keeps the unrevealed solution tab open with nothing published under it", () => {
        render(
            <ProblemReadingColumnBase
                state="solution-hidden"
                props={{ ...props, tab: "solution", body: undefined }}
            />,
        )

        expect(screen.getByRole("tab", { name: "Solution" })).toHaveAttribute("aria-selected", "true")
        expect(
            screen.queryByText("Return the indices of the two numbers that add up to the target."),
        ).toBeNull()
        expect(screen.getByText("Easy")).toHaveAttribute("data-loading", "false")
    })
})
