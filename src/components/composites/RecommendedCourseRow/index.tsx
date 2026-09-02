import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@starci/grammar/common"
import { DestinationCue } from "@/components/leaves/DestinationCue"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { recommendedCourseBodyClassName, recommendedCourseDetailsClassName, recommendedCourseEvidenceClassName, recommendedCoursePriceClassName, recommendedCourseRowClassName, recommendedCourseCoverClassName } from "./classNames"
import { TextAction } from "@starci/grammar/common"


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
    /** Visible task closure for the row's primary destination. */
    readonly actionLabel?: string
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
    return <PressableSurface hover="label" label={data.title ?? "Course"} press={on?.open} disabled={isLoading}><div className={recommendedCourseRowClassName}>
        <IconTile source={iconSourceFor("course", "leading")} artwork={data.cover ? <img src={data.cover} alt="" className={recommendedCourseCoverClassName} /> : undefined} tone={"accent"} size={"md"} isSkeleton={isLoading} />
        <div className={recommendedCourseBodyClassName} data-recommended-course-body="true">
            <div className={recommendedCourseEvidenceClassName} data-recommended-course-evidence="true">
                <Text size={"md"} weight={"semibold"} isPressLabel={true} isSkeleton={isLoading}>{data.title}</Text>
                <div className={recommendedCoursePriceClassName}>
                    <Text size={"md"} weight={"semibold"} isSkeleton={isLoading}>{data.price}</Text>
                    {data.originalPrice === undefined ? null : <Text size={"md"} tone={"muted"} isSuperseded={true} isSkeleton={isLoading}>{data.originalPrice}</Text>}
                    {data.discount === undefined ? null : <Badge tone={"success"}>{data.discount}</Badge>}
                </div>
                {priceDetailLabel === undefined ? null : <div className={recommendedCourseDetailsClassName}>
                    {data.savings === undefined ? null : <Text size={"sm"} isSkeleton={isLoading}>{data.savings}</Text>}
                    <TextAction size={"sm"} appearance="inline" onPress={on?.openPriceDetail}>{priceDetailLabel}</TextAction>
                </div>}
                {data.reason === undefined ? null : <Text size={"sm"}>{data.reason}</Text>}
            </div>
            {data.actionLabel === undefined ? null : <DestinationCue props={{ label: data.actionLabel }} isLoading={isLoading} />}
        </div>
    </div></PressableSurface>
}
