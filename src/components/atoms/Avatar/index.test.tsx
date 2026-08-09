/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Avatar, meta, type AvatarProps, type AvatarSize } from "@/components/atoms/Avatar"

/**
 * What these tests are really guarding: that there is no code path producing an anonymous circle.
 * The picture is optional and the name is not, so every branch has to end in something a reader
 * can identify - initials on screen, or the same name as alternative text on the image. A grey
 * circle with neither is the bug this shape exists to make unreachable.
 */

/** Fractional Tailwind spacing (gap-1.5, p-2.5) is off the house scale. */
const FRACTIONAL_SPACING = /\b[a-z-]+-\d+\.5\b/

/** An arbitrary Tailwind value escapes the token system entirely. */
const ARBITRARY_VALUE = /-\[[^\]]+\]/

/** The whole size vocabulary, mirrored so a loop can walk it. */
const SIZES: ReadonlyArray<AvatarSize> = ["sm", "md", "lg"]

/** A data URI, so the test never reaches the network for a picture. */
const PICTURE = "data:image/gif;base64,R0lGODlhAQABAAAAACw="

/** Render with the given props and hand back the root element. */
const renderAvatar = (props: Partial<AvatarProps> = {}): Element => {
    const merged: AvatarProps = { name: "Ada Lovelace", ...props }
    const { container } = render(<Avatar {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("Avatar rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Avatar", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Avatar" })
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderAvatar({ size: "lg" })
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Avatar")
        expect(root.getAttribute("data-size")).toBe("lg")
        expect(root.getAttribute("data-loading")).toBe("false")
    })

    it("falls back to initials when there is no picture", () => {
        const root = renderAvatar()
        expect(root.querySelector("img")).toBe(null)
        expect(root.textContent).toBe("AL")
    })

    it("takes at most two initials, because a third stops being legible in the circle", () => {
        expect(renderAvatar({ name: "stacy" }).textContent).toBe("s")
        cleanup()
        expect(renderAvatar({ name: "Ada King Lovelace" }).textContent).toBe("AK")
        cleanup()
        expect(renderAvatar({ name: "  Ada   Lovelace  " }).textContent).toBe("AL")
    })

    it("shows the initials until the picture has actually loaded, never an anonymous circle", () => {
        // The vendor swaps the image in only once it has LOADED, which is the behaviour worth
        // wrapping: a broken or slow URL degrades to initials rather than to a torn icon.
        // Nothing loads in a test environment, so this IS that path - and it still identifies.
        expect(renderAvatar({ src: PICTURE }).textContent).toBe("AL")
    })

    it("treats an empty picture the same as no picture at all", () => {
        const root = renderAvatar({ src: "" })
        expect(root.querySelector("img")).toBe(null)
        expect(root.textContent).toBe("AL")
    })

    it("rests without a picture, at the same diameter, so nothing beside it moves", () => {
        const resting = renderAvatar({ src: PICTURE, size: "md", isLoading: true })
        expect(resting.querySelector("img")).toBe(null)
        expect(resting.textContent).toBe("")
        expect(resting.getAttribute("data-loading")).toBe("true")
        expect(resting.getAttribute("aria-hidden")).toBe("true")
        expect(resting.getAttribute("class")).toContain("skeleton")
        const restingClasses = resting.getAttribute("class") ?? ""
        cleanup()
        const loadedClasses = renderAvatar({ size: "md" }).getAttribute("class") ?? ""
        for (const token of loadedClasses.split(/\s+/).filter((cls) => cls.endsWith("--md"))) {
            expect(restingClasses, token).toContain(token)
        }
    })

    it("draws every size differently", () => {
        const drawn = new Set<string>()
        for (const size of SIZES) {
            drawn.add(renderAvatar({ size }).getAttribute("class") ?? "")
            cleanup()
        }
        expect(drawn.size).toBe(SIZES.length)
    })

    it("keeps every class it draws on the house scale", () => {
        for (const size of SIZES) {
            for (const isLoading of [false, true]) {
                const classes = renderAvatar({ size, isLoading }).getAttribute("class") ?? ""
                const label = `${size}/${isLoading}`
                expect(classes.trim(), label).not.toBe("")
                expect(FRACTIONAL_SPACING.test(classes), label).toBe(false)
                expect(ARBITRARY_VALUE.test(classes), label).toBe(false)
                cleanup()
            }
        }
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const size of SIZES) {
            const classes = renderAvatar({ size }).getAttribute("class") ?? ""
            for (const token of classes.split(/\s+/)) {
                expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
            }
            cleanup()
        }
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as AvatarProps
        const { container } = render(<Avatar {...backDoor} name="Ada Lovelace" />)
        const root = container.firstElementChild
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
