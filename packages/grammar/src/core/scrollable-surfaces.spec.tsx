import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { SurfaceAccordionCard } from "./branch/SurfaceAccordionCard/index.js"
import { SurfaceCard } from "./branch/SurfaceCard/index.js"
import { SurfaceListCard } from "./branch/SurfaceListCard/index.js"
import { HorizontalScrollRegion } from "./composite/HorizontalScrollRegion/index.js"
import { StaticStateRow } from "./composite/StaticStateRow/index.js"
import { OtpInput } from "./OtpInput.js"

const expectVerticalScrollShadow = (markup: string) => {
    expect(markup).toContain("data-grammar-scroll=\"contained\"")
    expect(markup).toContain("scroll-shadow--vertical")
    expect(markup).toContain("data-orientation=\"vertical\"")
}

describe("scrollable Core surfaces", () => {
    it("preserves intrinsic-width content in a horizontal ScrollShadow", () => {
        const markup = renderToStaticMarkup(
            <HorizontalScrollRegion><div>Six fixed slots</div></HorizontalScrollRegion>,
        )
        expect(markup).toContain("scroll-shadow--horizontal")
        expect(markup).toContain("data-orientation=\"horizontal\"")
    })

    it("owns the conventional six-slot OTP control inside that horizontal region", () => {
        const markup = renderToStaticMarkup(<OtpInput id="otp" name="otp" />)
        expect(markup).toContain("scroll-shadow--horizontal")
        expect(markup.match(/data-slot="input-otp-slot"/g)).toHaveLength(6)
        expect(markup).toContain("autocomplete=\"one-time-code\"")
        expect(markup).toContain("inputmode=\"numeric\"")
    })

    it("makes SurfaceCard content vertically scrollable", () => {
        const markup = renderToStaticMarkup(
            <SurfaceCard ariaLabel="Card" isScrollable><p>Body</p></SurfaceCard>,
        )
        expectVerticalScrollShadow(markup)
        expect(markup).toContain("starci-core-surface-card")
        expect(markup).toContain("starci-core-surface")
        expect(markup).toContain("starci-core-surface-content")
    })

    it("binds the frameless SurfaceCard treatment to the Core stylesheet identity", () => {
        const markup = renderToStaticMarkup(
            <SurfaceCard ariaLabel="Frameless card" frame="frameless"><p>Body</p></SurfaceCard>,
        )
        expect(markup).toContain("starci-core-surface-card")
        expect(markup).toContain("starci-core-surface starci-core-frameless-surface")
        expect(markup).toContain("starci-core-surface-content")
    })

    it("makes SurfaceListCard rows vertically scrollable", () => {
        const markup = renderToStaticMarkup(
            <SurfaceListCard ariaLabel="List" isScrollable>
                <StaticStateRow item={{ id: "row", label: "Row", description: "Detail", state: "affirmative" }} />
            </SurfaceListCard>,
        )
        expectVerticalScrollShadow(markup)
        expect(markup).toContain("starci-core-surface-list")
        expect(markup).toContain("starci-core-surface starci-core-list-shell")
        expect(markup).toContain("starci-core-owned-collection")
        expect(markup).toContain("starci-core-static-row")
        expect(markup).toContain("starci-core-static-row-copy")
    })

    it("makes SurfaceAccordionCard rows vertically scrollable", () => {
        expectVerticalScrollShadow(renderToStaticMarkup(
            <SurfaceAccordionCard
                bodyRender="Body"
                isOpen
                isScrollable
                onOpenChange={vi.fn()}
                renderBody={(body) => body}
                renderSummary={(summary) => summary}
                summaryRender="Summary"
            />,
        ))
    })
})
