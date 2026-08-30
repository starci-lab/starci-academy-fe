import { Accordion } from "@heroui/react"
import { type Key, type ReactNode } from "react"
import { VerticalScrollRegion } from "../../composite/VerticalScrollRegion/index.js"
import { accordionBodyClassName, accordionCardClassName, accordionHeadingClassName, accordionPanelClassName, accordionRowClassName, accordionScrollRegionClassName, getAccordionShellClassName, accordionTriggerClassName } from "./classNames.js"

export type SurfaceAccordionCardItem<Summary, Body> = {
    readonly id: string
    readonly isOpen: boolean
    readonly isDisabled?: boolean
    readonly summaryRender: Summary
    readonly bodyRender: Body
}

type SurfaceAccordionCardCommonProps<Summary, Body> = {
    /** Top surfaces own elevation; nested surfaces own a subordinate border; omission is frameless. */
    readonly depth?: "top" | "nested"
    readonly renderSummary: (summary: Summary) => ReactNode
    readonly renderBody: (body: Body) => ReactNode
    /** Convenience capability: make the row region a HeroUI Vertical ScrollShadow. */
    readonly isScrollable?: boolean
}

export type SurfaceAccordionCardProps<Summary, Body> = SurfaceAccordionCardCommonProps<Summary, Body> & ({
    readonly items: ReadonlyArray<SurfaceAccordionCardItem<Summary, Body>>
    readonly onItemOpenChange: (id: string, isOpen: boolean) => void
    readonly isOpen?: never
    readonly isDisabled?: never
    readonly summaryRender?: never
    readonly bodyRender?: never
    readonly onOpenChange?: never
} | {
    readonly items?: never
    readonly onItemOpenChange?: never
    readonly isOpen: boolean
    readonly isDisabled?: boolean
    readonly summaryRender: Summary
    readonly bodyRender: Body
    readonly onOpenChange: (isOpen: boolean) => void
})

type SurfaceAccordionRowsProps<Summary, Body> = SurfaceAccordionCardCommonProps<Summary, Body> & {
    readonly items: ReadonlyArray<SurfaceAccordionCardItem<Summary, Body>>
    readonly onItemOpenChange: (id: string, isOpen: boolean) => void
}

const SurfaceAccordionRows = <Summary, Body>({
    depth,
    items,
    renderSummary,
    renderBody,
    onItemOpenChange,
    isScrollable = false,
}: SurfaceAccordionRowsProps<Summary, Body>) => {
    const bounded = depth !== undefined
    const expandedKeys = new Set(items.filter((item) => item.isOpen).map((item) => item.id))

    const onExpandedChange = (nextKeys: Set<Key>) => {
        const nextIds = new Set([...nextKeys].map(String))
        for (const item of items) {
            const nextOpen = nextIds.has(item.id)
            if (nextOpen !== item.isOpen) onItemOpenChange(item.id, nextOpen)
        }
    }

    return (
        <div
            className={accordionCardClassName}
            data-grammar-surface-accordion-card="true"
        >
            <VerticalScrollRegion className={accordionScrollRegionClassName} isScrollable={isScrollable}>
                <Accordion.Root
                    allowsMultipleExpanded
                    className={getAccordionShellClassName(bounded) ?? ""}
                    data-grammar-accordion-shell="true"
                    data-grammar-scroll={isScrollable ? "contained" : "page"}
                    data-grammar-surface={bounded ? "true" : undefined}
                    data-grammar-surface-depth={depth}
                    data-surface-context={depth === "nested" ? "nested" : depth === "top" ? "page" : undefined}
                    expandedKeys={expandedKeys}
                    onExpandedChange={onExpandedChange}
                >
                    {items.map((item) => {
                        return (
                            <Accordion.Item
                                className={accordionRowClassName ?? ""}
                                data-grammar-accordion-row="true"
                                data-grammar-disclosure-state={item.isOpen ? "open" : "closed"}
                                id={item.id}
                                {...(item.isDisabled === undefined ? {} : { isDisabled: item.isDisabled })}
                                key={item.id}
                            >
                                <Accordion.Heading className={accordionHeadingClassName ?? ""}>
                                    <Accordion.Trigger
                                        className={accordionTriggerClassName ?? ""}
                                    >
                                        {renderSummary(item.summaryRender)}
                                    </Accordion.Trigger>
                                </Accordion.Heading>
                                <Accordion.Panel className={accordionPanelClassName ?? ""} role="region">
                                    <Accordion.Body className={accordionBodyClassName ?? ""}>
                                        {renderBody(item.bodyRender)}
                                    </Accordion.Body>
                                </Accordion.Panel>
                            </Accordion.Item>
                        )
                    })}
                </Accordion.Root>
            </VerticalScrollRegion>
        </div>
    )
}

/** Draw one full-width joined disclosure surface whose reusable anatomy is owned by Core Grammar. */
export const SurfaceAccordionCard = <Summary, Body>(props: SurfaceAccordionCardProps<Summary, Body>) => props.items === undefined
    ? (
        <SurfaceAccordionRows
            {...(props.depth === undefined ? {} : { depth: props.depth })}
            items={[{
                id: "surface-accordion-item",
                isOpen: props.isOpen,
                ...(props.isDisabled === undefined ? {} : { isDisabled: props.isDisabled }),
                summaryRender: props.summaryRender,
                bodyRender: props.bodyRender,
            }]}
            renderSummary={props.renderSummary}
            renderBody={props.renderBody}
            onItemOpenChange={(_id, isOpen) => props.onOpenChange(isOpen)}
            {...(props.isScrollable === undefined ? {} : { isScrollable: props.isScrollable })}
        />
    )
    : (
        <SurfaceAccordionRows
            {...(props.depth === undefined ? {} : { depth: props.depth })}
            items={props.items}
            renderSummary={props.renderSummary}
            renderBody={props.renderBody}
            onItemOpenChange={props.onItemOpenChange}
            {...(props.isScrollable === undefined ? {} : { isScrollable: props.isScrollable })}
        />
    )
