/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { EntityToken, meta } from "@/components/blocks/entity/EntityToken"

/**
 * What these tests guard: that an unroutable reference is not dressed as a link. A dead end a
 * reader only discovers by pressing it is worse than plain text, and it is exactly what a
 * component that always rendered an anchor would produce.
 */

afterEach(() => {
    cleanup()
})

describe("EntityToken", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "EntityToken" })
    })

    it("is a real address when the thing has one", () => {
        const { container } = render(<EntityToken label="starci183" href="/u/starci183" />)
        const link = container.querySelector("a")
        expect(link?.getAttribute("href")).toBe("/u/starci183")
        expect(link?.textContent).toBe("starci183")
    })

    it("is a name, and offers no press at all, when the thing has nowhere to go", () => {
        const { container } = render(<EntityToken label="starci183" />)
        expect(container.querySelector("a")).toBeNull()
        expect(container.querySelector("button")).toBeNull()
        expect(container.firstElementChild?.textContent).toBe("starci183")
    })

    it("sets an unroutable name more firmly than the sentence around it", () => {
        const { container } = render(<EntityToken label="starci183" />)
        expect(container.firstElementChild?.getAttribute("class") ?? "").toContain("weight-medium")
    })
})
