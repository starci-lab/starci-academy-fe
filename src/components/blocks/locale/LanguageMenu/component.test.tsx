import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { _LanguageMenu } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

afterEach(cleanup)

describe("_LanguageMenu", () => {
    it("renders one controlled active locale and reports the selected option", async () => {
        const select = vi.fn()
        render(
            <_LanguageMenu
                props={{
                    label: "Language",
                    selectedLocale: "vi",
                    options: [
                        { id: "en", label: "English" },
                        { id: "vi", label: "Tiếng Việt" },
                    ],
                }}
                on={{ select }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Language" }))
        const english = await screen.findByRole("menuitemradio", { name: "English" })
        const vietnamese = screen.getByRole("menuitemradio", { name: "Tiếng Việt" })
        expect(english).toHaveAttribute("aria-checked", "false")
        expect(vietnamese).toHaveAttribute("aria-checked", "true")

        fireEvent.click(english)
        expect(select).toHaveBeenCalledWith("en")
    })
})
