import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseFoundationCategoryPage } from "./component"

describe("_CourseFoundationCategoryPage", () => {
    it("keeps backend resource titles and forwards the selected display identity", () => {
        const openResource = vi.fn()
        const { container } = render(
            <_CourseFoundationCategoryPage
                state="ready"
                props={{
                    title: "Foundation resources",
                    search: "Search resources",
                    clearSearch: "Clear search",
                    empty: "No resources",
                    failed: "Resources failed",
                    retry: "Try again",
                    foundations: [{
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
                    }],
                }}
                on={{ openResource }}
            />,
        )

        fireEvent.click(screen.getByRole("link", { name: "Container runtime · Backend-owned description" }))

        expect(container.querySelector("[data-node=\"course-foundation-category-page\"]")).not.toBeNull()
        expect(openResource).toHaveBeenCalledWith("container-runtime")
    })
})
