import { Button, SurfaceListCard, Text } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { RecommendedCourseRow, type RecommendedCourseRowData } from "@/components/composites/RecommendedCourseRow"
import { recommendedCourseItemClassName, recommendedCoursesGridClassName } from "./classNames"
/** Resolved recommendation frame and rows. */
export type RecommendedCoursesData = { readonly label: string; readonly fact?: string; readonly description?: string; readonly actionLabel?: string; readonly isNested?: boolean; readonly isLabelHidden?: boolean; readonly isVerdict?: boolean; readonly isScrollable?: boolean; readonly rows: ReadonlyArray<RecommendedCourseRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Recommendation actions. */
export type RecommendedCoursesActions = { readonly [key: string]: (() => void) | undefined }
/** Traditional recommendation props. */
export type RecommendedCoursesProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: RecommendedCoursesData; readonly on?: RecommendedCoursesActions }
/** Draw recommended courses and request outcomes. */
export const RecommendedCoursesBase = (props: RecommendedCoursesProps) => {
    const isLoading = props.state === "pending"
    const footer = props.props.actionLabel !== undefined && (isLoading || props.on?.act !== undefined)
        ? <Button variant="primary" size="sm" isSkeleton={isLoading} onPress={props.on?.act}>{props.props.actionLabel}</Button>
        : props.props.description === undefined ? undefined : <Text size="xs" tone="muted" isSkeleton={isLoading}>{props.props.description}</Text>
    const frame = { label: props.props.label, fact: props.props.fact, labelHidden: props.props.isLabelHidden, depth: props.props.isNested === true ? "nested" as const : "top" as const, footer, isLoading, isVerdict: props.props.isVerdict, isScrollable: props.props.isScrollable }
    if (props.state === "empty" || props.state === "failed") return <SurfaceListCard {...frame}><EmptyNotice message={props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? ""} actionLabel={props.state === "failed" ? props.props.retryLabel : undefined} iconSource={iconSourceFor("course", "leading")} onAction={props.state === "failed" ? props.on?.retry : undefined} /></SurfaceListCard>
    return <SurfaceListCard {...frame}><ul className={recommendedCoursesGridClassName}>{props.props.rows.map((row, index) => <li className={recommendedCourseItemClassName(index, props.props.rows.length)} key={row.id}><RecommendedCourseRow props={row} on={{ open: props.on?.[`open:${row.id}`], openPriceDetail: props.on?.[`priceDetail:${row.id}`] }} isLoading={isLoading} /></li>)}</ul></SurfaceListCard>
}
