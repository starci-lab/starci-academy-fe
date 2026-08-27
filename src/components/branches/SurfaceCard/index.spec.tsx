import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SurfaceCard } from "."

describe("SurfaceCard", () => {
    it("renders children and an optional label", () => {
        render(<SurfaceCard props={{ label: "Progress" }}><p>Body</p></SurfaceCard>)
        expect(screen.getByRole("heading", { name: "Progress", level: 3 })).toBeInTheDocument()
        expect(screen.getByText("Body")).toBeInTheDocument()
    })
    it("renders a fact or see-more action at the end of the label row", () => {
        const seeMore = vi.fn()
        render(<SurfaceCard props={{ label: "Progress", fact: "3 items", seeMoreLabel: "See more" }} on={{ seeMore }}><p>Body</p></SurfaceCard>)
        fireEvent.click(screen.getByRole("link", { name: "See more" }))
        expect(seeMore).toHaveBeenCalledOnce()
    })
    it("supports frameless surfaces", () => {
        render(<SurfaceCard props={{ isFrameless: true }}><p>Body</p></SurfaceCard>)
        expect(screen.getByText("Body").closest(".card")).toBeNull()
    })
})
