import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CoursePlaygroundCatalogBase } from "@/components/blocks/learn/CoursePlaygroundCatalog/component"

const copy = {
    title: "DevOps Playground",
    description: "Server-verified labs",
    eyebrow: "Learn by building",
    verifiedLabel: "Server-verified",
    previewAlt: "DevOps lab preview",
    previewImageUrl: "https://cdn.example.com/playground.png",
    startLabel: "Start the first lab",
    labsTitle: "Build the production path",
    labsDescription: "Choose a guided lab",
    labCountLabel: "guided labs",
    labLabel: "Lab",
    stepLabel: "guided steps",
    openLabel: "Open lab",
    emptyText: "No playgrounds",
    failedText: "Catalog failed",
    retryLabel: "Try again",
} as const

describe("CoursePlaygroundCatalogBase", () => {
    it("renders the backend catalog through its canonical page", () => {
        const openSetup = vi.fn()
        render(
            <CoursePlaygroundCatalogBase
                state="ready"
                props={{
                    ...copy,
                    playgrounds: [{ id: "playground-1", slug: "docker", title: "Docker lab", icon: null, stepCount: 3 }],
                }}
                on={{ openSetup, retry: vi.fn() }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Open lab" }))

        expect(screen.getByRole("heading", { name: "DevOps Playground" })).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "DevOps lab preview" })).toHaveAttribute("src", "https://cdn.example.com/playground.png")
        expect(screen.getByText("3 guided steps")).toBeInTheDocument()
        expect(openSetup).toHaveBeenCalledWith("docker")
    })

    it("keeps pending placeholders out of sequential navigation", () => {
        render(
            <CoursePlaygroundCatalogBase
                state="pending"
                props={{
                    ...copy,
                    playgrounds: [],
                }}
                on={{ openSetup: vi.fn(), retry: vi.fn() }}
            />,
        )

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })
})
