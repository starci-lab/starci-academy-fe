import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseQaPage } from "./component"

/**
 * What these tests guard.
 *
 * Q&A is one panel with two readings: the question list, and one opened thread. The composer stands
 * in both, the ask control refuses an empty draft, and a settled-empty or failed board replaces the
 * list with a notice rather than showing an empty surface that looks like a loaded one.
 */

const props = {
    title: "Course Q&A",
    trail: [{ id: "course", label: "TypeScript" }, { id: "qa", label: "Course Q&A" }],
    searchPlaceholder: "Search questions",
    searchLabel: "Search questions",
    clearSearchLabel: "Clear search",
    askLabel: "Ask a question",
    askPlaceholder: "What would you like help with?",
    questionsLabel: "Questions",
    repliesLabel: "Replies",
    backLabel: "Back to questions",
    draftKey: 0,
    draft: "",
    questions: [{ id: "q1", body: "How does narrowing work?", meta: "learner", replyLabel: "2 replies" }],
    replies: [],
    emptyMessage: "No questions yet.",
    emptySearchMessage: "No matches.",
    errorMessage: "Could not load questions.",
    retryLabel: "Try again",
}

describe("CourseQaPage", () => {
    it("renders the course question list and the real ask control", () => {
        render(<_CourseQaPage state="ready" props={props} />)
        expect(screen.getByText(/How does narrowing work/)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Ask a question/ })).toBeDisabled()
    })

    it("rests four question rows while the board is in flight", () => {
        const { container } = render(<_CourseQaPage state="pending" props={props} />)

        expect(container.querySelectorAll("[data-node=\"next-action-row\"]")).toHaveLength(4)
        expect(container.querySelectorAll("[data-component=\"Text\"][data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(container.querySelector("[data-node=\"next-action-row\"] svg")).toBeNull()
    })

    it("replaces the list with a community notice once the board settles empty", () => {
        const retry = vi.fn()
        const { container } = render(<_CourseQaPage state="empty" props={props} on={{ retry }} />)

        expect(screen.getByText("No questions yet.")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"next-action-list\"]")).toBeNull()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
        expect(retry).not.toHaveBeenCalled()
    })

    it("offers the way back from a failed board", () => {
        const retry = vi.fn()
        render(<_CourseQaPage state="failed" props={props} on={{ retry }} />)

        expect(screen.getByText("Could not load questions.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("says nothing matched rather than drawing an empty surface as a result", () => {
        render(<_CourseQaPage state="ready" props={{ ...props, questions: [] }} />)

        expect(screen.getByText("No matches.")).toBeInTheDocument()
        expect(screen.getByText("Questions")).toBeInTheDocument()
    })

    it("reads one opened thread and closes it back to the question list", () => {
        const closeThread = vi.fn()
        const { container } = render(
            <_CourseQaPage
                state="ready"
                props={{
                    ...props,
                    selectedQuestion: props.questions[0],
                    replies: [{ id: "r1", body: "Through control flow", meta: "mentor" }],
                }}
                on={{ closeThread }}
            />,
        )

        expect(screen.getByText("Replies")).toBeInTheDocument()
        expect(screen.getByText("Through control flow · mentor")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"next-action-row\"] svg")).toBeNull()
        expect(container.querySelector("[data-press-label=\"true\"]")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Back to questions" }))
        expect(closeThread).toHaveBeenCalledOnce()
    })

    it("marks an openable question row with a disclosure the reply rows never carry", () => {
        const { container } = render(<_CourseQaPage state="ready" props={props} on={{ openThread: vi.fn() }} />)

        const row = container.querySelector("[data-node=\"next-action-row\"]")
        expect(row?.querySelector("svg")).not.toBeNull()
        expect(row?.querySelector("[data-press-label=\"true\"]")).not.toBeNull()
        expect(screen.getByText("How does narrowing work? · learner · 2 replies")).toBeInTheDocument()
    })

    it("carries the draft, the search and the ask intent out of the composer", () => {
        const search = vi.fn()
        const changeDraft = vi.fn()
        const ask = vi.fn()
        const course = vi.fn()
        const { container } = render(
            <_CourseQaPage
                state="ready"
                props={{ ...props, draft: "Why does this narrow?" }}
                on={{ search, changeDraft, ask, course }}
            />,
        )

        fireEvent.change(screen.getByRole("textbox", { name: "Ask a question" }), { target: { value: "New question" } })
        expect(changeDraft).toHaveBeenCalledWith("New question")

        const form = container.querySelector("form[role=\"search\"]")
        fireEvent.change(screen.getByRole("searchbox", { name: "Search questions" }), { target: { value: "narrowing" } })
        fireEvent.submit(form as HTMLFormElement)
        expect(search).toHaveBeenCalledWith("narrowing")

        fireEvent.click(screen.getByRole("button", { name: /Ask a question/ }))
        expect(ask).toHaveBeenCalledOnce()

        fireEvent.click(screen.getByText("TypeScript"))
        expect(course).toHaveBeenCalledOnce()
    })

    it("holds the ask control pending and locks the draft while a question is in flight", () => {
        render(
            <_CourseQaPage
                state="ready"
                props={{ ...props, draft: "Why does this narrow?", isSubmitting: true }}
                on={{ ask: vi.fn() }}
            />,
        )

        expect(screen.getByRole("textbox", { name: "Ask a question" })).toBeDisabled()
        expect(screen.getByRole("button", { name: /Ask a question/ })).toHaveAttribute("data-action-pending", "true")
    })
})
