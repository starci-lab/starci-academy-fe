/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NavLink } from "."

describe("NavLink", () => {
    it("renders an icon-only route as a labelled circle", () => {
        render(
            <NavLink
                props={{ label: "Overview", icon: "viewGrid", kind: "route", showLabel: false, isCurrent: true }}
            />,
        )

        const destination = screen.getByLabelText("Overview")
        expect(destination.className).toContain("size-11")
        expect(destination.className).toContain("rounded-full")
        expect(destination.className).toContain("justify-center")
        expect(destination.className).toContain("p-0")
        expect(destination).toHaveAttribute("aria-current", "page")
    })
})
