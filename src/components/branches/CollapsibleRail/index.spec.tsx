import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ComponentProps } from "react"
import { CollapsibleRail } from "."

type MotionDivProps = ComponentProps<"div"> & {
    readonly animate?: unknown
    readonly initial?: unknown
    readonly transition?: unknown
}

type TreeStubProps = { readonly contract: string }

vi.mock("framer-motion", () => {
    const MotionDivStub = (input: MotionDivProps) => {
        const { animate, initial, transition, ...props } = input
        void animate
        void initial
        void transition
        return <div {...props} />
    }
    return { motion: { div: MotionDivStub }, useReducedMotion: () => false }
})

vi.mock("@/components/branches/Tree", () => {
    const TreeStub = ({ contract }: TreeStubProps) => <nav data-contract={contract} />
    return { Tree: TreeStub }
})

const renderContract = {} as never

describe("CollapsibleRail", () => {
    it("keeps one Core navigation rail owner while selecting the expanded tree", () => {
        const { container } = render(<CollapsibleRail isCollapsed={false} expanded={renderContract} collapsed={renderContract} />)
        const rail = container.querySelector("[data-grammar-rail=\"true\"]")

        expect(rail).toHaveAttribute("data-grammar-contract", "core.rail")
        expect(rail).toHaveAttribute("data-grammar-landmark", "content-navigation")
        expect(rail).toHaveAttribute("data-grammar-collapse", "expanded")
        expect(rail).toHaveAttribute("data-grammar-motion", "animated")
        expect(rail?.tagName).toBe("DIV")
        expect(container.querySelectorAll("nav")).toHaveLength(1)
        expect(rail?.contains(container.querySelector("nav"))).toBe(true)
        expect(container.querySelector("nav")).toHaveAttribute("data-contract", "learn-course-navigation-rail")
    })

    it("keeps compact destinations in the same mounted Core rail", () => {
        const { container } = render(<CollapsibleRail isCollapsed expanded={renderContract} collapsed={renderContract} />)

        expect(container.querySelector("[data-grammar-rail=\"true\"]")).toHaveAttribute("data-grammar-collapse", "collapsed")
        expect(container.querySelector("nav")).toHaveAttribute("data-contract", "learn-course-navigation-rail-collapsed")
    })
})
