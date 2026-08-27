import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CoursePlaygroundCatalogBase } from "@/components/blocks/learn/CoursePlaygroundCatalog/component"

describe("CoursePlaygroundCatalogBase", () => {
    it("renders the backend catalog through its canonical page", () => {
        const openSetup = vi.fn()
        render(
            <CoursePlaygroundCatalogBase
                state="ready"
                props={{
                    title: "Playground",
                    description: "Server-verified labs",
                    stepLabel: "guided steps",
                    emptyText: "No playgrounds",
                    failedText: "Catalog failed",
                    retryLabel: "Try again",
                    playgrounds: [{ id: "playground-1", slug: "docker", title: "Docker lab", icon: null, stepCount: 3 }],
                }}
                on={{ openSetup, retry: vi.fn() }}
            />,
        )

        fireEvent.click(screen.getByRole("link", { name: "Docker lab" }))

        expect(screen.getByRole("heading", { name: "Playground" })).toBeInTheDocument()
        expect(screen.getByText("3 guided steps")).toBeInTheDocument()
        expect(openSetup).toHaveBeenCalledWith("docker")
    })
})
