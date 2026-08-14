import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseMindMapPage, type CourseMindMapPageProps } from "./component"

const input = (): CourseMindMapPageProps => ({
    state: "ready",
    props: {
        title: "Concept map",
        description: "Course concepts",
        searchLabel: "Search concepts",
        searchPlaceholder: "Type a keyword",
        emptyText: "No map",
        noResultsText: "No results",
        failedText: "Map failed",
        retryLabel: "Try again",
        openLabel: "Open content",
        nodes: [{ id: "node-1", label: "Containers", left: 50, top: 50, canOpen: true }],
        edgeCount: 0,
        selectedId: "node-1",
        query: "",
    },
    on: { search: vi.fn(), select: vi.fn(), openContent: vi.fn(), retry: vi.fn() },
})

describe("_CourseMindMapPage", () => {
    it("forwards search, selection and real-content navigation actions", () => {
        const props = input()
        render(<_CourseMindMapPage {...props} />)

        fireEvent.change(screen.getByRole("searchbox", { name: "Search concepts" }), { target: { value: "container" } })
        fireEvent.click(screen.getAllByRole("button", { name: "Containers" })[0])
        fireEvent.click(screen.getByRole("button", { name: "Open content" }))

        expect(props.on.search).toHaveBeenCalledWith("container")
        expect(props.on.select).toHaveBeenCalledWith("node-1")
        expect(props.on.openContent).toHaveBeenCalledWith("node-1")
    })
})
