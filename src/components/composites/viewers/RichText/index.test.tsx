/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { RichText, meta, type RichTextBlock } from "@/components/composites/viewers/RichText"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that every line of prose is a component this tree can see. The original
 * renders markdown, which produces raw tags no registry key describes and no atom owns; here the
 * content arrives already parsed and each block is drawn by the atom that owns that kind of text.
 * The test that matters is therefore the boring one - a heading block is a REAL heading, so a
 * long passage stays navigable rather than being a wall of paragraphs with big text in it.
 */

const blocks: ReadonlyArray<RichTextBlock> = [
    { kind: "heading", text: "What you will learn", level: 3 },
    { kind: "paragraph", text: "The shape of a distributed system." },
    { kind: "paragraph", text: "How to argue about trade-offs." },
]

/** Render the passage and hand back its root. */
const renderPassage = (isLoading?: boolean): Element => {
    const { container } = render(<RichText blocks={blocks} isLoading={isLoading} />)
    const root = container.firstElementChild
    if (!root) throw new Error("RichText rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("RichText", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "RichText" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderPassage()
        expect(root.getAttribute("data-node")).toBe("stack")
        expect(root.getAttribute("class")).toBe(contractSpec("stack").classes)
    })

    it("renders one block per block, in reading order", () => {
        const root = renderPassage()
        expect(root.children.length).toBe(blocks.length)
        expect([...root.children].map((node) => node.textContent)).toEqual([
            "What you will learn",
            "The shape of a distributed system.",
            "How to argue about trade-offs.",
        ])
    })

    it("draws a heading block as a REAL heading, at the level the caller named", () => {
        expect(renderPassage().querySelector("h3")?.textContent).toBe("What you will learn")
    })

    it("draws prose through the text atom rather than as raw markup", () => {
        const paragraphs = [...renderPassage().querySelectorAll("[data-component='Text']")]
        expect(paragraphs.length).toBe(2)
        expect(paragraphs.every((node) => node.tagName === "P")).toBe(true)
    })

    it("rests the whole passage, because it arrives as one payload", () => {
        const resting = [...renderPassage(true).children].map((node) => node.getAttribute("data-loading"))
        expect(resting).toEqual(["true", "true", "true"])
    })

    it("draws nothing at all for an empty passage rather than an empty box", () => {
        const { container } = render(<RichText blocks={[]} />)
        expect(container.firstElementChild?.children.length).toBe(0)
    })
})
