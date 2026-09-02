// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { Tabs } from "./index.js"

vi.stubGlobal("ResizeObserver", class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
})

describe("Core Tabs", () => {
    it("keeps the server and first client tree stable before HeroUI collection hydration", () => {
        const html = renderToString(<Tabs label="Workspace" selectedKey="content" items={[{ id: "content", label: "Task brief" }]} />)
        expect(html).toContain("data-grammar-tabs-client=\"pending\"")
        expect(html).not.toContain("data-slot=\"tabs\"")
    })

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
        expect(container.querySelector("[data-grammar-tabs-inset='none']")).not.toBeNull()
        expect(container.querySelector("[data-grammar-tabs-overflow='scroll']")?.getAttribute("class")).toContain("scroll-shadow--hide-scrollbar")
        expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("class")).toContain("tabs__tab")
        expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-controls")).toBeTruthy()
        fireEvent.click(screen.getByRole("tab", { name: "Community" }))
        expect(onSelect).toHaveBeenCalledWith("community")
    })

    it("exposes an explicit compact-label identity mode", () => {
        const { container } = render(<Tabs label="Workspace" selectedKey="content" labelVisibility="always" items={[{ id: "content", label: "Task brief" }]} />)
        expect(container.querySelector("[data-grammar-tab-labels='always']")).not.toBeNull()
        expect(screen.getByText("Task brief")).not.toBeNull()
    })

    it("owns the optional page inset instead of requiring an app wrapper", () => {
        const { container } = render(<Tabs inset="page" label="Workspace" selectedKey="content" items={[{ id: "content", label: "Task brief" }]} />)
        expect(container.querySelector("[data-grammar-tabs-inset='page']")).not.toBeNull()
    })
})
