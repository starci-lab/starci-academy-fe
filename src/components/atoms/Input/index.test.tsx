/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { Input, meta, type InputKind, type InputProps } from "@/components/atoms/Input"

/**
 * What these tests guard: that the KIND of a field decides everything the browser needs to know
 * about it. A code field that lost `one-time-code` stops offering the code a phone just
 * received; a code field that lost `numeric` gives a thumb a full keyboard. Both are invisible
 * on a desktop and immediately obvious to the reader they were built for.
 *
 * The second thing is that the value is UNCONTROLLED. The registry frame mounts a slot as a
 * component, so a slot may be remounted whenever the surface re-renders; `defaultValue` plus an
 * `onChange` the caller mirrors is what stops a failed attempt emptying the form.
 */

/** Every kind, mirrored so a loop can walk the whole vocabulary. */
const KINDS: ReadonlyArray<InputKind> = ["email", "password", "text", "code"]

/** Render with the given props and hand back the control. */
const renderInput = (props: Partial<InputProps> = {}): HTMLInputElement => {
    const merged: InputProps = { id: "field", name: "field", ...props }
    const { container } = render(<Input {...merged} />)
    const root = container.querySelector("input")
    if (!root) throw new Error("Input did not render an input element")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Input", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Input" })
    })

    it("renders a real input carrying the id its label points at", () => {
        const root = renderInput({ id: "sign-in-email" })
        expect(root.tagName).toBe("INPUT")
        expect(root.getAttribute("id")).toBe("sign-in-email")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderInput({ kind: "code" })
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Input")
        expect(root.getAttribute("data-kind")).toBe("code")
        expect(root.getAttribute("data-loading")).toBe("false")
    })

    it("tells the browser what kind of value it takes, for every kind", () => {
        const spellings = KINDS.map((kind) => {
            const root = renderInput({ kind })
            const spelling = [
                root.getAttribute("type"),
                root.getAttribute("autocomplete"),
                root.getAttribute("inputmode"),
            ].join("/")
            cleanup()
            return spelling
        })
        expect(spellings).toEqual([
            "email/email/email",
            "password/current-password/text",
            "text/off/text",
            "text/one-time-code/numeric",
        ])
    })

    it("opens with the value it was handed, so a remount restores what was typed", () => {
        expect(renderInput({ defaultValue: "learner@example.com" }).value).toBe("learner@example.com")
    })

    it("hands every keystroke back, so the caller can mirror it somewhere that survives", () => {
        const onChange = vi.fn()
        const root = renderInput({ onChange })
        fireEvent.change(root, { target: { value: "typed" } })
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it("refuses typing while it is disabled, and while it rests", () => {
        expect(renderInput({ disabled: true }).disabled).toBe(true)
        cleanup()
        expect(renderInput({ isLoading: true }).disabled).toBe(true)
    })

    it("says when the last attempt refused what is in it", () => {
        expect(renderInput({ isInvalid: true }).getAttribute("aria-invalid")).toBe("true")
        cleanup()
        expect(renderInput().getAttribute("aria-invalid")).toBe(null)
    })

    it("rests as the same box rather than as a second shape", () => {
        const root = renderInput({ isLoading: true })
        expect(root.getAttribute("data-loading")).toBe("true")
        expect(root.getAttribute("class")).toContain("skeleton")
    })

    it("spells no copy of its own, because copy is data", () => {
        expect(renderInput().getAttribute("placeholder")).toBe(null)
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as InputProps
        const { container } = render(<Input {...backDoor} id="field" name="field" />)
        const root = container.querySelector("input")
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
