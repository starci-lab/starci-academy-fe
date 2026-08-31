/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { EmptyNotice } from "."

afterEach(cleanup)

describe("EmptyNotice", () => {
    it("keeps action buttons text-only even when a legacy caller requests a named icon", () => {
        const { rerender } = render(<EmptyNotice props={{ message: "No results", actionLabel: "Browse" }} />)

        expect(screen.getByRole("button", { name: "Browse" }).querySelector("svg")).toBeNull()

        rerender(<EmptyNotice props={{ message: "Could not load", actionLabel: "Retry", actionIcon: "retry" }} />)

        expect(screen.getByRole("button", { name: "Retry" }).querySelector("svg")).toBeNull()
    })
})
