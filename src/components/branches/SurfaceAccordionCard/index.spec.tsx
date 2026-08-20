/** @vitest-environment jsdom */
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SurfaceAccordionCard } from "."
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

const mocks = vi.hoisted(() => ({
    isExpanded: vi.fn(),
    expandedChange: undefined as ((isExpanded: boolean) => void) | undefined,
}))

vi.mock("@heroui/react", () => {
    const Item = (props: PropsWithChildren<{
        isExpanded: boolean
        onExpandedChange: (isExpanded: boolean) => void
    }>) => {
        const { children, isExpanded, onExpandedChange } = props
        mocks.isExpanded(isExpanded)
        mocks.expandedChange = onExpandedChange
        return <div>{children}</div>
    }
    const Heading = (props: PropsWithChildren) => {
        const { children } = props
        return <h3>{children}</h3>
    }
    const Trigger = (props: PropsWithChildren) => {
        const { children } = props
        return (
            <button type="button" onClick={() => mocks.expandedChange?.(true)}>
                {children}
            </button>
        )
    }
    const Panel = (props: PropsWithChildren) => {
        const { children } = props
        return <div>{children}</div>
    }
    return { Accordion: Object.assign({}, { Item, Heading, Trigger, Panel }) }
})

afterEach(cleanup)

const summary = defineContractComponent("stacked-peer-controls", {
    control: [defineLeafComponent("button", {}, () => <>Summary</>)],
})
const body = defineContractComponent("stacked-peer-controls", {
    control: [defineLeafComponent("button", {}, () => <>Body</>)],
})

describe("SurfaceAccordionCard", () => {
    it("forwards the open state to the vendor accordion item", () => {
        render(
            <SurfaceAccordionCard
                isOpen
                summaryContract="stacked-peer-controls"
                summaryRender={summary}
                bodyContract="stacked-peer-controls"
                bodyRender={body}
                onOpenChange={() => undefined}
            />,
        )
        expect(mocks.isExpanded).toHaveBeenCalledWith(true)
        expect(screen.getByText("Summary")).toBeTruthy()
        expect(screen.getByText("Body")).toBeTruthy()
    })

    it("routes a vendor expand outcome to one open-change callback", () => {
        const onOpenChange = vi.fn()
        render(
            <SurfaceAccordionCard
                isOpen={false}
                summaryContract="stacked-peer-controls"
                summaryRender={summary}
                bodyContract="stacked-peer-controls"
                bodyRender={body}
                onOpenChange={onOpenChange}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Summary" }))
        expect(onOpenChange).toHaveBeenCalledWith(true)
    })
})
