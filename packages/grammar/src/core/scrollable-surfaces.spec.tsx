import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { SurfaceAccordionCard } from "./branch/SurfaceAccordionCard/index.js"
import { SurfaceCard } from "./branch/SurfaceCard/index.js"
import { SurfaceListCard } from "./branch/SurfaceListCard/index.js"
import { HorizontalScrollRegion } from "./composite/HorizontalScrollRegion/index.js"
import { StaticStateRow } from "./composite/StaticStateRow/index.js"
import { OtpInput } from "./OtpInput.js"
import { SectionHeader } from "./primitive/SectionHeader/index.js"
import { Rail } from "./branch/Rail/index.js"

const expectVerticalScrollShadow = (markup: string) => {
    expect(markup).toContain("data-grammar-scroll=\"contained\"")
    expect(markup).toContain("scroll-shadow--vertical")
    expect(markup).toContain("data-orientation=\"vertical\"")
}

describe("scrollable Core surfaces", () => {
    it("owns the three semantic layers of ContextIntro", () => {
        const markup = renderToStaticMarkup(<SectionHeader eyebrow="Next task" title="Personal project" description="Supporting evidence" level={1} composition="context-intro" />)
        expect(markup).toContain("data-grammar-composition=\"context-intro\"")
        expect(markup).toContain("starci-core-section-eyebrow")
        expect(markup).toContain("<h1 class=\"starci-core-section-title\"")
        expect(markup).toContain("starci-core-section-description")
    })

    it("owns right-rail padding and sticky lifecycle", () => {
        const markup = renderToStaticMarkup(<Rail label="Project evidence" mode="sticky" inset="content" isLabelHidden>Facts</Rail>)
        expect(markup).toContain("data-grammar-rail-mode=\"sticky\"")
        expect(markup).toContain("px-3 py-6")
        expect(markup).toContain("starci-core-visually-hidden")
        expect(markup).toContain("starci-core-rail")
        expect(markup).toContain("starci-core-rail-frame")
        expect(markup).toContain("starci-core-rail-body")
    })

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
        expect(markup).toMatch(/auto[Cc]omplete="one-time-code"/)
        expect(markup).toMatch(/input[Mm]ode="numeric"/)
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

    it("owns joined composition, form measure, and fill height without consumer selectors", () => {
        const markup = renderToStaticMarkup(
            <SurfaceCard label="Editor" composition="joined" height="fill" isScrollable measure="formCompact">
                <div>Header</div>
                <div>Body</div>
            </SurfaceCard>,
        )

        expect(markup).toContain("starci-core-form-surface")
        expect(markup).toContain("starci-core-form-surface--compact")
        expect(markup).toContain("starci-core-form-scroll-viewport")
        expect(markup).toContain("starci-core-surface-card--fill")
        expect(markup).toContain("<h3")
        expect(markup).toContain("data-grammar-surface-composition=\"joined\"")
        expect(markup).toContain("data-grammar-surface-height=\"fill\"")
    })

    it("binds the frameless SurfaceCard treatment to the Core stylesheet identity", () => {
        const markup = renderToStaticMarkup(
            <SurfaceCard ariaLabel="Frameless card" frame="frameless"><p>Body</p></SurfaceCard>,
        )
        expect(markup).toContain("starci-core-surface-card")
        expect(markup).toContain("starci-core-surface starci-core-frameless-surface")
        expect(markup).toContain("overflow-visible")
        expect(markup).not.toContain("overflow-hidden")
        expect(markup).toContain("starci-core-surface-content")
    })

    it("owns the singular legacy highlight boundary and suppresses it while pending", () => {
        const highlighted = renderToStaticMarkup(
            <SurfaceCard ariaLabel="Featured card" isHighlight><p>Body</p></SurfaceCard>,
        )
        const pending = renderToStaticMarkup(
            <SurfaceCard ariaLabel="Loading card" isHighlight state="pending"><p>Body</p></SurfaceCard>,
        )

        expect(highlighted).toContain("data-grammar-highlight=\"true\"")
        expect(highlighted).toContain("starci-core-surface-highlight-sweep")
        expect(pending).not.toContain("data-grammar-highlight")
    })

    it("makes SurfaceListCard rows vertically scrollable", () => {
        const markup = renderToStaticMarkup(
            <SurfaceListCard label="List" isScrollable>
                <StaticStateRow item={{ id: "row", label: "Row", description: "Detail", state: "affirmative" }} />
            </SurfaceListCard>,
        )
        expectVerticalScrollShadow(markup)
        expect(markup).toContain("starci-core-surface-list")
        expect(markup).toContain("starci-core-surface starci-core-list-shell")
        expect(markup).toContain("<h3")
        expect(markup).toContain("starci-core-owned-collection")
        expect(markup).toContain("starci-core-static-row")
        expect(markup).toContain("starci-core-static-row-copy")
    })

    it("makes SurfaceAccordionCard rows vertically scrollable", () => {
        const markup = renderToStaticMarkup(
            <SurfaceAccordionCard
                bodyRender="Body"
                isOpen
                isScrollable
                onOpenChange={vi.fn()}
                renderBody={(body) => body}
                renderSummary={(summary) => summary}
                summaryRender="Summary"
            />,
        )
        expectVerticalScrollShadow(markup)
        expect(markup).toContain("data-slot=\"accordion\"")
        expect(markup).toContain("data-slot=\"accordion-panel\"")
        expect(markup).toContain("accordion__panel")
        expect(markup).toMatch(/class="[^"]*starci-core-accordion-panel[^"]*p-0[^"]*"/)
        expect(markup).toMatch(/class="[^"]*starci-core-accordion-body[^"]*pt-0[^"]*pb-3[^"]*pl-6[^"]*pr-4[^"]*"/)
        expect(markup).not.toContain("border-t")
    })

    it("gives a bounded SurfaceAccordionCard one external label and the shared surface frame", () => {
        const markup = renderToStaticMarkup(
            <SurfaceAccordionCard
                depth="top"
                items={[
                    { id: "first", isOpen: false, summaryRender: "First", bodyRender: "First body" },
                    { id: "second", isOpen: false, summaryRender: "Second", bodyRender: "Second body" },
                ]}
                label="Before you subscribe"
                onItemOpenChange={vi.fn()}
                renderBody={(body) => body}
                renderSummary={(summary) => summary}
            />,
        )

        expect(markup).toContain("data-grammar-surface-label=\"true\"")
        expect(markup).toContain("<h3")
        expect(markup).toContain(">Before you subscribe</h3>")
        const labelId = markup.match(/<h3 id="([^"]+)"/)?.[1]
        expect(labelId).toBeDefined()
        expect(markup).toContain(`aria-labelledby="${labelId}"`)
        expect(markup).toMatch(/class="[^"]*starci-core-surface[^"]*"/)
        expect(markup).toContain("data-grammar-frame=\"bounded\"")
        expect(markup).toContain("data-grammar-surface=\"true\"")
        expect(markup).toContain("data-grammar-surface-depth=\"top\"")
    })

    it("keeps an unbounded SurfaceAccordionCard frameless and self-named", () => {
        const markup = renderToStaticMarkup(
            <SurfaceAccordionCard
                ariaLabel="Help topics"
                bodyRender="Body"
                isOpen={false}
                onOpenChange={vi.fn()}
                renderBody={(body) => body}
                renderSummary={(summary) => summary}
                summaryRender="Summary"
            />,
        )

        expect(markup).toContain("aria-label=\"Help topics\"")
        expect(markup).toContain("data-grammar-frame=\"frameless\"")
        expect(markup).toContain("starci-core-surface starci-core-frameless-surface")
        expect(markup).not.toContain("data-grammar-surface=\"true\"")
        expect(markup).not.toContain("data-grammar-surface-depth")
    })
})
