"use client"
import { useState } from "react"
import { SurfaceAccordionCard } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { titleDescriptionBodyClassName, titleDescriptionClassName, titleDescriptionSummaryClassName } from "./classNames"

/** One title/description disclosure row. */
export type TitleDescriptionAccordionItem = { readonly id: string; readonly title: string; readonly description: string }
/** Disclosure collection data. */
export type TitleDescriptionAccordionData = { readonly label: string; readonly items: ReadonlyArray<TitleDescriptionAccordionItem>; readonly emptyLabel?: string }
/** Public inputs for the disclosure collection. */
export type TitleDescriptionAccordionProps = { readonly props: TitleDescriptionAccordionData; readonly isLoading?: boolean }

/** Draw a labelled title/description collection through the shared accordion surface. */
export const TitleDescriptionAccordion = (props: TitleDescriptionAccordionProps) => {
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())
    const sourceItems = props.props.items.length === 0 && props.props.emptyLabel !== undefined ? [{ id: "empty", title: props.props.emptyLabel, description: "" }] : props.props.items
    const items = sourceItems.map((item) => ({ id: item.id, isOpen: expandedIds.has(item.id), isDisabled: props.isLoading === true || item.description.trim() === "", summaryRender: <div className={titleDescriptionSummaryClassName}><Text size={"sm"} weight={"medium"} isSkeleton={props.isLoading}>{item.title}</Text>{item.description.trim() === "" ? null : <DisclosureIndicator props={{ isOpen: expandedIds.has(item.id) }} />}</div>, bodyRender: <div className={titleDescriptionBodyClassName}><Text size={"sm"}>{item.description}</Text></div> }))
    return <div className={titleDescriptionClassName}><Heading level={3}>{props.props.label}</Heading><SurfaceCard composition="joined"><SurfaceAccordionCard items={items} renderSummary={(summary) => <>{summary}</>} renderBody={(body) => <>{body}</>} onItemOpenChange={(id, isOpen) => setExpandedIds((current) => { const next = new Set(current); if (isOpen) next.add(id); else next.delete(id); return next })} /></SurfaceCard></div>
}
