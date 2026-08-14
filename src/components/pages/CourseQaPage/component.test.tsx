import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { _CourseQaPage } from "./component"

describe("CourseQaPage", () => {
    it("renders the course question list and the real ask control", () => {
        render(<_CourseQaPage state="ready" props={{
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
        }} />)
        expect(screen.getByText(/How does narrowing work/)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Ask a question/ })).toBeDisabled()
    })
})
