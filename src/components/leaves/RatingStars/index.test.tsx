import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RatingStars } from "./index"

describe("RatingStars", () => {
    it("renders a read-only half-capable yellow rating on React 19", async () => {
        render(<RatingStars props={{ label: "4.5 out of 5", value: 4.5 }} />)

        const rating = screen.getByRole("img", { name: "4.5 out of 5" })
        expect(rating).toHaveAttribute("data-rating", "4.5")
        await waitFor(() => {
            expect(rating.querySelectorAll(".react-stars > span")).toHaveLength(5)
        })
        expect(rating.querySelectorAll("svg")).toHaveLength(6)
        for (const star of rating.querySelectorAll("svg")) {
            expect(star).toHaveClass("size-5")
        }
        expect(rating.innerHTML).toContain("var(--warning)")
    })
})
