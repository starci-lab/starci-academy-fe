import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ContractContent } from "@/components/branches/Tree"
import { CourseMobileEnrollBar, CourseMobileEnrollBarBase } from "./component"

const discounted = {
    price: "1,250,000 ₫",
    originalPrice: "1,500,000 ₫",
    ctaLabel: "Enrol now",
}

const priceLine = () => document.querySelector("[data-node=\"price-discount-line\"]")

describe("CourseMobileEnrollBarBase", () => {
    it("pins the payable price beside one action and reports the press", () => {
        const act = vi.fn()
        render(<CourseMobileEnrollBarBase state="ready" props={discounted} on={{ act }} />)

        expect(screen.getByText("1,250,000 ₫")).toHaveAttribute("data-superseded", "false")
        expect(screen.getByText("1,500,000 ₫")).toHaveAttribute("data-superseded", "true")
        expect(priceLine()?.childElementCount).toBe(2)
        const action = screen.getByRole("button", { name: "Enrol now" })
        expect(action).toHaveAttribute("data-size", "sm")
        expect(action).toHaveAttribute("data-variant", "primary")
        fireEvent.click(action)
        expect(act).toHaveBeenCalledOnce()
    })

    it("never repeats the saving badge the rail already carries", () => {
        render(<CourseMobileEnrollBarBase state="ready" props={discounted} />)

        expect(document.querySelector("[data-component=\"Badge\"]")).toBeNull()
    })

    it("shows one figure alone for a course sold at list price", () => {
        render(
            <CourseMobileEnrollBarBase
                state="ready"
                props={{ price: "400,000 ₫", ctaLabel: "Enrol now" }}
            />,
        )

        expect(screen.getByText("400,000 ₫")).toBeInTheDocument()
        expect(priceLine()?.childElementCount).toBe(1)
        expect(document.querySelector("[data-superseded=\"true\"]")).toBeNull()
    })

    it("withholds the struck list price while the viewer's own price is still resolving", () => {
        render(
            <CourseMobileEnrollBarBase
                state="price-pending"
                props={{ ...discounted, price: undefined }}
            />,
        )

        expect(screen.queryByText("1,500,000 ₫")).toBeNull()
        expect(priceLine()?.childElementCount).toBe(1)
        expect(priceLine()?.firstElementChild).toHaveAttribute("data-loading", "true")
        expect(screen.getByRole("button", { name: "Enrol now" })).toBeEnabled()
    })

    it("survives a press on a bar whose host is not listening", () => {
        render(
            <ContractContent
                contract="course-mobile-action-bar"
                render={CourseMobileEnrollBar({ state: "ready", props: discounted })}
            />,
        )

        expect(document.querySelectorAll("[data-node=\"course-mobile-action-bar\"]")).toHaveLength(1)
        fireEvent.click(screen.getByRole("button", { name: "Enrol now" }))
        expect(screen.getByText("1,250,000 ₫")).toBeInTheDocument()
    })
})
