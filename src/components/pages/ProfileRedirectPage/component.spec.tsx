import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileRedirectPageBase } from "./component"

describe("ProfileRedirectPageBase", () => {
    it("keeps the Profile entry observable while resolving", () => {
        const { container } = render(<ProfileRedirectPageBase state="pending" retryPending={false} on={{ retry: vi.fn() }} />)
        expect(container.querySelector("[role='status']")).toHaveAttribute("aria-busy", "true")
    })

    it("offers retry when the self-profile handoff fails", () => {
        const retry = vi.fn()
        render(<ProfileRedirectPageBase state="error" retryPending={false} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
