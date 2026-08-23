import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TableBranch } from "./index"

const columns = [
    { id: "c1", content: "Component" },
    { id: "c2", content: <code>File</code> },
]

const rows = [
    { id: "r1", cells: [{ id: "r1c1", content: "CatModule" }, { id: "r1c2", content: <code>cat.module.ts</code> }] },
    { id: "r2", cells: [{ id: "r2c1", content: "CatService" }, { id: "r2c2", content: <code>cat.service.ts</code> }] },
]

describe("TableBranch", () => {
    it("builds the vendor anatomy the caller never has to remember", () => {
        const { container } = render(<TableBranch ariaLabel="Component, File" columns={columns} rows={rows} />)
        expect(container.querySelector("[aria-label=\"Component, File\"]")).not.toBeNull()
        expect(container.querySelectorAll("[role=\"columnheader\"]")).toHaveLength(2)
        expect(container.querySelectorAll("[role=\"row\"]").length).toBeGreaterThanOrEqual(3)
    })

    it("keeps inline markup inside a cell rather than flattening it to text", () => {
        // This is the whole reason the vendor lives in a branch: a leaf slot is JSON, and a cell
        // that reached one would arrive as a string with its code and links already lost.
        const { container } = render(<TableBranch ariaLabel="Component, File" columns={columns} rows={rows} />)
        const cells = Array.from(container.querySelectorAll("[role=\"rowheader\"], [role=\"gridcell\"], [role=\"cell\"]"))
        expect(cells.some((cell) => cell.querySelector("code") !== null)).toBe(true)
    })

    it("still mounts when the source table declared no header", () => {
        const { container } = render(<TableBranch ariaLabel="untitled" columns={[]} rows={rows} />)
        const header = container.querySelector("[role=\"columnheader\"]")
        expect(header).not.toBeNull()
        expect(header?.className).toContain("sr-only")
    })
})
