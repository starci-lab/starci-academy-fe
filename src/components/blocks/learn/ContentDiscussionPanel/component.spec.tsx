import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    ContentDiscussionPanelBase,
    type ContentDiscussionPanelData,
} from "./component"

const props: ContentDiscussionPanelData = {
    labels: {
        title: "Discussion",
        composerLabel: "Comment",
        placeholder: "Share a question",
        submit: "Post comment",
        submitting: "Posting",
        empty: "No comments yet.",
        failed: "Comments could not be loaded.",
        retry: "Try again",
    },
    draft: "A useful question",
    draftKey: 0,
    comments: [{ id: "comment-1", author: "Ada", meta: "Today", body: "How does this work?" }],
}

describe("ContentDiscussionPanelBase", () => {
    it("renders typed ready comments and emits composer actions", () => {
        const changeDraft = vi.fn()
        const submit = vi.fn()
        render(
            <ContentDiscussionPanelBase state="ready" props={props} on={{ changeDraft, submit }} />,
        )

        expect(screen.getByRole("region", { name: "Discussion" })).toBeInTheDocument()
        expect(screen.getByRole("list")).toBeInTheDocument()
        expect(screen.getByText("How does this work?")).toBeInTheDocument()
        fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Next question" } })
        fireEvent.click(screen.getByRole("button", { name: "Post comment" }))
        expect(changeDraft).toHaveBeenCalledWith("Next question")
        expect(submit).toHaveBeenCalledTimes(1)
    })

    it("keeps the composer visible and locked while submitting", () => {
        render(<ContentDiscussionPanelBase state="submitting" props={props} />)

        expect(screen.getByLabelText("Comment")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Posting" })).toBeDisabled()
    })

    it("rests three comment rows and no composer while the discussion is in flight", () => {
        const { container } = render(<ContentDiscussionPanelBase state="pending" props={props} />)

        expect(screen.getAllByRole("listitem")).toHaveLength(3)
        expect(screen.queryByText("How does this work?")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-loading=\"true\"]").length)
            .toBeGreaterThan(0)
        expect(screen.queryByLabelText("Comment")).not.toBeInTheDocument()
    })

    it("renders empty and failed answers with only failed retry", () => {
        const retry = vi.fn()
        const { rerender } = render(
            <ContentDiscussionPanelBase state="empty" props={{ ...props, draft: "", comments: [] }} />,
        )
        expect(screen.getByText("No comments yet.")).toBeInTheDocument()
        expect(screen.getByLabelText("Comment")).toBeInTheDocument()

        rerender(
            <ContentDiscussionPanelBase
                state="failed"
                props={{ ...props, draft: "", comments: [] }}
                on={{ retry }}
            />,
        )
        expect(screen.queryByLabelText("Comment")).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })
})
