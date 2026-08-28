/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { Checkbox } from "."

afterEach(cleanup)

describe("Checkbox", () => {
    it("renders the HeroUI control and indicator and reports the new value", () => {
        const change = vi.fn()
        const { container } = render(
            <Checkbox props={{ label: "Remember me", isSelected: false }} on={{ change }} />,
        )

        const root = screen.getByRole("checkbox", { name: "Remember me" })
        expect(root).toBeTruthy()
        const control = container.querySelector<HTMLElement>("[data-slot='checkbox-control']")
        expect(control).toBeTruthy()
        expect(control?.className).not.toContain("bg-default")
        expect(control?.className).not.toContain("bg-white")
        expect(container.querySelector("[data-slot^='checkbox-default-indicator']")).toBeTruthy()
        const content = container.querySelector<HTMLElement>("[data-slot='checkbox-content']")
        if (content === null) throw new Error("checkbox content is missing")
        expect(content.contains(container.querySelector("[data-slot='checkbox-control']"))).toBe(true)
        fireEvent.click(screen.getByRole("checkbox", { name: "Remember me" }))
        expect(change).toHaveBeenCalledWith(true)
    })

    it("keeps real legal destinations as isolated anchors inside the clickable label sentence", () => {
        const follow = vi.fn()
        const change = vi.fn()
        render(
            <Checkbox
                props={{
                    label: "I agree to the terms and privacy policy",
                    isSelected: false,
                    labelParts: [
                        { kind: "text", content: "I agree to the " },
                        {
                            kind: "link",
                            id: "terms",
                            label: "Terms",
                            href: "https://academy.starci.org/en/terms",
                            target: "_blank",
                            rel: "noopener noreferrer",
                        },
                        { kind: "text", content: " and " },
                        { kind: "link", id: "privacy", label: "Privacy Policy" },
                    ],
                }}
                on={{ follow, change }}
            />,
        )

        const terms = screen.getByRole("link", { name: "Terms" })
        expect(terms).toHaveAttribute("href", "https://academy.starci.org/en/terms")
        expect(terms).toHaveAttribute("target", "_blank")
        expect(terms).toHaveAttribute("rel", "noopener noreferrer")
        expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBeNull()
        fireEvent.click(terms)
        expect(follow).not.toHaveBeenCalled()
        expect(change).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole("link", { name: "Privacy Policy" }))
        expect(follow).toHaveBeenCalledWith("privacy")
    })
})
