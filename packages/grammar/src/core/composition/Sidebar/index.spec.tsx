/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Sidebar } from "./index.js"

afterEach(cleanup)

const HomeGlyph = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />

describe("Core Sidebar", () => {
    it("renders one controlled grouped destination collection", () => {
        const action = vi.fn()
        render(<Sidebar label="Workspace" selectedKey="home" groups={[{ id: "main", label: "Main", items: [{ id: "home", label: "Home", source: HomeGlyph }, { id: "locked", label: "Locked", isDisabled: true }] }]} onAction={action} />)
        expect(screen.getByRole("listbox", { name: "Workspace" })).toBeTruthy()
        expect(screen.getByText("Main")).toBeTruthy()
        expect(screen.getByText("Home")).toBeTruthy()
        expect(screen.getByRole("option", { name: "Locked" }).getAttribute("data-disabled")).toBe("true")
    })

    it("owns collapse geometry while caller owns collapse state", () => {
        const change = vi.fn()
        render(<Sidebar label="Workspace" isCollapsed collapseLabel="Collapse" expandLabel="Expand" toggleSource={HomeGlyph} groups={[{ id: "main", items: [{ id: "home", label: "Home", source: HomeGlyph }] }]} onCollapsedChange={change} />)
        expect(screen.getByRole("button", { name: "Expand" })).toBeTruthy()
        expect(screen.queryByText("Home")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Expand" }))
        expect(change).toHaveBeenCalledWith(false)
    })
})
