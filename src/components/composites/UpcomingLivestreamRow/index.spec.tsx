import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UpcomingLivestreamRow } from "./index"

describe("UpcomingLivestreamRow", () => {
    it("draws the whole row as one destination named after the session", () => {
        const open = vi.fn()
        render(<UpcomingLivestreamRow
            props={{ id: "one", title: "Live code review", subtitle: "With the backend guild", time: "19:00" }}
            on={{ open }}
        />)
        const surface = screen.getByRole("button", { name: "Live code review" })
        expect(screen.getByText("With the backend guild")).toBeInTheDocument()
        expect(screen.getByText("19:00")).toBeInTheDocument()
        expect(surface.querySelector("svg")).toBeInTheDocument()
        fireEvent.click(surface)
        expect(open).toHaveBeenCalledOnce()
    })

    it("omits the second line entirely for a session with nothing to add", () => {
        render(<UpcomingLivestreamRow props={{ id: "one", title: "Live code review", time: "19:00" }} />)
        expect(screen.getByText("Live code review")).toBeInTheDocument()
    })

    it("falls back to a generic name when the session has no title to be named after", () => {
        render(<UpcomingLivestreamRow props={{ id: "one", time: "19:00" }} />)
        expect(screen.getByRole("button", { name: "Livestream" })).toBeInTheDocument()
    })

    it("rests the mark, the title and the time while the session is in flight", () => {
        const open = vi.fn()
        render(<UpcomingLivestreamRow props={{ id: "resting" }} on={{ open }} isLoading />)
        const surface = screen.getByRole("button", { name: "Livestream" })
        expect(surface).toBeDisabled()
        expect(surface).toHaveAttribute("aria-busy", "true")
        expect(surface).toHaveTextContent("")
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
