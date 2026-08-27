import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CartLineBase } from "./component"

const discounted = {
    courseId: "course-1",
    title: "Fullstack Mastery",
    tier: "Advanced",
    cover: "https://cdn.example/fullstack.png",
    price: "1,250,000 ₫",
    originalPrice: "1,500,000 ₫",
    discountLabel: "−17%",
    removeLabel: "Remove Fullstack Mastery from cart",
}

const listPrice = {
    courseId: "course-2",
    title: "Git Foundations",
    cover: null,
    price: "400,000 ₫",
    removeLabel: "Remove Git Foundations from cart",
}

describe("CartLineBase", () => {
    it("leads with the payable price and qualifies it with the struck list price and the saving", () => {
        render(<CartLineBase state="ready" props={discounted} />)

        expect(screen.getByText("Fullstack Mastery")).toHaveAttribute(
            "data-weight",
            "semibold",
        )
        expect(screen.getByText("Advanced")).toHaveAttribute("data-size", "xs")
        expect(screen.getByText("1,250,000 ₫")).toHaveAttribute(
            "data-superseded",
            "false",
        )
        expect(screen.getByText("1,500,000 ₫")).toHaveAttribute(
            "data-superseded",
            "true",
        )
        expect(
            screen.getByText("−17%").closest("[data-slot=\"chip\"]"),
        ).toHaveAttribute("data-tone", "success")
    })

    it("omits the struck price, the saving and the tier line for a course at list price", () => {
        render(<CartLineBase state="ready" props={listPrice} />)

        expect(screen.getByText("400,000 ₫")).toBeInTheDocument()
        expect(document.querySelector("[data-superseded=\"true\"]")).toBeNull()
        expect(document.querySelector("[data-slot=\"chip\"]")).toBeNull()
        expect(screen.queryByText("Advanced")).toBeNull()
    })

    it("draws the artwork fallback for a course whose cover has not been set at all", () => {
        render(
            <CartLineBase state="ready" props={{ ...listPrice, cover: undefined }} />,
        )

    })

    it("takes the course out of the basket when the removal glyph is pressed", () => {
        const remove = vi.fn()
        render(<CartLineBase state="ready" props={discounted} on={{ remove }} />)

        fireEvent.click(
            screen.getByRole("button", {
                name: "Remove Fullstack Mastery from cart",
            }),
        )
        expect(remove).toHaveBeenCalledOnce()
    })

    it("refuses a second press while this line's own removal is already in flight", () => {
        const remove = vi.fn()
        render(
            <CartLineBase state="removing" props={discounted} on={{ remove }} />,
        )

        fireEvent.click(
            screen.getByRole("button", {
                name: "Remove Fullstack Mastery from cart",
            }),
        )
        expect(remove).not.toHaveBeenCalled()
    })

    it("survives a press on a line nobody is listening to", () => {
        render(<CartLineBase state="ready" props={discounted} />)

        fireEvent.click(
            screen.getByRole("button", {
                name: "Remove Fullstack Mastery from cart",
            }),
        )
        expect(screen.getByText("Fullstack Mastery")).toBeInTheDocument()
    })

    it("rests the name, the tier, the price and the artwork while the line is a resting shape", () => {
        render(
            <CartLineBase
                state="pending"
                props={{
                    courseId: "resting",
                    tier: undefined,
                    removeLabel: "Remove from cart",
                }}
            />,
        )

        expect(
            document.querySelectorAll("[data-loading=\"true\"]"),
        ).toHaveLength(3)
        expect(
            screen.getByRole("button", { name: "Remove from cart" }),
        ).toBeInTheDocument()
    })

    it("rests every optional figure the line still carries while it is pending", () => {
        render(<CartLineBase state="pending" props={discounted} />)

        expect(document.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(document.querySelector("[data-slot=\"chip\"]")).toHaveAttribute(
            "data-loading",
            "true",
        )
    })
})
