/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { InfoTooltip, meta } from "@/components/blocks/feedback/InfoTooltip"

/**
 * What these tests guard: that the term is still READ as the term - the sentence must survive
 * with the explanation undiscovered - and that the meaning is carried by the element rather
 * than by a hover state this tree cannot yet draw.
 */

afterEach(() => {
    cleanup()
})

describe("InfoTooltip", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "InfoTooltip" })
    })

    it("keeps the hard word in the sentence, and hangs the meaning off it", () => {
        const { container } = render(
            <InfoTooltip term="Streak" explanation="Days in a row with at least one lesson read." />,
        )
        const term = container.querySelector("abbr")
        expect(term?.textContent).toBe("Streak")
        expect(term?.getAttribute("title")).toBe("Days in a row with at least one lesson read.")
    })
})
