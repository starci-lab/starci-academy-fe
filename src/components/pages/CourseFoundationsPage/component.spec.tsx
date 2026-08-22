import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { FoundationCategory } from "@/modules/api/graphql/queries/query-foundation-categories"
import { CourseFoundationsBlockBase as CourseFoundationsPageContentBase, type CourseFoundationsBlockProps as CourseFoundationsPageProps } from "@/components/blocks/learn/CourseFoundationsBlock/component"

/**
 * What these tests guard: the four query states this hub can be in. Three of them look alike
 * from the outside - an empty catalog, a failed one and a resting one all draw no categories -
 * and only the notice tells the reader which of the three actually happened.
 */

const category = (overrides: Partial<FoundationCategory> = {}): FoundationCategory => ({
    id: "category-1",
    displayId: "foundations",
    slug: "foundations",
    title: "Containers",
    description: "Runtime basics",
    thumbnailUrl: null,
    orderIndex: 0,
    sortIndex: 0,
    ...overrides,
})

const copy = {
    title: "Foundations",
    description: "Durable concepts",
    empty: "No categories",
    failed: "Catalog failed",
    retry: "Try again",
    search: "Search categories",
    clearSearch: "Clear search",
    count: "1 category",
    open: "Open category",
    resultsTitle: "Categories",
    resultsDescription: "Choose a topic",
    layoutLabel: "Category layout",
    gridLabel: "Grid",
    lineLabel: "List",
    activeGrid: "Viewing as a grid",
    activeLine: "Viewing as a list",
    layout: "grid" as const,
    pager: "Category pages",
    previous: "Previous page",
    next: "Next page",
    page: 1,
    totalPages: 1,
}

const draw = (
    state: CourseFoundationsPageProps["state"],
    categories: ReadonlyArray<FoundationCategory>,
    on?: CourseFoundationsPageProps["on"],
) => render(<CourseFoundationsPageContentBase state={state} props={{ ...copy, categories }} on={on} />)

describe("CourseFoundationsPageContentBase", () => {
    it("renders the canonical catalog and forwards live category actions", () => {
        const openCategory = vi.fn()
        const search = vi.fn()
        const { container } = draw("ready", [category()], { openCategory, search })

        fireEvent.click(screen.getByRole("button", { name: "Open category" }))
        fireEvent.change(screen.getByRole("searchbox", { name: "Search categories" }), { target: { value: "container" } })
        fireEvent.submit(screen.getByRole("search"))

        expect(container.querySelector("[data-node=\"course-foundations-workspace\"]")).not.toBeNull()
        expect(container.querySelectorAll("[data-component=SurfaceCardSurface]")).toHaveLength(1)
        expect(openCategory).toHaveBeenCalledWith("category-1")
        expect(search).toHaveBeenCalledWith("container")
    })

    it("draws list mode as one joined list-card surface and reports layout changes", () => {
        const changeLayout = vi.fn()
        const { container } = render(
            <CourseFoundationsPageContentBase
                state="ready"
                props={{ ...copy, layout: "line", categories: [category()] }}
                on={{ changeLayout }}
            />,
        )

        expect(container.querySelectorAll("[data-component=SurfaceListCardSurface]")).toHaveLength(1)
        expect(container.querySelector("[data-node=foundation-category-card-grid]")).toBeNull()
        fireEvent.click(screen.getByRole("tab", { name: "Grid" }))
        expect(changeLayout).toHaveBeenCalledWith("grid")
    })

    it("names a category the backend gave no description for by its title alone", () => {
        draw("ready", [category({ description: null })])
        expect(screen.getByText("Containers")).toBeInTheDocument()
        expect(screen.queryByText("Runtime basics")).not.toBeInTheDocument()
    })

    it("stands in ten independent category cards before the first answer arrives", () => {
        const { container } = draw("pending", [])
        expect(container.querySelectorAll("[data-component=SurfaceCardSurface]")).toHaveLength(10)
        expect(container.querySelector("[data-component=Text][data-loading=\"true\"]")).not.toBeNull()
    })

    it("keeps the rows it already has rather than replacing them while refreshing", () => {
        const { container } = draw("partial", [category()])
        expect(container.querySelectorAll("[data-component=SurfaceCardSurface]")).toHaveLength(1)
    })

    it("says the catalog is empty without offering an action there is none for", () => {
        draw("empty", [])
        expect(screen.getByText("No categories")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("says the catalog failed and offers the one action that can fix it", () => {
        const retry = vi.fn()
        draw("failed", [], { retry })
        expect(screen.getByText("Catalog failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("shows no notice at all once the catalog has categories to show", () => {
        draw("ready", [category()])
        expect(screen.queryByText("No categories")).not.toBeInTheDocument()
        expect(screen.queryByText("Catalog failed")).not.toBeInTheDocument()
    })

    it("stays inert rather than throwing when the owner registered no handlers", () => {
        draw("failed", [category()])
        expect(() => {
            fireEvent.click(screen.getByRole("button", { name: "Open category" }))
            fireEvent.click(screen.getByRole("button", { name: "Try again" }))
            fireEvent.change(screen.getByRole("searchbox", { name: "Search categories" }), { target: { value: "x" } })
            fireEvent.submit(screen.getByRole("search"))
        }).not.toThrow()
    })
})
