/** @vitest-environment jsdom */
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProfileRow } from "."

describe("ProfileRow", () => {
    it("keeps avatar, identity and disclosure on one navigation row", () => {
        const { container } = render(<ProfileRow props={{ displayName: "Ada", username: "ada" }} />)

        expect(container.querySelector("[data-part=\"profile-row\"]")).toHaveClass("grid", "items-center", "gap-3")
        expect(container.querySelector("[data-part=\"profile-identity\"]")).toHaveClass("flex", "flex-col", "min-w-0")
    })
})
