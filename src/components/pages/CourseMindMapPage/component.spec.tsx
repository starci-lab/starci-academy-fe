import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseMindMapBase, type CourseMindMapNodeView, type CourseMindMapBlockProps } from "@/components/blocks/learn/CourseMindMap/component"

/**
 * What these tests guard: three different absences that all draw an empty canvas. A graph the course
 * never built, a graph that could not be read and a search that matched nothing look identical
 * except for their notice, and only the failed one may offer a retry. The open action is likewise a
 * fact about the selected node - it appears only for a node the server can resolve to a route.
 */

const node = (overrides: Partial<CourseMindMapNodeView> = {}): CourseMindMapNodeView => ({
    id: "node-1",
    label: "Containers",
    detail: "12 lessons",
    left: 50,
    top: 50,
    canOpen: true,
    ...overrides,
})

const copy = {
    title: "Concept map",
    description: "How the course concepts connect",
    searchLabel: "Search concepts",
    searchPlaceholder: "Type a keyword",
    clearSearchLabel: "Clear search",
    emptyText: "This course has no concept map yet",
    noResultsText: "No concept matches that search",
    failedText: "The concept map could not be read",
    retryLabel: "Try again",
    openLabel: "Open content",
    graphFact: "18 concepts · 24 connections",
}

const handlers = (): CourseMindMapBlockProps["on"] => ({
    search: vi.fn(),
    select: vi.fn(),
    openContent: vi.fn(),
    retry: vi.fn(),
})

const draw = (
    blockState: CourseMindMapBlockProps["blockState"],
    props: Partial<CourseMindMapBlockProps["props"]> = {},
    on: CourseMindMapBlockProps["on"] = handlers(),
) => render(
    <CourseMindMapBase
        blockState={blockState}
        props={{ ...copy, nodes: [node()], selectedId: "node-1", ...props }}
        on={on}
    />,
)

describe("CourseMindMapBase", () => {
    it("draws the graph scale, the selected node's detail and its route into real content", () => {
        const { container } = draw("ready")

        expect(container.querySelector("[data-node=\"course-mind-map-workspace\"]")).not.toBeNull()
        expect(screen.getByText("18 concepts · 24 connections")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Containers · 12 lessons" })).toHaveAttribute("aria-current", "page")
        expect(screen.getByText("12 lessons")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Open content" })).toBeInTheDocument()
    })

    it("forwards the search term, the selected node id and the opened node id to the owner", () => {
        const on = handlers()
        draw("ready", {}, on)

        fireEvent.change(screen.getByRole("searchbox", { name: "Search concepts" }), { target: { value: "container" } })
        fireEvent.submit(screen.getByRole("search"))
        fireEvent.click(screen.getByRole("link", { name: "Containers · 12 lessons" }))
        fireEvent.click(screen.getByRole("button", { name: "Open content" }))

        expect(on.search).toHaveBeenCalledWith("container")
        expect(on.select).toHaveBeenCalledWith("node-1")
        expect(on.openContent).toHaveBeenCalledWith("node-1")
    })

    it("names a node the graph gave no detail for by its label alone", () => {
        draw("ready", { nodes: [node({ detail: undefined })] })

        expect(screen.getByRole("link", { name: "Containers" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Open content" })).toBeInTheDocument()
    })

    it("says nothing about a selection and offers no route while no node is selected", () => {
        draw("ready", { selectedId: undefined })

        expect(screen.getByRole("link", { name: "Containers · 12 lessons" })).not.toHaveAttribute("aria-current")
        expect(screen.queryByText("12 lessons")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Open content" })).not.toBeInTheDocument()
    })

    it("keeps the open action off a node the server cannot resolve to a course route", () => {
        draw("ready", { nodes: [node({ canOpen: false })] })

        expect(screen.getByText("12 lessons")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Open content" })).not.toBeInTheDocument()
    })

    it("rests the graph facts it cannot yet state while keeping the nodes it already holds", () => {
        const { container } = draw("pending")

        expect(container.querySelector("[data-component=Heading][data-loading=\"true\"]")).not.toBeNull()
        expect(container.querySelector("[data-component=Text][data-loading=\"true\"]")).not.toBeNull()
        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(1)
        expect(screen.queryByText("This course has no concept map yet")).not.toBeInTheDocument()
    })

    it("says the course never built a map, without offering an action there is none for", () => {
        draw("empty", { nodes: [], selectedId: undefined })

        expect(screen.getByText("This course has no concept map yet")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("tells a fruitless search apart from a course with no map at all", () => {
        draw("ready", { nodes: [], selectedId: undefined })

        expect(screen.getByText("No concept matches that search")).toBeInTheDocument()
        expect(screen.queryByText("This course has no concept map yet")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("says the map could not be read and offers the one action that can fix it", () => {
        const on = handlers()
        draw("failed", { nodes: [], selectedId: undefined }, on)

        expect(screen.getByText("The concept map could not be read")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(on.retry).toHaveBeenCalledTimes(1)
    })

    it("shows no notice at all once the graph has nodes to show", () => {
        draw("ready")

        expect(screen.queryByText("This course has no concept map yet")).not.toBeInTheDocument()
        expect(screen.queryByText("No concept matches that search")).not.toBeInTheDocument()
        expect(screen.queryByText("The concept map could not be read")).not.toBeInTheDocument()
    })
})
