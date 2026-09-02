/** @vitest-environment jsdom */
import { afterEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { cleanup } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TextAction } from "./index.js"

afterEach(cleanup)

describe("Core TextAction", () => {
    it("uses button semantics for state-only actions", () => {
        const press = vi.fn()
        render(<TextAction appearance="disclosure" onPress={press}>See more</TextAction>)
        fireEvent.click(screen.getByRole("button", { name: "See more" }))
        expect(press).toHaveBeenCalledTimes(1)
        expect(screen.queryByRole("link")).toBeNull()
    })

    it("retains its label and blocks presses while pending", () => {
        const press = vi.fn()
        render(<TextAction isPending onPress={press}>Send again</TextAction>)
        const action = screen.getByRole("button", { name: "Send again" })
        expect((action as HTMLButtonElement).disabled).toBe(true)
        expect(action.getAttribute("aria-busy")).toBe("true")
        fireEvent.click(action)
        expect(press).not.toHaveBeenCalled()
    })
})
