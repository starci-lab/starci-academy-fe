import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseFoundationsPage } from "./component"

describe("_CourseFoundationsPage", () => {
    it("renders the canonical catalog and forwards live category actions", () => {
        const openCategory = vi.fn()
        const search = vi.fn()
        const { container } = render(
            <_CourseFoundationsPage
                state="ready"
                props={{
                    title: "Foundations",
                    description: "Durable concepts",
                    empty: "No categories",
                    failed: "Catalog failed",
                    retry: "Try again",
                    search: "Search categories",
                    clearSearch: "Clear search",
                    categories: [{
                        id: "category-1",
                        displayId: "foundations",
                        slug: "foundations",
                        title: "Containers",
                        description: "Runtime basics",
                        thumbnailUrl: null,
                        orderIndex: 0,
                        sortIndex: 0,
                    }],
                }}
                on={{ openCategory, search }}
            />,
        )

        fireEvent.click(screen.getByRole("link", { name: "Containers · Runtime basics" }))
        fireEvent.change(screen.getByRole("searchbox", { name: "Search categories" }), { target: { value: "container" } })
        fireEvent.submit(screen.getByRole("search"))

        expect(container.querySelector("[data-node=\"course-foundations-page\"]")).not.toBeNull()
        expect(openCategory).toHaveBeenCalledWith("category-1")
        expect(search).toHaveBeenCalledWith("container")
    })
})
