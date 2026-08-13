import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@/components/leaves/Badge"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"

/**
 * COMPOSITE - `RecommendedCourseRow`: one suggested course, priced.
 *
 * IT CARRIES NO DESCRIPTION. A paragraph inside a row somebody is scanning is the part they skip,
 * and it pushed the price, the saving and the reason for the suggestion below the depth a reader
 * gives one row. The title says which course; the artwork says it faster.
 *
 * THE SAVING AND THE QUESTION ABOUT IT SHARE A LINE, the same `price-note-row` the catalog card
 * uses, so the two surfaces answer "why does it cost this" the same way rather than each inventing
 * an answer.
 */

/** Resolved commerce facts for one recommendation. */
export type RecommendedCourseRowData = {
    readonly id: string
    readonly title?: string
    /** The course artwork drawn on the mark, when the course has any. */
    readonly cover?: string | null
    readonly price?: string
    readonly originalPrice?: string
    readonly discount?: string
    /** What this price saves against the list price, already phrased. */
    readonly savings?: string
    /** The already-resolved label of the action that explains the price. */
    readonly priceDetailLabel?: string
    /** Why this course is being suggested at all. */
    readonly reason?: string
}

/** Journeys reported by a recommendation row. */
export type RecommendedCourseRowActions = {
    readonly open?: () => void
    /** Called when the reader asks why this course costs what it costs. */
    readonly openPriceDetail?: () => void
}

/**
 * Draw one whole-row recommended-course destination.
 *
 * @param input - {@link CompositeProps}
 */
export const RecommendedCourseRow = ({ props, on, isLoading = false }: CompositeProps<RecommendedCourseRowData, RecommendedCourseRowActions>) => {
    const price = defineContractComponent("price-discount-line", {
        price: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.price, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        ...(props.originalPrice === undefined ? {} : { original: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} isLoading={isLoading} />) }),
        ...(props.discount === undefined ? {} : { discount: defineLeafComponent("badge", {}, () => <Badge props={{ content: props.discount, tone: "success" }} />) }),
    })
    const body = defineContractComponent("recommended-course-body", {
        title: defineLeafComponent("text", { size: "md", weight: "semibold" }, () => (
            <Text props={{ content: props.title, size: "md", weight: "semibold", isPressLabel: true }} isLoading={isLoading} />
        )),
        price,
        ...(props.priceDetailLabel === undefined ? {} : {
            note: defineContractComponent("price-note-row", {
                ...(props.savings === undefined ? {} : {
                    fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.savings, size: "xs", tone: "muted" }} isLoading={isLoading} />),
                }),
                action: defineLeafComponent("text-link", { size: "xs" }, () => (
                    <TextLink props={{ label: props.priceDetailLabel ?? "", size: "xs" }} on={{ press: on?.openPriceDetail }} />
                )),
            }),
        }),
        ...(props.reason === undefined ? {} : { reason: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.reason, size: "xs", tone: "muted" }} />) }),
    })
    const content = defineContractComponent("recommended-course-row", {
        mark: defineLeafComponent("icon-tile", {}, () => (
            <IconTile props={{ icon: "course", image: props.cover, tone: "accent", size: "md" }} isLoading={isLoading} />
        )),
        body,
    })
    return <PressableSurface contract="recommended-course-row" hover="label" render={content} label={props.title ?? "Course"} press={on?.open} disabled={isLoading} />
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
