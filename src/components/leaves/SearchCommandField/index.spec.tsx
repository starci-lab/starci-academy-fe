/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SearchCommandField } from "."

afterEach(cleanup)

describe("SearchCommandField", () => {
    it("is controlled, autofocuses and reports edits", () => {
        const change = vi.fn()
        render(<SearchCommandField props={{ id: "search", value: "sys", label: "Search", placeholder: "Find", clearLabel: "Clear" }} on={{ change }} />)
        const field = screen.getByRole("combobox", { name: "Search" }) as HTMLInputElement
        expect(field.value).toBe("sys")
        expect(document.activeElement).toBe(field)
        fireEvent.change(field, { target: { value: "system" } })
        expect(change).toHaveBeenCalledWith("system")
    })

    it("translates arrows, Enter and clear into named outcomes", () => {
        const previous = vi.fn()
        const next = vi.fn()
        const submit = vi.fn()
        const clear = vi.fn()
        render(<SearchCommandField props={{ id: "search", value: "sys", label: "Search", placeholder: "Find", clearLabel: "Clear" }} on={{ previous, next, submit, clear }} />)
        const field = screen.getByRole("combobox", { name: "Search" })
        fireEvent.keyDown(field, { key: "ArrowUp" })
        fireEvent.keyDown(field, { key: "ArrowDown" })
        fireEvent.keyDown(field, { key: "Enter" })
        fireEvent.click(screen.getByRole("button", { name: "Clear" }))
        expect(previous).toHaveBeenCalledOnce()
        expect(next).toHaveBeenCalledOnce()
        expect(submit).toHaveBeenCalledOnce()
        expect(clear).toHaveBeenCalledOnce()
    })
})
