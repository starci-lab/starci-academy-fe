import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TitleDescriptionAccordion } from "."

describe("TitleDescriptionAccordion", () => {
    it("keeps every title/description item inside one shadowed accordion surface", () => {
        const { container } = render(
            <TitleDescriptionAccordion
                props={{
                    label: "Course content",
                    items: [
                        { id: "module-1", title: "Architecture", description: "Define the system boundaries." },
                        { id: "module-2", title: "Operations", description: "Handle production failure modes." },
                        { id: "module-3", title: "Delivery", description: "Ship the verified release." },
                    ],
                }}
            />,
        )

        const surface = container.querySelector("[data-component=SurfaceAccordionCard]")
        expect(surface).toHaveClass("shadow-surface")
        expect(container.querySelectorAll("[data-component=SurfaceAccordionCardItem]")).toHaveLength(3)
        expect(container.querySelector("[data-component=SurfaceListCard]")).toBeNull()
        expect(container.querySelector("[data-component=SurfaceAccordionCardSurface]")).toBeNull()
        expect(container.querySelector("[data-node=title-description-accordion-summary]")).not.toHaveClass("px-6", "py-3")
        const triggers = screen.getAllByRole("button")
        expect(triggers[0]).toHaveClass("p-4", "pb-3")
        expect(triggers[1]).toHaveClass("px-4", "py-3")
        expect(triggers[2]).toHaveClass("p-4", "pt-3")

        fireEvent.click(screen.getByText("Architecture"))
        fireEvent.click(screen.getByText("Operations"))
        fireEvent.click(screen.getByText("Delivery"))
        expect(screen.getByText("Define the system boundaries.")).toBeVisible()
        expect(screen.getByText("Handle production failure modes.")).toBeVisible()
        expect(screen.getByText("Ship the verified release.")).toBeVisible()
        const bodies = container.querySelectorAll("[data-node=title-description-accordion-body]")
        expect(bodies).toHaveLength(3)
        for (const body of bodies) {
            expect(body).toHaveClass("px-6", "py-3")
            expect(body).not.toHaveClass("border-t", "border-separator")
        }
    })

    it("keeps an item without a description visible but non-disclosing", () => {
        render(<TitleDescriptionAccordion props={{ label: "FAQ", items: [{ id: "empty", title: "No FAQs yet", description: "" }] }} />)

        expect(screen.getByText("No FAQs yet").closest("button")).toBeDisabled()
        expect(document.querySelector("[data-component=DisclosureIndicator]")).toBeNull()
    })
})
