import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@/components/leaves/Badge"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"

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
export type RecommendedCourseRowProps = {
    readonly props: RecommendedCourseRowData
    readonly on?: RecommendedCourseRowActions
    readonly isLoading?: boolean
}

/** Draw one suggested course as a single accessible destination with pricing context. */
export const RecommendedCourseRow = (props: RecommendedCourseRowProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const priceDetailLabel = data.priceDetailLabel
    return <PressableSurface hover="label" label={data.title ?? "Course"} press={on?.open} disabled={isLoading}>
        <IconTile props={{ icon: "course", image: data.cover, tone: "accent", size: "md" }} isLoading={isLoading} />
        <div>
            <Text props={{ content: data.title, size: "md", weight: "semibold", isPressLabel: true }} isLoading={isLoading} />
            <div>
                <Text props={{ content: data.price, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                {data.originalPrice === undefined ? null : <Text props={{ content: data.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} isLoading={isLoading} />}
                {data.discount === undefined ? null : <Badge props={{ content: data.discount, tone: "success" }} />}
            </div>
            {priceDetailLabel === undefined ? null : <div>
                {data.savings === undefined ? null : <Text props={{ content: data.savings, size: "xs", tone: "muted" }} isLoading={isLoading} />}
                <TextLink props={{ label: priceDetailLabel, size: "xs" }} on={{ press: on?.openPriceDetail }} />
            </div>}
            {data.reason === undefined ? null : <Text props={{ content: data.reason, size: "xs", tone: "muted" }} />}
        </div>
    </PressableSurface>
}
