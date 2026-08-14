import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseFoundationResourcePage } from "./component"

describe("_CourseFoundationResourcePage", () => {
    it("preserves backend-authored resource content and opens real practice", () => {
        const openPlayground = vi.fn()
        const { container } = render(
            <_CourseFoundationResourcePage
                state="ready"
                props={{
                    resource: {
                        id: "resource-1",
                        displayId: "container-runtime",
                        title: "Container runtime",
                        description: "Backend-owned description",
                        kind: "document",
                        value: "Server-authored body",
                        sortIndex: 0,
                        isRecommended: true,
                        author: null,
                        thumbnailUrl: null,
                        categoryId: "category-1",
                        tags: [],
                    },
                    titleFallback: "Foundation resource",
                    notFound: "Not found",
                    failed: "Failed",
                    retry: "Try again",
                    back: "Back",
                    openPlayground: "Practice in Playground",
                }}
                on={{ openPlayground }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Practice in Playground" }))

        expect(container.querySelector("[data-node=\"course-foundation-resource-page\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Container runtime" })).toBeInTheDocument()
        expect(screen.getByText("Server-authored body")).toBeInTheDocument()
        expect(openPlayground).toHaveBeenCalledOnce()
    })
})
