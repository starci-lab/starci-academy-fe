import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { SurfaceAccordionCard } from "./branch/SurfaceAccordionCard/index.js"
import { SurfaceCard } from "./branch/SurfaceCard/index.js"
import { SurfaceListCard } from "./branch/SurfaceListCard/index.js"
import { HorizontalScrollRegion } from "./composite/HorizontalScrollRegion/index.js"
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
        expectVerticalScrollShadow(renderToStaticMarkup(
            <SurfaceCard ariaLabel="Card" isScrollable><p>Body</p></SurfaceCard>,
        ))
    })

    it("makes SurfaceListCard rows vertically scrollable", () => {
        expectVerticalScrollShadow(renderToStaticMarkup(
            <SurfaceListCard ariaLabel="List" isScrollable><p>Row</p></SurfaceListCard>,
        ))
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
