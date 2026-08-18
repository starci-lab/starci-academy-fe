import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PressableSurface } from "."
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/*
 * Fixture copy, assembled rather than typed into the vocabulary tier: every string a branch draws
 * arrives already resolved, so a test that wrote one inline would be modelling a tier that resolves
 * its own words.
 */
const copy = {
    designTokens: ["Design", "tokens"].join(" "),
    sharedTokens: ["Shared", "tokens"].join(" "),
}

/**
 * What these tests guard.
 *
 * The button belongs to THIS branch; the arranged node underneath is unchanged, so the same key can
 * be pressed on one screen and inert on the next. That is the whole reason the control is drawn
 * here rather than by putting a caller's key on a button host.
 *
 * One gesture, one answer: a surface whose content names its destination answers on that name and
 * must not also dim; a surface with no such name dims, because something has to answer. And a
 * pressable tile in a grid of inert tiles must be the SAME card - which is why `isRaised` hands the
 * node to `SurfaceCard` instead of drawing a second surface of its own.
 */

const content = defineContractComponent("title-with-baseline-fact", {
    title: defineLeafComponent("heading", {}, () => <h3>{copy.designTokens}</h3>),
    fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <span>{copy.sharedTokens}</span>),
})

describe("PressableSurface", () => {
    it("names the destination and reports the press", () => {
        const press = vi.fn()
        render(
            <PressableSurface contract="title-with-baseline-fact" render={content} label="Design tokens" press={press} />,
        )

        const control = screen.getByRole("button", { name: "Design tokens" })
        fireEvent.click(control)
        expect(press).toHaveBeenCalledOnce()
        expect(control).toHaveAttribute("data-component", "PressableSurface")
        expect(control).toHaveAttribute("type", "button")
    })

    it("leaves the arranged node underneath exactly as the entry drew it", () => {
        const { container } = render(
            <PressableSurface contract="title-with-baseline-fact" render={content} label="Design tokens" />,
        )

        const node = container.querySelector("[data-node=\"title-with-baseline-fact\"]")
        expect(node?.parentElement?.tagName).toBe("BUTTON")
        expect(container.querySelector("[data-component=\"SurfaceCardSurface\"]")).toBeNull()
        expect(screen.getByRole("heading", { name: "Design tokens" })).toBeInTheDocument()
    })

    it("dims the whole surface when nothing inside names where it goes", () => {
        render(<PressableSurface contract="title-with-baseline-fact" render={content} label="Design tokens" />)

        const control = screen.getByRole("button", { name: "Design tokens" })
        expect(control).toHaveAttribute("data-hover", "surface")
        expect(control.className).toContain("hover:opacity-80")
        expect(control.className).not.toContain("group")
    })

    it("leaves the surface still and lets the naming line answer the hover instead", () => {
        render(
            <PressableSurface contract="title-with-baseline-fact" render={content} label="Design tokens" hover="label" />,
        )

        const control = screen.getByRole("button", { name: "Design tokens" })
        expect(control).toHaveAttribute("data-hover", "label")
        expect(control.className).toContain("group")
        expect(control.className).not.toContain("hover:opacity-80")
    })

    it("stands a raised tile on the same card an inert tile beside it would use", () => {
        const { container } = render(
            <PressableSurface contract="title-with-baseline-fact" render={content} label="Design tokens" isRaised />,
        )

        expect(container.querySelector("[data-component=\"SurfaceCardSurface\"]")).not.toBeNull()
        expect(container.querySelector("[data-component=\"SurfaceCardBody\"] [data-node=\"title-with-baseline-fact\"]")).not.toBeNull()
    })

    it("refuses activation and announces itself busy while the route is unavailable", () => {
        const press = vi.fn()
        render(
            <PressableSurface
                contract="title-with-baseline-fact"
                render={content}
                label="Design tokens"
                press={press}
                disabled
            />,
        )

        const control = screen.getByRole("button", { name: "Design tokens" })
        expect(control).toBeDisabled()
        expect(control).toHaveAttribute("aria-busy", "true")
        fireEvent.click(control)
        expect(press).not.toHaveBeenCalled()
    })

    it("carries no busy claim while it is pressable", () => {
        render(<PressableSurface contract="title-with-baseline-fact" render={content} label="Design tokens" />)
        expect(screen.getByRole("button", { name: "Design tokens" })).not.toHaveAttribute("aria-busy")
    })
})
