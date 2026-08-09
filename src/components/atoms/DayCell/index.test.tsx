/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { DayCell, meta, type DayCellProps } from "@/components/atoms/DayCell"

/**
 * What these tests guard: that a day says whether it counted in more than one channel. The chip
 * is filled when the learner was active, and the full date is rendered for assistive technology
 * either way - so the difference between an active day and a quiet one survives a monochrome
 * screen and a reader who cannot see the strip at all.
 *
 * The element matters too: the run is a LIST, so a column is an `<li>`. A row of spans looks
 * identical and tells a screen reader nothing about how many days there are.
 */

/** Render with the given props and hand back the column. */
const renderCell = (props: Partial<DayCellProps> = {}): Element => {
    const merged: DayCellProps = { weekday: "M", label: "Aug 3, 2026", ...props }
    const { container } = render(
        <ul>
            <DayCell {...merged} />
        </ul>,
    )
    const cell = container.querySelector("li")
    if (!cell) throw new Error("DayCell did not render a list item")
    return cell
}

afterEach(() => {
    cleanup()
})

describe("DayCell", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "DayCell" })
    })

    it("renders a list item, so the run is a list rather than a row of shapes", () => {
        expect(renderCell().tagName).toBe("LI")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const cell = renderCell({ isActive: true })
        expect(cell.getAttribute("data-tier")).toBe("atom")
        expect(cell.getAttribute("data-component")).toBe("DayCell")
        expect(cell.getAttribute("data-part")).toBe("day")
        expect(cell.getAttribute("data-active")).toBe("true")
    })

    it("draws the weekday letter it was handed", () => {
        expect(renderCell({ weekday: "W" }).textContent).toContain("W")
    })

    it("says which days counted in colour AND in words", () => {
        const active = renderCell({ isActive: true })
        const activeChip = active.querySelector("[data-slot], span")?.getAttribute("class") ?? ""
        expect(active.getAttribute("data-active")).toBe("true")
        cleanup()
        const quiet = renderCell({ isActive: false })
        const quietChip = quiet.querySelector("[data-slot], span")?.getAttribute("class") ?? ""
        expect(quiet.getAttribute("data-active")).toBe("false")
        expect(activeChip).not.toBe(quietChip)
    })

    it("keeps the full date for a reader who cannot see which column is which", () => {
        const date = renderCell({ label: "Aug 3, 2026" }).querySelector("[data-part='date']")
        expect(date?.textContent).toBe("Aug 3, 2026")
        expect(date?.getAttribute("class")).toContain("sr-only")
    })

    it("rests as the same column, with no letter to read", () => {
        const cell = renderCell({ weekday: "", isLoading: true })
        expect(cell.getAttribute("data-loading")).toBe("true")
        expect(cell.innerHTML).toContain("skeleton")
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as DayCellProps
        const { container } = render(
            <ul>
                <DayCell {...backDoor} weekday="M" label="Aug 3, 2026" />
            </ul>,
        )
        const cell = container.querySelector("li")
        expect(cell?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(cell?.getAttribute("style")).toBe(null)
    })
})
