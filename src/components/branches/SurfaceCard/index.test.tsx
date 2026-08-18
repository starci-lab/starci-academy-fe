import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SurfaceCard } from "."
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/*
 * Fixture copy, assembled rather than typed into the vocabulary tier: every string a branch draws
 * arrives already resolved, so a test that wrote one inline would be modelling a tier that resolves
 * its own words.
 */
const copy = {
    interiorControl: ["Interior", "control"].join(" "),
}

/**
 * What these tests guard.
 *
 * `SurfaceCard` holds the section NAME outside the surface, which is the decision the whole shape
 * turns on: without a name it draws the ground alone, with one it opens the label row above the
 * card, and `isFrameless` drops the inner surface while the label stays.
 *
 * The end of the label line holds ONE thing. An action outranks a fact when both are passed, and
 * the two live in different registry entries - a fact reads on the title's baseline, an action sits
 * at the end of the row - so which entry was chosen is itself the assertion.
 *
 * The caller's contract is PROJECTED into the vendor body rather than handed back as slots: the
 * surface is already a whole node, and re-opening it is the duplicate wrapper this branch was once
 * inset twice by.
 */

const body = defineContractComponent("stacked-peer-controls", {
    control: [defineLeafComponent("button", {}, () => <button type="button">{copy.interiorControl}</button>)],
})

describe("SurfaceCard", () => {
    it("draws the ground alone for an object that names itself", () => {
        const { container } = render(<SurfaceCard contract="stacked-peer-controls" render={body} />)

        expect(container.querySelector("[data-node=\"label-row-over-card\"]")).toBeNull()
        expect(container.querySelector("[data-component=\"SurfaceCardSurface\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"stacked-peer-controls\"]")).not.toBeNull()
        expect(screen.getByRole("button", { name: "Interior control" })).toBeInTheDocument()
    })

    it("opens the label row above the card once the section is named", () => {
        const { container } = render(
            <SurfaceCard props={{ label: "Weekly goals" }} contract="stacked-peer-controls" render={body} />,
        )

        const section = container.querySelector("[data-node=\"label-row-over-card\"]")
        expect(section).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Weekly goals" })).toBeInTheDocument()
        expect(section?.querySelector("[data-node=\"title-with-end-action\"]")).not.toBeNull()
        expect(section?.querySelector("[data-node=\"title-with-baseline-fact\"]")).toBeNull()
    })

    it("reads a fact on the title's own baseline as part of the same sentence", () => {
        const { container } = render(
            <SurfaceCard props={{ label: "Pinned projects", fact: "2 selected" }} contract="stacked-peer-controls" render={body} />,
        )

        expect(container.querySelector("[data-node=\"title-with-baseline-fact\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"title-with-end-action\"]")).toBeNull()
        expect(screen.getByText("2 selected")).toBeInTheDocument()
        expect(container.querySelector("[data-component=\"SeeMoreLink\"]")).toBeNull()
    })

    it("gives the end of the line to the way out and drops the fact that wanted it", () => {
        const seeMore = vi.fn()
        const { container } = render(
            <SurfaceCard
                props={{ label: "Recent activity", fact: "12 events", seeMoreLabel: "See all" }}
                on={{ seeMore }}
                contract="stacked-peer-controls"
                render={body}
            />,
        )

        expect(container.querySelector("[data-node=\"title-with-end-action\"]")).not.toBeNull()
        expect(screen.queryByText("12 events")).not.toBeInTheDocument()
        const wayOut = container.querySelector("[data-component=\"SeeMoreLink\"]")
        expect(wayOut).toHaveTextContent("See all")
        fireEvent.click(wayOut as Element)
        expect(seeMore).toHaveBeenCalledOnce()
    })

    it("refuses a way out that leads nowhere and keeps the fact instead", () => {
        const { container } = render(
            <SurfaceCard
                props={{ label: "Recent activity", fact: "12 events", seeMoreLabel: "See all" }}
                contract="stacked-peer-controls"
                render={body}
            />,
        )

        expect(screen.queryByText("See all")).not.toBeInTheDocument()
        expect(screen.getByText("12 events")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"title-with-baseline-fact\"]")).not.toBeNull()
    })

    it("keeps a named section that carries neither fact nor way out to a bare title row", () => {
        const { container } = render(
            <SurfaceCard props={{ label: "Coding metrics" }} contract="stacked-peer-controls" render={body} />,
        )

        const row = container.querySelector("[data-node=\"title-with-end-action\"]")
        expect(row?.querySelector("[data-component=\"SeeMoreLink\"]")).toBeNull()
        expect(row?.querySelector("[data-component=\"Text\"]")).toBeNull()
        expect(row?.querySelector("[data-component=\"Heading\"]")).not.toBeNull()
    })

    it("drops the inner surface for a section whose content is already made of cards", () => {
        const { container } = render(
            <SurfaceCard
                props={{ label: "Pinned projects", isFrameless: true }}
                contract="stacked-peer-controls"
                render={body}
            />,
        )

        expect(container.querySelector("[data-component=\"SurfaceCardSurface\"]")).toBeNull()
        expect(container.querySelector("[data-node=\"label-row-over-card\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Pinned projects" })).toBeInTheDocument()
    })

    it("marks the one card that keeps its boundary while the rail scrolls inside it", () => {
        const { container } = render(
            <SurfaceCard props={{ scrollInside: "pricing-rail" }} contract="stacked-peer-controls" render={body} />,
        )

        expect(container.querySelector("[data-component=\"SurfaceCardSurface\"]")).toHaveAttribute("data-scroll-inside", "pricing-rail")
        expect(container.querySelector("[data-component=\"SurfaceCardBody\"]")).not.toBeNull()
    })

    it("rests the fact with the section rather than the heading that is already known", () => {
        const { container } = render(
            <SurfaceCard
                props={{ label: "Weekly goals", fact: "40%" }}
                contract="stacked-peer-controls"
                render={body}
                isLoading
            />,
        )

        expect(container.querySelector("[data-component=\"Text\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Heading\"]")).toHaveAttribute("data-loading", "false")
    })
})
