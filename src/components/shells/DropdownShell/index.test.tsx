import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DropdownShell } from "./index"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

afterEach(cleanup)

describe("DropdownShell", () => {
    it("keeps a static header outside menu options", async () => {
        render(
            <DropdownShell
                props={{ label: "Account", sections: [{ items: [{ id: "profile", label: "Profile" }] }] }}
                trigger={<span>Avatar</span>}
                header={<span data-testid="static-header" />}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        const header = await screen.findByTestId("static-header")
        expect(header.closest("[role=menuitem]")).toBeNull()
        expect(screen.getByRole("menuitem", { name: "Profile" })).toBeTruthy()
    })

    it("owns controlled selection, indicators and danger item treatment", async () => {
        const action = vi.fn()
        render(
            <DropdownShell
                props={{
                    label: "Choices",
                    selectionMode: "single",
                    selectedId: "vi",
                    sections: [{ items: [
                        { id: "vi", label: "Vietnamese", showsIndicator: true },
                        { id: "sign-out", label: "Sign out", tone: "danger" },
                    ] }],
                }}
                on={{ action }}
                trigger={<span>Open</span>}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Choices" }))
        const selected = await screen.findByRole("menuitemradio", { name: "Vietnamese" })
        expect(selected).toHaveAttribute("aria-checked", "true")
        const danger = screen.getByRole("menuitemradio", { name: "Sign out" })
        expect(danger).toHaveClass("text-danger-soft-foreground")
        fireEvent.click(danger)
        expect(action).toHaveBeenCalledWith("sign-out")
    })
})
