/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    _AuthenticationPage,
    type AuthenticationPageLabels,
} from "@/components/pages/AuthenticationPage/component"
import { treeSpec } from "@/components/classNames"

/**
 * What these tests guard: that the page is a heading and a seam, and nothing else. A card
 * around the form would be a border drawn twice - the screen is already the boundary - and a
 * second title would leave a reader working out which of the two names the thing in front of
 * them.
 */

const labels: AuthenticationPageLabels = { title: "Sign in" }

/** A stand-in for the flow that normally hangs here. */
const Body = () => <p data-part="body">Flow</p>

afterEach(() => {
    cleanup()
})

describe("_AuthenticationPage", () => {
    it("draws one section, and wears its registry classes rather than any of its own", () => {
        const { container } = render(<_AuthenticationPage labels={labels} slots={{ body: Body }} />)
        const node = container.firstElementChild
        expect(node?.getAttribute("data-node")).toBe("section")
        expect(node?.getAttribute("data-roles")).toBe("heading body")
        expect(node?.getAttribute("class")).toBe(treeSpec("section").classes)
    })

    it("titles the page at the top of the document outline", () => {
        const { container } = render(<_AuthenticationPage labels={labels} slots={{ body: Body }} />)
        expect(container.querySelector("h1")?.textContent).toBe(labels.title)
        expect(container.querySelectorAll("h1").length).toBe(1)
    })

    it("hangs the slot it was given and adds no surface of its own", () => {
        const { container } = render(<_AuthenticationPage labels={labels} slots={{ body: Body }} />)
        expect(container.querySelector("[data-part='body']")?.textContent).toBe("Flow")
        expect(container.querySelector("[data-node='card']")).toBeNull()
        expect(container.querySelector("dialog")).toBeNull()
    })

    it("rests as the same tree rather than as a second one", () => {
        const { container } = render(
            <_AuthenticationPage labels={labels} slots={{ body: Body }} isLoading />,
        )
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("section")
        expect(container.querySelector("h1")?.getAttribute("data-loading")).toBe("true")
    })
})
