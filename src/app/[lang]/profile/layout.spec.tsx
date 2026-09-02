import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ProfileLayout from "./layout"

vi.mock("@/components/product-shells/ShellNav", () => ({ ShellNav: () => <nav aria-label="Global" /> }))

describe("ProfileLayout", () => {
    it("owns the single document main landmark for every nested Profile state", () => {
        const { container } = render(<ProfileLayout><section>Profile state</section></ProfileLayout>)

        expect(container.querySelectorAll("main")).toHaveLength(1)
        expect(screen.getByText("Profile state")).toBeTruthy()
    })
})
