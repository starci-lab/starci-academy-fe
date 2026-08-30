import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StarCiAiTeacher } from "."

describe("StarCiAiTeacher", () => {
    it("renders the AI teacher inside one circular avatar", () => {
        const view = render(<StarCiAiTeacher props={{ size: "md", isOnline: true }} />)
        const teacher = view.container.querySelector("[data-slot=\"starci-ai-teacher\"]")

        expect(teacher).toHaveClass("rounded-full", "size-11")
        expect(teacher?.querySelector("img")?.getAttribute("src")).toContain("starci-ai-teacher-v1.png")
        expect(teacher?.querySelector("[aria-hidden=\"true\"]")).toBeInTheDocument()
    })

    it("preserves circular geometry while loading", () => {
        const view = render(<StarCiAiTeacher props={{ size: "sm" }} isLoading />)
        const teacher = view.container.querySelector("[data-slot=\"starci-ai-teacher\"]")

        expect(teacher).toHaveAttribute("data-loading", "true")
        expect(teacher).toHaveClass("rounded-full", "size-8", "animate-pulse")
        expect(teacher?.querySelector("img")).toBeNull()
    })
})
