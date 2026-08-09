/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import type { ContractSlotProps } from "@/components/contracts"
import { _AuthenticationPage } from "@/components/pages/AuthenticationPage/component"

/**
 * What these tests guard: that the routed surface adds NOTHING.
 *
 * It used to add a title, which was right while the thing below it was only ever a sign-in form
 * and became wrong the moment the panel could also open an account or reset a password: a fixed
 * page title above a panel that renames itself contradicts its own body two thirds of the time.
 * So the assertions here are mostly negative, and that is the design rather than a thin test - a
 * page that starts drawing furniture again is the regression worth catching.
 */

/** A stand-in for the panel, reporting the resting flag it was handed. */
const Body = ({ isLoading }: ContractSlotProps) => (
    <p data-part="body" data-loading={isLoading === true ? "true" : "false"}>Panel</p>
)

afterEach(() => {
    cleanup()
})

describe("_AuthenticationPage", () => {
    it("renders the panel it was handed", () => {
        const { container } = render(<_AuthenticationPage slots={{ body: Body }} />)
        expect(container.querySelector("[data-part='body']")?.textContent).toBe("Panel")
    })

    it("adds no node of its own around it", () => {
        const { container } = render(<_AuthenticationPage slots={{ body: Body }} />)
        expect(container.children.length).toBe(1)
        expect(container.firstElementChild?.tagName).toBe("P")
    })

    it("draws no title of its own, because the panel renames itself per journey", () => {
        const { container } = render(<_AuthenticationPage slots={{ body: Body }} />)
        expect(container.querySelector("h1")).toBeNull()
        expect(container.querySelector("[data-node='section']")).toBeNull()
    })

    it("has nothing to float above, so it draws no dialog", () => {
        const { container } = render(<_AuthenticationPage slots={{ body: Body }} />)
        expect(container.querySelector("dialog")).toBeNull()
    })

    it("rests the panel with the page rather than keeping a second tree", () => {
        const { container } = render(<_AuthenticationPage slots={{ body: Body }} isLoading />)
        expect(container.querySelector("[data-part='body']")?.getAttribute("data-loading")).toBe("true")
    })

    it("does not rest by default", () => {
        const { container } = render(<_AuthenticationPage slots={{ body: Body }} />)
        expect(container.querySelector("[data-part='body']")?.getAttribute("data-loading")).toBe("false")
    })
})
