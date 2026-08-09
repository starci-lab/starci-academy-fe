/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Icon, meta, type IconName, type IconSize } from "@/components/atoms/Icon"

/**
 * What these tests guard: that an icon is a MEANING rather than a picture a call site chose. The
 * failures that matter are two names resolving to the same glyph - at which point the two facts
 * they stand for have stopped being distinguishable - and a colour appearing on the glyph, which
 * is how an icon ends up disagreeing with the label beside it.
 */

/** Every meaning this atom draws, mirrored so a loop can walk the whole vocabulary. */
const NAMES: ReadonlyArray<IconName> = [
    "brand",
    "streak",
    "credit",
    "reward",
    "course",
    "email",
    "password",
    "code",
    "signedIn",
    "signIn",
    "close",
    "next",
    "retry",
    "send",
]

/** Both steps. */
const SIZES: ReadonlyArray<IconSize> = ["sm", "md"]

/** Render one meaning and hand back the drawn glyph. */
const renderIcon = (name: IconName, size?: IconSize, isEmphasised?: boolean): SVGElement => {
    const { container } = render(<Icon name={name} size={size} isEmphasised={isEmphasised} />)
    const glyph = container.querySelector("svg")
    if (!glyph) throw new Error("Icon rendered nothing")
    return glyph
}

afterEach(() => {
    cleanup()
})

describe("Icon", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Icon" })
    })

    it("draws a real glyph for every meaning it accepts", () => {
        for (const name of NAMES) {
            expect(renderIcon(name).tagName.toLowerCase(), name).toBe("svg")
            cleanup()
        }
    })

    it("gives every meaning a glyph of its own, so two facts never look alike", () => {
        const drawn = new Set<string>()
        for (const name of NAMES) {
            drawn.add(renderIcon(name).innerHTML)
            cleanup()
        }
        expect(drawn.size).toBe(NAMES.length)
    })

    it("sizes with a class rather than with the vendor's pixel prop", () => {
        for (const size of SIZES) {
            const glyph = renderIcon("streak", size)
            expect(glyph.getAttribute("class"), size).toContain("size-")
            cleanup()
        }
    })

    it("draws the two steps at different sizes", () => {
        const small = renderIcon("streak", "sm").getAttribute("class")
        cleanup()
        const medium = renderIcon("streak", "md").getAttribute("class")
        expect(small).not.toBe(medium)
    })

    it("never sets a colour of its own, so it inherits the ink of the line it sits on", () => {
        for (const name of NAMES) {
            const glyph = renderIcon(name)
            expect(glyph.getAttribute("class") ?? "", name).not.toContain("text-")
            expect(glyph.getAttribute("color"), name).toBe(null)
            expect(glyph.getAttribute("fill"), name).toBe("currentColor")
            cleanup()
        }
    })

    it("draws the solid cut only where a caller asked for emphasis", () => {
        const plain = renderIcon("streak").innerHTML
        cleanup()
        const emphasised = renderIcon("streak", "sm", true).innerHTML
        expect(emphasised).not.toBe(plain)
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as { name: IconName }
        const { container } = render(<Icon {...backDoor} name="streak" />)
        expect(container.querySelector("svg")?.getAttribute("class") ?? "").not.toContain("back-door")
    })
})
