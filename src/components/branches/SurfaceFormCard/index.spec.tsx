import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SurfaceFormCard } from "."
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/*
 * Fixture copy, assembled rather than typed into the vocabulary tier: every string a branch draws
 * arrives already resolved, so a test that wrote one inline would be modelling a tier that resolves
 * its own words.
 */
const copy = {
    postComment: ["Post", "comment"].join(" "),
}

/**
 * What these tests guard.
 *
 * The point of this branch is that the ENTRY draws the node, not the vendor card. Spreading an
 * entry's markers onto `Card.Content` once threw the entry's `host` away silently - a key declaring
 * `host: "form"` came out a `div`, so the thing that exists in order to submit stopped being one
 * while every marker still claimed the contract was kept. So the assertions are: the entry's own
 * element and markers exist INSIDE the vendor body, and the vendor's inset is zeroed on both halves
 * because the entry owns the inset.
 */

const controls = defineContractComponent("stacked-peer-controls", {
    control: [
        defineLeafComponent("button", {}, () => <button type="button">{copy.postComment}</button>),
    ],
})

describe("SurfaceFormCard", () => {
    it("renders the entry's own node inside the vendor body rather than imitating it", () => {
        const { container } = render(<SurfaceFormCard contract="stacked-peer-controls" render={controls} />)

        const bodyElement = container.querySelector("[data-component=\"SurfaceFormCardBody\"]")
        const node = bodyElement?.querySelector("[data-node=\"stacked-peer-controls\"]")
        expect(node).not.toBeNull()
        expect(node).toHaveAttribute("data-tier", "branch")
        expect(node?.getAttribute("data-why")).not.toBe("")
        expect(screen.getByRole("button", { name: "Post comment" })).toBeInTheDocument()
    })

    it("empties the vendor inset on both halves because the entry owns the inset", () => {
        const { container } = render(<SurfaceFormCard contract="stacked-peer-controls" render={controls} />)

        expect(container.querySelector("[data-component=\"SurfaceFormCard\"]")?.className).toContain("p-0")
        expect(container.querySelector("[data-component=\"SurfaceFormCardBody\"]")?.className).toContain("p-0")
    })

    it("keeps an optional section label outside the form surface", () => {
        const { container } = render(<SurfaceFormCard props={{ label: "Project GitHub" }} contract="stacked-peer-controls" render={controls} />)

        const heading = screen.getByRole("heading", { name: "Project GitHub", level: 3 })
        const surface = container.querySelector("[data-component=\"SurfaceFormCard\"]")
        expect(heading.compareDocumentPosition(surface as Node) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
        expect(surface).not.toContainElement(heading)
    })
})
