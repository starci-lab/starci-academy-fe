/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Avatar } from "./index"

afterEach(cleanup)

describe("Avatar", () => {
    it("derives a local DiceBear fallback from the resolved name", () => {
        const { container } = render(<Avatar props={{ name: "Felix" }} />)
        const fallback = container.querySelector<HTMLImageElement>("img[alt=\"Felix\"]")

        expect(fallback?.src).toContain("data:image/svg+xml")
        expect(fallback?.alt).toBe("Felix")
        expect(fallback?.className).toContain("size-full")
    })

    it("keeps the same fallback for the same identity and changes it for another", () => {
        const first = render(<Avatar props={{ name: "Felix" }} />)
        const firstSource = first.container
            .querySelector<HTMLImageElement>("img[alt=\"Felix\"]")?.src
        first.unmount()

        const same = render(<Avatar props={{ name: "Felix" }} />)
        const sameSource = same.container
            .querySelector<HTMLImageElement>("img[alt=\"Felix\"]")?.src
        same.unmount()

        const other = render(<Avatar props={{ name: "Maria" }} />)
        const otherSource = other.container
            .querySelector<HTMLImageElement>("img[alt=\"Maria\"]")?.src

        expect(sameSource).toBe(firstSource)
        expect(otherSource).not.toBe(firstSource)
    })

    it("keeps the loading pass as one empty resting shape", () => {
        const { container } = render(<Avatar props={{ name: "Felix" }} isLoading />)

        expect(container.querySelector("img")).toBeNull()
        expect(container.querySelector("[aria-hidden=\"true\"]")).not.toBeNull()
    })
})
