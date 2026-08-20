import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { CodingProblemListBase, type CodingProblemRow } from "./component"

const problems: ReadonlyArray<CodingProblemRow> = [
    {
        slug: "two-sum",
        title: "Two Sum",
        fact: "Easy · 10 points",
        isSolved: true,
        label: "Two Sum, solved",
    },
    {
        slug: "median-of-two-arrays",
        title: "Median of Two Sorted Arrays",
        fact: "Hard · 40 points · 3 attempts",
        isSolved: false,
        label: "Median of Two Sorted Arrays, not solved",
    },
]

/** The glyph a mark actually draws, read as the outline the reader sees. */
const glyphOf = (host: Element | null) => Array.from(host?.querySelectorAll("path") ?? [])
    .map((path) => path.getAttribute("d"))
    .join("|")

/** The same reading taken from the named icon, so a test states which glyph it expects. */
const glyphNamed = (name: IconName) => {
    const view = render(<Icon props={{ name, role: "leading" }} />)
    const glyph = glyphOf(view.container)
    view.unmount()
    return glyph
}

const noticeMark = () => document.querySelector("[data-component=\"IconTile\"]")

describe("CodingProblemListBase", () => {
    it("rests five inert rows while the topic's problems are in flight", () => {
        const open = vi.fn()
        render(<CodingProblemListBase state="pending" props={{ problems }} on={{ open }} />)

        const rows = screen.getAllByRole("button")
        expect(rows).toHaveLength(5)
        for (const row of rows) {
            expect(row).toBeDisabled()
            expect(row).toHaveAttribute("aria-busy", "true")
        }
        fireEvent.click(rows[0])
        expect(open).not.toHaveBeenCalled()
        expect(screen.queryByText("Two Sum")).toBeNull()
        for (const line of document.querySelectorAll("[data-component=\"Text\"]")) {
            expect(line).toHaveAttribute("data-loading", "true")
        }
    })

    it("lists each problem with its mark, title and fact, and opens the one pressed", () => {
        const open = vi.fn()
        render(<CodingProblemListBase state="ready" props={{ problems }} on={{ open }} />)

        expect(screen.getAllByRole("button")).toHaveLength(2)
        expect(screen.getByText("Two Sum")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Hard · 40 points · 3 attempts")).toHaveAttribute("data-tone", "muted")

        const solved = screen.getByRole("button", { name: "Two Sum, solved" })
        const unsolved = screen.getByRole("button", { name: "Median of Two Sorted Arrays, not solved" })
        expect(solved.querySelector("svg")).toHaveClass("text-success-soft-foreground")
        expect(unsolved.querySelector("svg")).not.toHaveClass("text-success-soft-foreground")
        expect(glyphOf(unsolved)).toBe(glyphNamed("pending"))

        fireEvent.click(unsolved)
        expect(open).toHaveBeenCalledWith("median-of-two-arrays")
        fireEvent.click(solved)
        expect(open).toHaveBeenCalledWith("two-sum")
        expect(open).toHaveBeenCalledTimes(2)
    })

    it("keeps a row pressable when the page named no opener for it", () => {
        render(<CodingProblemListBase state="ready" props={{ problems }} on={{}} />)
        const row = screen.getByRole("button", { name: "Two Sum, solved" })
        fireEvent.click(row)
        expect(row).toBeEnabled()
        expect(screen.getByText("Two Sum")).toBeInTheDocument()
    })

    it("keeps a row pressable when the page reported nothing at all", () => {
        render(<CodingProblemListBase state="ready" props={{ problems: [problems[1]] }} />)
        const row = screen.getByRole("button", { name: "Median of Two Sorted Arrays, not solved" })
        fireEvent.click(row)
        expect(row).toBeEnabled()
        expect(screen.getByText("Median of Two Sorted Arrays")).toBeInTheDocument()
    })

    it("settles into an empty list rather than a notice when the topic sent no problems", () => {
        render(<CodingProblemListBase state="ready" props={{}} />)
        const list = document.querySelector("[data-node=\"marked-row-list\"]")
        expect(list).toBeInTheDocument()
        expect(list?.children).toHaveLength(0)
        expect(screen.queryByRole("button")).toBeNull()
    })

    it("says why an empty topic is empty and offers the way back", () => {
        const recover = vi.fn()
        render(
            <CodingProblemListBase
                state="empty"
                props={{
                    noticeMessage: "No problems in this topic yet",
                    noticeDescription: "New problems land every week.",
                    noticeActionLabel: "Back to topics",
                }}
                on={{ recover }}
            />,
        )

        expect(screen.getByText("No problems in this topic yet")).toBeInTheDocument()
        expect(screen.getByText("New problems land every week.")).toHaveAttribute("data-size", "xs")
        expect(glyphOf(noticeMark())).toBe(glyphNamed("practice"))
        fireEvent.click(screen.getByRole("button", { name: "Back to topics" }))
        expect(recover).toHaveBeenCalledTimes(1)
    })

    it("marks a finished topic as complete and can settle with no words and no way out", () => {
        render(<CodingProblemListBase state="all-solved" props={{}} />)

        expect(glyphOf(noticeMark())).toBe(glyphNamed("complete"))
        expect(screen.queryByRole("button")).toBeNull()
        const message = document.querySelector("[data-component=\"Text\"]")
        expect(message).toHaveTextContent("")
        expect(document.querySelectorAll("[data-component=\"Text\"]")).toHaveLength(1)
    })

    it("keeps the finished-topic action inert when no recovery was wired", () => {
        render(
            <CodingProblemListBase
                state="all-solved"
                props={{ noticeMessage: "Every problem solved", noticeActionLabel: "Choose another topic" }}
            />,
        )
        const action = screen.getByRole("button", { name: "Choose another topic" })
        fireEvent.click(action)
        expect(action).toBeEnabled()
        expect(screen.getByText("Every problem solved")).toBeInTheDocument()
    })
})
