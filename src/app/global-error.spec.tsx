import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react"
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest"
import GlobalError from "./global-error"

const {
    captureException,
} = vi.hoisted(() => ({
    captureException: vi.fn(),
}))

vi.mock("@sentry/nextjs", () => ({
    captureException,
}))

describe("GlobalError", () => {
    beforeEach(() => {
        captureException.mockClear()
    })

    it("captures the fatal error and keeps retry available", async () => {
        const error = new Error("controlled failure")
        const reset = vi.fn()

        render(<GlobalError error={error} reset={reset} />)

        await waitFor(() => expect(captureException).toHaveBeenCalledWith(error))
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(reset).toHaveBeenCalledOnce()
    })
})
