"use client"
import { useState } from "react"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

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
    const items = sourceItems.map((item) => ({ id: item.id, isOpen: expandedIds.has(item.id), isDisabled: props.isLoading === true || item.description.trim() === "", summaryRender: <><Text props={{ content: item.title, size: "sm", weight: "medium" }} isLoading={props.isLoading} />{item.description.trim() === "" ? null : <DisclosureIndicator props={{ isOpen: expandedIds.has(item.id) }} />}</>, bodyRender: <Text props={{ content: item.description, size: "sm" }} /> }))
    return <div><Heading props={{ content: props.props.label, level: 3 }} /><SurfaceAccordionCard depth="top" items={items} renderSummary={(summary) => <>{summary}</>} renderBody={(body) => <>{body}</>} onItemOpenChange={(id, isOpen) => setExpandedIds((current) => { const next = new Set(current); if (isOpen) next.add(id); else next.delete(id); return next })} /></div>
}
