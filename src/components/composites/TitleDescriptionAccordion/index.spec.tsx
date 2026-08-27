import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TitleDescriptionAccordion } from "."

describe("TitleDescriptionAccordion", () => {
    it("keeps every title/description item inside one Grammar-owned accordion surface", () => {
        render(
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

        const triggers = screen.getAllByRole("button")
        expect(triggers).toHaveLength(3)
        for (const trigger of triggers) expect(trigger).toHaveAttribute("aria-expanded", "false")

        fireEvent.click(screen.getByText("Architecture"))
        fireEvent.click(screen.getByText("Operations"))
        fireEvent.click(screen.getByText("Delivery"))
        expect(screen.getByText("Define the system boundaries.")).toBeVisible()
        expect(screen.getByText("Handle production failure modes.")).toBeVisible()
        expect(screen.getByText("Ship the verified release.")).toBeVisible()
        expect(screen.getAllByRole("button")).toHaveLength(3)
    })

    it("keeps an item without a description visible but non-disclosing", () => {
        render(<TitleDescriptionAccordion props={{ label: "FAQ", items: [{ id: "empty", title: "No FAQs yet", description: "" }] }} />)

        expect(screen.getByText("No FAQs yet").closest("button")).toBeDisabled()
        expect(screen.getByText("No FAQs yet").closest("button")?.querySelector("svg")).toBeNull()
    })
})
