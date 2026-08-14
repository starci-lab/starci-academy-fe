import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    _ContentDiscussionPanel,
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

describe("_ContentDiscussionPanel", () => {
    it("renders typed ready comments and emits composer actions", () => {
        const changeDraft = vi.fn()
        const submit = vi.fn()
        const { container } = render(
            <_ContentDiscussionPanel state="ready" props={props} on={{ changeDraft, submit }} />,
        )

        expect(container.querySelector("[data-node=content-discussion-panel]")).toBeTruthy()
        expect(container.querySelector("[data-node=content-discussion-list]")).toBeTruthy()
        expect(screen.getByText("How does this work?")).toBeInTheDocument()
        fireEvent.change(screen.getByLabelText("Comment"), { target: { value: "Next question" } })
        fireEvent.click(screen.getByRole("button", { name: "Post comment" }))
        expect(changeDraft).toHaveBeenCalledWith("Next question")
        expect(submit).toHaveBeenCalledTimes(1)
    })

    it("keeps the composer visible and locked while submitting", () => {
        render(<_ContentDiscussionPanel state="submitting" props={props} />)

        expect(screen.getByLabelText("Comment")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Posting" })).toBeDisabled()
    })

    it("renders empty and failed answers with only failed retry", () => {
        const retry = vi.fn()
        const { rerender } = render(
            <_ContentDiscussionPanel state="empty" props={{ ...props, draft: "", comments: [] }} />,
        )
        expect(screen.getByText("No comments yet.")).toBeInTheDocument()
        expect(screen.getByLabelText("Comment")).toBeInTheDocument()

        rerender(
            <_ContentDiscussionPanel
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
