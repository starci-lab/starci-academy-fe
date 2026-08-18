import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { FoundationCategory } from "@/modules/api/graphql/queries/query-foundation-categories"
import { _CourseFoundationsPage, type CourseFoundationsPageProps } from "./component"

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
}

const draw = (
    state: CourseFoundationsPageProps["state"],
    categories: ReadonlyArray<FoundationCategory>,
    on?: CourseFoundationsPageProps["on"],
) => render(<_CourseFoundationsPage state={state} props={{ ...copy, categories }} on={on} />)

describe("_CourseFoundationsPage", () => {
    it("renders the canonical catalog and forwards live category actions", () => {
        const openCategory = vi.fn()
        const search = vi.fn()
        const { container } = draw("ready", [category()], { openCategory, search })

        fireEvent.click(screen.getByRole("link", { name: "Containers · Runtime basics" }))
        fireEvent.change(screen.getByRole("searchbox", { name: "Search categories" }), { target: { value: "container" } })
        fireEvent.submit(screen.getByRole("search"))

        expect(container.querySelector("[data-node=\"course-foundations-page\"]")).not.toBeNull()
        expect(openCategory).toHaveBeenCalledWith("category-1")
        expect(search).toHaveBeenCalledWith("container")
    })

    it("names a category the backend gave no description for by its title alone", () => {
        draw("ready", [category({ description: null })])
        expect(screen.getByRole("link", { name: "Containers" })).toBeInTheDocument()
    })

    // NOTE: the page stands in four placeholder rows here, but `NavLink` ignores `isLoading`
    // entirely, so they currently render as live blank links rather than skeletons. That is a
    // defect in the leaf, reported separately - these tests assert only what is observably true.
    it("stands in four placeholder category rows before the first answer arrives", () => {
        const { container } = draw("pending", [])
        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(4)
        expect(screen.queryByText("Durable concepts")).not.toBeInTheDocument()
    })

    it("keeps the rows it already has rather than replacing them while refreshing", () => {
        const { container } = draw("pending", [category()])
        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(1)
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
            fireEvent.click(screen.getByRole("link", { name: "Containers · Runtime basics" }))
            fireEvent.click(screen.getByRole("button", { name: "Try again" }))
            fireEvent.change(screen.getByRole("searchbox", { name: "Search categories" }), { target: { value: "x" } })
            fireEvent.submit(screen.getByRole("search"))
        }).not.toThrow()
    })
})
