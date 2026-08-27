import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SuggestedUserRow } from "./index"

const frame = { id: "one", followLabel: "Follow", followingLabel: "Following" } as const

describe("SuggestedUserRow", () => {
    it("stacks the name over the handle and opens the person from the name alone", () => {
        const open = vi.fn()
        render(<SuggestedUserRow
            props={{ ...frame, name: "Ada Lovelace", username: "@ada", avatar: "https://example.com/ada.png" }}
            on={{ open }}
        />)
        expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
        expect(screen.getByText("@ada")).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("link", { name: "Ada Lovelace" }))
        expect(open).toHaveBeenCalledOnce()
    })

    it("wears the open-to-work badge only for a person who is looking", () => {
        const open = render(<SuggestedUserRow props={{
            ...frame,
            name: "Ada",
            openToWork: true,
            openToWorkLabel: "Open to work",
        }} />)
        const badge = screen.getByText("Open to work")
        expect(badge).toHaveAttribute("data-tone", "success")
        open.unmount()

        render(<SuggestedUserRow props={{ ...frame, name: "Grace", openToWork: false }} />)
        expect(screen.queryByText("Open to work")).toBeNull()
    })

    it("offers the follow action and reports the press", () => {
        const follow = vi.fn()
        render(<SuggestedUserRow props={{ ...frame, name: "Ada" }} on={{ follow }} />)
        const action = screen.getByRole("button", { name: "Follow" })
        expect(action).toHaveAttribute("data-variant", "secondary")
        fireEvent.click(action)
        expect(follow).toHaveBeenCalledOnce()
    })

    it("says the viewer is already following and refuses a second press", () => {
        const follow = vi.fn()
        render(<SuggestedUserRow props={{ ...frame, name: "Ada", isFollowing: true }} on={{ follow }} />)
        fireEvent.click(screen.getByRole("button", { name: "Following" }))
        expect(follow).not.toHaveBeenCalled()
    })

    it("spins the action and refuses the press while the follow is in flight", () => {
        const follow = vi.fn()
        render(<SuggestedUserRow
            props={{ ...frame, name: "Ada", isPending: true }}
            on={{ follow }}
        />)
        const action = screen.getByRole("button", { name: "Follow" })
        expect(action).toHaveAttribute("data-action-pending", "true")
        expect(action).toBeDisabled()
        fireEvent.click(action!)
        expect(follow).not.toHaveBeenCalled()
    })

    it("rests the identity and the action while the suggestion is in flight", () => {
        const { container } = render(<SuggestedUserRow props={{ ...frame }} isLoading />)
        expect(container.querySelector("[aria-hidden=\"true\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Follow" })).toHaveAttribute("data-loading", "true")
        expect(screen.getByRole("link").textContent).toBe("")
    })
})
