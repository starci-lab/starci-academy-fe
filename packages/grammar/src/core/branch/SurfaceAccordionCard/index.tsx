import { useId, type ReactNode } from "react"
import { accordionCardClassName, accordionHeadingClassName, accordionPanelClassName, accordionRowClassName, getAccordionShellClassName, accordionTriggerClassName } from "./classNames.js"

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
}: SurfaceAccordionRowsProps<Summary, Body>) => {
    const ownerId = useId()
    const bounded = depth !== undefined

    return (
        <div
            className={accordionCardClassName}
            data-grammar-surface-accordion-card="true"
        >
            <div
                className={getAccordionShellClassName(bounded)}
                data-grammar-accordion-shell="true"
                data-grammar-surface={bounded ? "true" : undefined}
                data-grammar-surface-depth={depth}
                data-surface-context={depth === "nested" ? "nested" : depth === "top" ? "page" : undefined}
            >
                {items.map((item, index) => {
                    const triggerId = `${ownerId}-trigger-${index}`
                    const panelId = `${ownerId}-panel-${index}`
                    return (
                        <div
                            className={accordionRowClassName}
                            data-grammar-accordion-row="true"
                            data-grammar-disclosure-state={item.isOpen ? "open" : "closed"}
                            key={item.id}
                        >
                            <h3 className={accordionHeadingClassName}>
                                <button
                                    aria-controls={panelId}
                                    aria-expanded={item.isOpen}
                                    className={accordionTriggerClassName}
                                    disabled={item.isDisabled}
                                    id={triggerId}
                                    onClick={() => onItemOpenChange(item.id, !item.isOpen)}
                                    type="button"
                                >
                                    {renderSummary(item.summaryRender)}
                                </button>
                            </h3>
                            {item.isOpen ? (
                                <div
                                    aria-labelledby={triggerId}
                                    className={accordionPanelClassName}
                                    id={panelId}
                                    role="region"
                                >
                                    {renderBody(item.bodyRender)}
                                </div>
                            ) : null}
                        </div>
                    )
                })}
            </div>
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
        />
    )
    : (
        <SurfaceAccordionRows
            {...(props.depth === undefined ? {} : { depth: props.depth })}
            items={props.items}
            renderSummary={props.renderSummary}
            renderBody={props.renderBody}
            onItemOpenChange={props.onItemOpenChange}
        />
    )
