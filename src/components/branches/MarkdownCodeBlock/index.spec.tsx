import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MarkdownCodeBlock } from "./index"

const highlight = vi.hoisted(() => vi.fn(async () => (
    "<pre class=\"shiki\"><code><span style=\"color:red\">const</span> answer = 42</code></pre>"
)))

vi.mock("shiki", () => ({ codeToHtml: highlight }))

describe("MarkdownCodeBlock", () => {
    beforeEach(() => {
        highlight.mockClear()
        Object.defineProperty(globalThis, "IntersectionObserver", {
            configurable: true,
            value: class {
                private readonly callback: IntersectionObserverCallback
                observe() {
                    this.callback([{ isIntersecting: true }] as Array<IntersectionObserverEntry>, this as unknown as IntersectionObserver)
                }
                disconnect() { /* no retained observer */ }
                constructor(callback: IntersectionObserverCallback) {
                    this.callback = callback
                }
            },
        })
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText: vi.fn(async () => undefined) },
        })
    })

    it("keeps raw code visible, then replaces it with lazy Shiki output", async () => {
        const { container } = render(<MarkdownCodeBlock props={{ code: "const answer = 42", language: "ts" }} />)
        expect(container.querySelector("code")?.textContent).toContain("const answer = 42")
        await act(async () => undefined)
        await waitFor(() => expect(container.querySelector("pre.shiki span[style]")).not.toBeNull())
        expect(highlight).toHaveBeenCalledWith("const answer = 42", expect.objectContaining({ lang: "ts" }))
    })

    it("copies the exact authored code", () => {
        render(<MarkdownCodeBlock props={{ code: "npm run dev", language: "bash", copyLabel: "Copy" }} />)
        fireEvent.click(screen.getByRole("button", { name: "Copy" }))
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("npm run dev")
    })
})
