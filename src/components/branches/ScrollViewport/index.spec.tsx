import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScrollViewport } from "."
import { defineContractProjection } from "@/components/contracts/props"

/**
 * What these tests guard.
 *
 * HeroUI does not ship its modal scrollbar as a standalone component, so this branch preserves the
 * vendor mechanism rather than painting a parallel scrollbar: the boundary selects an approved
 * maximum-height entry, that entry carries the vendor `scrollbar` utility, and the card around it
 * is the one marked as keeping its boundary while the content inside moves.
 *
 * The rail itself is projected in already drawn, so the viewport must not rearrange it.
 */

const rail = defineContractProjection("course-pricing-rail", () => (
    <p data-testid="rail-body">1.750.000 ₫</p>
))
const navigationGroups = defineContractProjection("learn-course-navigation-groups-scroll", () => (
    <div data-testid="navigation-groups" />
))
const contentMapModules = defineContractProjection("content-map-module-list", () => (
    <div data-testid="content-map-modules" />
))
const readerMain = defineContractProjection("content-reader-main-scroll-viewport", () => (
    <div data-testid="reader-main" />
))
const outlineRail = defineContractProjection("content-outline-rail", () => (
    <div data-testid="outline-rail" />
))

describe("ScrollViewport", () => {
    it("bounds the pricing rail in the approved scrolling entry inside one marked card", () => {
        const { container } = render(<ScrollViewport boundary="pricing-rail" render={rail} />)

        const viewport = container.querySelector("[data-node=\"pricing-rail-scroll-viewport\"]")
        expect(viewport).not.toBeNull()
        expect(viewport?.className).toContain("overflow-y-auto")
        expect(viewport?.className).toContain("scrollbar")
        expect(container.querySelector("[data-component=\"SurfaceCardSurface\"]")).toHaveAttribute("data-scroll-inside", "pricing-rail")
    })

    it("keeps the rail's own node and does not name the section around it", () => {
        const { container } = render(<ScrollViewport boundary="pricing-rail" render={rail} />)

        expect(container.querySelector("[data-node=\"course-pricing-rail\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"label-row-over-card\"]")).toBeNull()
        expect(screen.getByTestId("rail-body")).toBeInTheDocument()
    })

    it("uses the vendor scroll branch for long navigation groups", () => {
        const { container } = render(
            <ScrollViewport boundary="learn-navigation-groups" render={navigationGroups} />,
        )

        const viewport = container.querySelector("[data-node=learn-course-navigation-groups-scroll]")
        expect(viewport).not.toBeNull()
        expect(viewport).toHaveClass("scroll-shadow--vertical", "scroll-shadow--hide-scrollbar")
        expect(screen.getByTestId("navigation-groups")).toBeInTheDocument()
    })

    it("keeps the resize separator visually separate from the content-map scrollbar", () => {
        const { container } = render(
            <ScrollViewport boundary="content-map-modules" render={contentMapModules} />,
        )

        const viewport = container.querySelector("[data-node=content-map-module-list]")
        expect(viewport).toHaveClass("scroll-shadow--vertical", "scroll-shadow--hide-scrollbar")
        expect(viewport).not.toHaveClass("scrollbar")
        expect(screen.getByTestId("content-map-modules")).toBeInTheDocument()
    })

    it("gives the reading document one full-height scroll owner", () => {
        const { container } = render(<ScrollViewport boundary="content-reader-main" render={readerMain} />)
        const viewport = container.querySelector("[data-node=content-reader-main-scroll-viewport]")
        expect(viewport).toHaveClass("h-full", "min-h-0", "overflow-y-auto", "scrollbar")
        expect(screen.getByTestId("reader-main")).toBeInTheDocument()
    })

    it("gives the on-page outline one full-height scroll owner", () => {
        const { container } = render(<ScrollViewport boundary="content-outline-rail" render={outlineRail} />)
        const viewport = container.querySelector("[data-node=content-outline-rail]")
        expect(viewport).toHaveClass("h-full", "min-h-0", "overflow-y-auto", "scrollbar")
        expect(screen.getByTestId("outline-rail")).toBeInTheDocument()
    })
})
