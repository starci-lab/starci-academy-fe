/** @vitest-environment jsdom */
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { SurfaceAccordionCard } from "."
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

const mocks = vi.hoisted(() => ({
    expandedKeys: vi.fn(),
    onExpandedChange: undefined as ((expandedKeys: Set<string>) => void) | undefined,
}))

vi.mock("@heroui/react", () => {
    const Root = (props: PropsWithChildren<{
        variant?: "default" | "surface"
        hideSeparator?: boolean
        className?: string
        expandedKeys?: Set<string>
        onExpandedChange?: (expandedKeys: Set<string>) => void
        [key: `data-${string}`]: string | boolean | undefined
    }>) => {
        const { children, variant, hideSeparator, expandedKeys, onExpandedChange, ...rest } = props
        mocks.expandedKeys(expandedKeys)
        mocks.onExpandedChange = onExpandedChange
        return <div {...rest} data-variant={variant} data-hide-separator={String(hideSeparator)}>{children}</div>
    }
    const Item = (props: PropsWithChildren<{
        id?: string
        isDisabled?: boolean
        [key: `data-${string}`]: string | boolean | undefined
    }>) => {
        const { children, isDisabled, ...rest } = props
        return <div {...rest} data-disabled={String(isDisabled ?? false)}>{children}</div>
    }
    const Heading = (props: PropsWithChildren) => {
        const { children } = props
        return <h3>{children}</h3>
    }
    const Trigger = (props: PropsWithChildren<{ className?: string }>) => {
        const { children, className } = props
        return (
            <button type="button" className={className}>
                {children}
            </button>
        )
    }
    const Panel = (props: PropsWithChildren) => {
        const { children } = props
        return <div>{children}</div>
    }
    return { Accordion: Object.assign(Root, { Root, Item, Heading, Trigger, Panel }) }
})

afterEach(() => {
    cleanup()
    mocks.expandedKeys.mockClear()
    mocks.onExpandedChange = undefined
})

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
                variant="surface"
                summaryContract="stacked-peer-controls"
                summaryRender={summary}
                bodyContract="stacked-peer-controls"
                bodyRender={body}
                onOpenChange={() => undefined}
            />,
        )
        expect(mocks.expandedKeys).toHaveBeenCalledWith(new Set(["surface-accordion-item"]))
        expect(screen.getByText("Summary")).toBeTruthy()
        expect(screen.getByText("Body")).toBeTruthy()
        const surface = document.querySelector("[data-component=SurfaceAccordionCard]")
        expect(surface?.getAttribute("data-variant")).toBe("surface")
        expect(surface?.getAttribute("data-hide-separator")).toBe("true")
        expect(surface).toHaveClass("shadow-surface")
        expect(screen.getByRole("button")).toHaveClass("p-4")
        expect(screen.getByRole("button")).toHaveClass("hover:!bg-transparent", "data-[hovered=true]:!bg-transparent")
        expect(screen.getByRole("button")).not.toHaveClass("px-6", "py-3")
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
        mocks.onExpandedChange?.(new Set(["surface-accordion-item"]))
        expect(onOpenChange).toHaveBeenCalledWith(true)
        expect(document.querySelector("[data-component=SurfaceAccordionCard]")).toBeTruthy()
        expect(document.querySelector("[data-component=SurfaceAccordionCardItem]")).toBeTruthy()
        expect(document.querySelector("[data-component=SurfaceAccordionCardRoot]")).toBeNull()
        expect(document.querySelector("[data-component=SurfaceAccordionCardSurface]")).toBeNull()
    })

    it("keeps multiple disclosure rows inside one joined surface", () => {
        const onItemOpenChange = vi.fn()
        render(
            <SurfaceAccordionCard
                variant="surface"
                summaryContract="stacked-peer-controls"
                bodyContract="stacked-peer-controls"
                items={[
                    { id: "first", isOpen: true, summaryRender: summary, bodyRender: body },
                    { id: "middle", isOpen: false, summaryRender: summary, bodyRender: body },
                    { id: "last", isOpen: false, summaryRender: summary, bodyRender: body },
                ]}
                onItemOpenChange={onItemOpenChange}
            />,
        )

        expect(document.querySelectorAll("[data-component=SurfaceAccordionCard]")).toHaveLength(1)
        expect(document.querySelectorAll("[data-component=SurfaceAccordionCardItem]")).toHaveLength(3)
        expect(document.querySelector("[data-component=SurfaceAccordionCard]")?.getAttribute("data-hide-separator")).toBe("false")
        expect(document.querySelector("[data-component=SurfaceAccordionCard]")).toHaveClass("shadow-surface")
        expect(mocks.expandedKeys).toHaveBeenCalledWith(new Set(["first"]))

        const triggers = screen.getAllByRole("button")
        expect(triggers[0]).toHaveClass("p-4", "pb-3")
        expect(triggers[1]).toHaveClass("px-4", "py-3")
        expect(triggers[2]).toHaveClass("p-4", "pt-3")
        for (const trigger of triggers) expect(trigger).toHaveClass("hover:!bg-transparent", "data-[hovered=true]:!bg-transparent")

        mocks.onExpandedChange?.(new Set(["first", "middle"]))
        expect(onItemOpenChange).toHaveBeenCalledWith("middle", true)
    })
})
