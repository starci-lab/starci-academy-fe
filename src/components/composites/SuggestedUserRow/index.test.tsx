import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SuggestedUserRow } from "./index"

const frame = { id: "one", followLabel: "Follow", followingLabel: "Following" } as const

describe("SuggestedUserRow", () => {
    it("stacks the name over the handle and opens the person from the name alone", () => {
        const open = vi.fn()
        const { container } = render(<SuggestedUserRow
            props={{ ...frame, name: "Ada Lovelace", username: "@ada", avatar: "https://example.com/ada.png" }}
            on={{ open }}
        />)
        expect(container.querySelector("[data-node=\"name-over-handle\"]")?.textContent).toBe("Ada Lovelace@ada")
        expect(container.querySelector("[data-component=\"Avatar\"]")).toHaveAttribute("data-size", "sm")
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
        const badge = open.container.querySelector("[data-component=\"Badge\"]")
        expect(badge?.textContent).toBe("Open to work")
        expect(badge).toHaveAttribute("data-tone", "success")
        open.unmount()

        const closed = render(<SuggestedUserRow props={{ ...frame, name: "Grace", openToWork: false }} />)
        expect(closed.container.querySelector("[data-component=\"Badge\"]")).toBeNull()
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
        const { container } = render(<SuggestedUserRow
            props={{ ...frame, name: "Ada", isPending: true }}
            on={{ follow }}
        />)
        const action = container.querySelector("[data-component=\"Button\"]")
        expect(action).toHaveAttribute("data-action-pending", "true")
        expect(action).toBeDisabled()
        fireEvent.click(action!)
        expect(follow).not.toHaveBeenCalled()
    })

    it("rests the identity and the action while the suggestion is in flight", () => {
        const { container } = render(<SuggestedUserRow props={{ ...frame }} isLoading />)
        expect(container.querySelector("[data-component=\"Avatar\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Text\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Button\"]")).toHaveAttribute("data-loading", "true")
        expect(screen.getByRole("link").textContent).toBe("")
    })
})
