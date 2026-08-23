"use client"

import { useState } from "react"
import { SurfaceAccordionCard } from "@/components/branches/SurfaceAccordionCard"
import { Tree } from "@/components/branches/Tree"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type CompositeProps,
} from "@/components/contracts/props"

/** One title/description disclosure row. */
export type TitleDescriptionAccordionItem = {
    readonly id: string
    readonly title: string
    readonly description: string
}

/** Closed data owned by the shared title/description accordion. */
export type TitleDescriptionAccordionData = {
    readonly label: string
    readonly items: ReadonlyArray<TitleDescriptionAccordionItem>
    readonly emptyLabel?: string
}

/** Props for {@link TitleDescriptionAccordion}. */
export type TitleDescriptionAccordionProps = CompositeProps<TitleDescriptionAccordionData>

/** Draw one labelled title/description collection through one shared accordion surface. */
export const TitleDescriptionAccordion = (input: TitleDescriptionAccordionProps) => {
    const isLoading = input.isLoading ?? false
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())
    const sourceItems = input.props.items.length === 0 && input.props.emptyLabel !== undefined
        ? [{ id: "empty", title: input.props.emptyLabel, description: "" }]
        : input.props.items
    const items = sourceItems.map((item) => {
        const canDisclose = !isLoading && item.description.trim().length > 0

        return {
            id: item.id,
            isOpen: expandedIds.has(item.id),
            isDisabled: !canDisclose,
            summaryRender: defineContractComponent("title-description-accordion-summary", {
                title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                    <Text props={{ content: item.title, size: "sm", weight: "medium" }} isLoading={isLoading} />
                )),
                indicator: canDisclose
                    ? defineLeafComponent("disclosure-indicator", {}, () => (
                        <DisclosureIndicator props={{ isOpen: expandedIds.has(item.id) }} />
                    ))
                    : undefined,
            }),
            bodyRender: defineContractComponent("title-description-accordion-body", {
                description: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: item.description, size: "sm" }} />
                )),
            }),
        }
    })

    return (
        <Tree
            contract="title-description-accordion"
            render={defineContractComponent("title-description-accordion", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.label, level: 3 }} />
                )),
                disclosure: defineContractProjection("title-description-disclosure", () => (
                    <SurfaceAccordionCard
                        variant="surface"
                        items={items}
                        summaryContract="title-description-accordion-summary"
                        bodyContract="title-description-accordion-body"
                        onItemOpenChange={(id, isOpen) => setExpandedIds((current) => {
                            const next = new Set(current)
                            if (isOpen) next.add(id)
                            else next.delete(id)
                            return next
                        })}
                    />
                )),
            })}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
