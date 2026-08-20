import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UpcomingLivestreamRow } from "./index"

describe("UpcomingLivestreamRow", () => {
    it("draws the whole row as one destination named after the session", () => {
        const open = vi.fn()
        const { container } = render(<UpcomingLivestreamRow
            props={{ id: "one", title: "Live code review", subtitle: "With the backend guild", time: "19:00" }}
            on={{ open }}
        />)
        const surface = screen.getByRole("button", { name: "Live code review" })
        expect(surface).toHaveAttribute("data-hover", "surface")
        expect(container.querySelector("[data-node=\"evidence-title-over-subtitle\"]")?.textContent)
            .toBe("Live code reviewWith the backend guild")
        expect(container.querySelector("[data-node=\"upcoming-livestream-row\"]")?.textContent)
            .toContain("19:00")
        expect(container.querySelector("[data-component=\"IconTile\"]")).toHaveAttribute("data-tone", "accent")
        fireEvent.click(surface)
        expect(open).toHaveBeenCalledOnce()
    })

    it("omits the second line entirely for a session with nothing to add", () => {
        const { container } = render(<UpcomingLivestreamRow props={{ id: "one", title: "Live code review", time: "19:00" }} />)
        expect(container.querySelector("[data-node=\"evidence-title-over-subtitle\"]")?.textContent)
            .toBe("Live code review")
    })

    it("falls back to a generic name when the session has no title to be named after", () => {
        render(<UpcomingLivestreamRow props={{ id: "one", time: "19:00" }} />)
        expect(screen.getByRole("button", { name: "Livestream" })).toBeInTheDocument()
    })

    it("rests the mark, the title and the time while the session is in flight", () => {
        const open = vi.fn()
        const { container } = render(<UpcomingLivestreamRow props={{ id: "resting" }} on={{ open }} isLoading />)
        const surface = screen.getByRole("button", { name: "Livestream" })
        expect(surface).toBeDisabled()
        expect(container.querySelector("[data-component=\"IconTile\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelectorAll("[data-component=\"Text\"][data-loading=\"true\"]")).toHaveLength(2)
        fireEvent.click(surface)
        expect(open).not.toHaveBeenCalled()
    })

    it("refuses the press while this exact session is already resolving", () => {
        const open = vi.fn()
        render(<UpcomingLivestreamRow props={{ id: "one", title: "Live code review", isPending: true }} on={{ open }} />)
        const surface = screen.getByRole("button", { name: "Live code review" })
        expect(surface).toBeDisabled()
        expect(surface).toHaveAttribute("aria-busy", "true")
        fireEvent.click(surface)
        expect(open).not.toHaveBeenCalled()
    })
})
