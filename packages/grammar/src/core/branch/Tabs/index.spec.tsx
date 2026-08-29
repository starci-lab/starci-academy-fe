import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Tabs } from "./index.js"

describe("Core Tabs", () => {
    it("owns horizontal overflow and keeps every peer destination accessible", () => {
        const onSelect = vi.fn()
        const { container } = render(<Tabs
            label="Dashboard"
            selectedKey="overview"
            items={[
                { id: "overview", label: "Overview", leading: <span aria-hidden="true">1</span> },
                { id: "community", label: "Community", leading: <span aria-hidden="true">2</span> },
            ]}
            onSelect={onSelect}
            panelId={(key) => `panel-${key}`}
        />)

        expect(container.querySelector("[data-grammar-tabs='true']")).not.toBeNull()
        expect(container.querySelector("[data-grammar-tabs-overflow='scroll']")).not.toBeNull()
        expect(screen.getByRole("tab", { name: "Community" }).getAttribute("aria-controls")).toBe("panel-community")
        fireEvent.click(screen.getByRole("tab", { name: "Community" }))
        expect(onSelect).toHaveBeenCalledWith("community")
    })
})
