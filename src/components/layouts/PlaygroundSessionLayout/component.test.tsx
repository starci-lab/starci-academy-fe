import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PlaygroundSessionLayoutBase } from "./component"

const Surface = () => <p>Routed playground surface</p>

describe("PlaygroundSessionLayoutBase", () => {
    it("keeps the routed surface inside the persistent canonical frame", () => {
        const { container } = render(
            <PlaygroundSessionLayoutBase state="ready" surface={<Surface />} failedLabel="Failed" retryLabel="Try again" />,
        )

        expect(container.querySelector("[data-node=\"playground-session-frame\"]")).not.toBeNull()
        expect(screen.getByText("Routed playground surface")).toBeInTheDocument()
    })

    it("replaces the surface with a retryable failure notice", () => {
        const onRetry = vi.fn()
        render(
            <PlaygroundSessionLayoutBase
                state="failed"
                surface={<Surface />}
                failedLabel="Playground failed"
                retryLabel="Try again"
                onRetry={onRetry}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Try again" }))

        expect(screen.queryByText("Routed playground surface")).not.toBeInTheDocument()
        expect(onRetry).toHaveBeenCalledOnce()
    })
})
