import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { Foundation } from "@/modules/api/graphql/queries/query-foundations"
import { _CourseFoundationCategoryPage, type CourseFoundationCategoryPageProps } from "./component"

/**
 * What these tests guard: the resource a reader picks is opened by its DISPLAY id, not its uuid -
 * the route is public and the uuid does not resolve - and the three empty-looking states are
 * told apart by their notice rather than by the absence of rows.
 */

const foundation = (overrides: Partial<Foundation> = {}): Foundation => ({
    id: "resource-1",
    displayId: "container-runtime",
    title: "Container runtime",
    description: "Backend-owned description",
    kind: "document",
    value: "Body",
    sortIndex: 0,
    isRecommended: true,
    author: null,
    thumbnailUrl: null,
    categoryId: "category-1",
    tags: [],
    ...overrides,
})

const copy = {
    title: "Foundation resources",
    search: "Search resources",
    clearSearch: "Clear search",
    empty: "No resources",
    failed: "Resources failed",
    retry: "Try again",
}

const draw = (
    state: CourseFoundationCategoryPageProps["state"],
    foundations: ReadonlyArray<Foundation>,
    on?: CourseFoundationCategoryPageProps["on"],
) => render(<_CourseFoundationCategoryPage state={state} props={{ ...copy, foundations }} on={on} />)

describe("_CourseFoundationCategoryPage", () => {
    it("keeps backend resource titles and forwards the selected display identity", () => {
        const openResource = vi.fn()
        const { container } = draw("ready", [foundation()], { openResource })

        fireEvent.click(screen.getByRole("link", { name: "Container runtime · Backend-owned description" }))

        expect(container.querySelector("[data-node=\"course-foundation-category-page\"]")).not.toBeNull()
        expect(openResource).toHaveBeenCalledWith("container-runtime")
    })

    it("names a resource the backend gave no description for by its title alone", () => {
        draw("ready", [foundation({ description: null })])
        expect(screen.getByRole("link", { name: "Container runtime" })).toBeInTheDocument()
    })

    it("reports every typed search term to the owner that queries on it", () => {
        const search = vi.fn()
        draw("ready", [foundation()], { search })
        fireEvent.change(screen.getByRole("searchbox", { name: "Search resources" }), { target: { value: "runtime" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(search).toHaveBeenCalledWith("runtime")
    })

    // NOTE: the page stands in six placeholder rows here, but `NavLink` ignores `isLoading`
    // entirely, so they currently render as live blank links rather than skeletons. That is a
    // defect in the leaf, reported separately - these tests assert only what is observably true.
    it("stands in six placeholder resource rows before the first answer arrives", () => {
        const { container } = draw("pending", [])
        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(6)
    })

    it("keeps the rows it already has rather than replacing them while refreshing", () => {
        const { container } = draw("pending", [foundation()])
        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(1)
    })

    it("says the category is empty without offering an action there is none for", () => {
        draw("empty", [])
        expect(screen.getByText("No resources")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("says the query failed and offers the one action that can fix it", () => {
        const retry = vi.fn()
        draw("failed", [], { retry })
        expect(screen.getByText("Resources failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("shows no notice at all once the category has resources to show", () => {
        draw("ready", [foundation()])
        expect(screen.queryByText("No resources")).not.toBeInTheDocument()
        expect(screen.queryByText("Resources failed")).not.toBeInTheDocument()
    })

    it("stays inert rather than throwing when the owner registered no handlers", () => {
        draw("failed", [foundation()])
        expect(() => {
            fireEvent.click(screen.getByRole("link", { name: "Container runtime · Backend-owned description" }))
            fireEvent.click(screen.getByRole("button", { name: "Try again" }))
            fireEvent.change(screen.getByRole("searchbox", { name: "Search resources" }), { target: { value: "x" } })
            fireEvent.submit(screen.getByRole("search"))
        }).not.toThrow()
    })
})
