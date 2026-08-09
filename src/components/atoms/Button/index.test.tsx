/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { Button, meta, type ButtonProps, type ButtonSize, type ButtonVariant } from "@/components/atoms/Button"

/**
 * What these tests are really guarding: that the press target is honest. A button that submits a
 * form nobody asked it to, or that still fires while the surface is resting, is worse than one
 * that looks wrong - the visual mistake is noticed on the first screenshot, the behavioural one is
 * noticed after it has already sent something.
 */

/** Fractional Tailwind spacing (gap-1.5, p-2.5) is off the house scale. */
const FRACTIONAL_SPACING = /\b[a-z-]+-\d+\.5\b/

/** An arbitrary Tailwind value escapes the token system entirely. */
const ARBITRARY_VALUE = /\[[^\]]+\]/

/** The whole variant vocabulary, mirrored so a loop can walk it. */
const VARIANTS: ReadonlyArray<ButtonVariant> = ["primary", "secondary", "ghost"]

/** The whole size vocabulary, mirrored so a loop can walk it. */
const SIZES: ReadonlyArray<ButtonSize> = ["sm", "md"]

/** Render with the given props and hand back the rendered control. */
const renderButton = (props: Partial<ButtonProps> = {}): HTMLButtonElement => {
    const { container } = render(<Button {...props}>Enrol now</Button>)
    const root = container.firstElementChild
    if (!(root instanceof HTMLButtonElement)) throw new Error("Button did not render a button element")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Button", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Button" })
    })

    it("renders a real button element", () => {
        expect(renderButton().tagName).toBe("BUTTON")
    })

    it("refuses to submit unless it was asked to", () => {
        expect(renderButton().getAttribute("type")).toBe("button")
        expect(renderButton({ type: "submit" }).getAttribute("type")).toBe("submit")
    })

    it("defaults to the quiet variant, so a surface has to name its one main action", () => {
        expect(renderButton().getAttribute("data-variant")).toBe("secondary")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderButton({ variant: "primary", size: "sm" })
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Button")
        expect(root.getAttribute("data-variant")).toBe("primary")
        expect(root.getAttribute("data-size")).toBe("sm")
        expect(root.getAttribute("data-loading")).toBe("false")
    })

    it("renders the resolved label it was handed", () => {
        expect(renderButton().textContent).toBe("Enrol now")
    })

    it("calls back when it is pressed", () => {
        const onClick = vi.fn()
        fireEvent.click(renderButton({ onClick }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("stays silent while it is disabled", () => {
        const onClick = vi.fn()
        const root = renderButton({ onClick, disabled: true })
        expect(root.disabled).toBe(true)
        fireEvent.click(root)
        expect(onClick).not.toHaveBeenCalled()
    })

    it("refuses the press while it is resting, not just visually", () => {
        const onClick = vi.fn()
        const root = renderButton({ onClick, isLoading: true })
        expect(root.disabled).toBe(true)
        expect(root.getAttribute("data-loading")).toBe("true")
        expect(root.getAttribute("class")).toContain("animate-pulse")
        fireEvent.click(root)
        expect(onClick).not.toHaveBeenCalled()
    })

    it("keeps its own height and inset while resting, so the row does not reflow", () => {
        const resting = renderButton({ size: "md", isLoading: true }).getAttribute("class") ?? ""
        cleanup()
        const loaded = renderButton({ size: "md" }).getAttribute("class") ?? ""
        for (const token of loaded.split(/\s+/).filter((cls) => /^(?:h-|px-)/.test(cls))) {
            expect(resting, token).toContain(token)
        }
    })

    it("actually draws the three variants differently", () => {
        const drawn = new Set<string>()
        for (const variant of VARIANTS) {
            drawn.add(renderButton({ variant }).getAttribute("class") ?? "")
            cleanup()
        }
        expect(drawn.size).toBe(VARIANTS.length)
    })

    it("keeps every class it draws on the house scale", () => {
        for (const variant of VARIANTS) {
            for (const size of SIZES) {
                for (const isLoading of [false, true]) {
                    const classes = renderButton({ variant, size, isLoading }).getAttribute("class") ?? ""
                    const label = `${variant}/${size}/${isLoading}`
                    expect(classes.trim(), label).not.toBe("")
                    expect(FRACTIONAL_SPACING.test(classes), label).toBe(false)
                    expect(ARBITRARY_VALUE.test(classes), label).toBe(false)
                    cleanup()
                }
            }
        }
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const variant of VARIANTS) {
            const classes = renderButton({ variant }).getAttribute("class") ?? ""
            for (const token of classes.split(/\s+/)) {
                expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
            }
            cleanup()
        }
    })

    it("keeps a visible focus ring, so the keyboard can see where it is", () => {
        expect(renderButton().getAttribute("class")).toContain("focus-visible:outline-2")
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as ButtonProps
        const { container } = render(<Button {...backDoor}>Enrol now</Button>)
        const root = container.firstElementChild
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
