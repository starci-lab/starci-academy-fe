import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { RecommendedCourseRow, type RecommendedCourseRowData } from "@/components/composites/RecommendedCourseRow"
import { recommendedCourseItemClassName, recommendedCoursesGridClassName } from "./classNames"
/** Resolved recommendation frame and rows. */
export type RecommendedCoursesData = SurfaceListCardData & { readonly rows: ReadonlyArray<RecommendedCourseRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Recommendation actions. */
export type RecommendedCoursesActions = { readonly [key: string]: (() => void) | undefined }
/** Traditional recommendation props. */
export type RecommendedCoursesProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: RecommendedCoursesData; readonly on?: RecommendedCoursesActions }
/** Draw recommended courses and request outcomes. */
export const RecommendedCoursesBase = (props: RecommendedCoursesProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceListCard props={props.props}><EmptyNotice props={{ icon: "course", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.state === "failed" ? props.on?.retry : undefined }} /></SurfaceListCard>
    return <SurfaceListCard props={props.props} isLoading={props.state === "pending"}><ul className={recommendedCoursesGridClassName}>{props.props.rows.map((row, index) => <li className={recommendedCourseItemClassName(index, props.props.rows.length)} key={row.id}><RecommendedCourseRow props={row} on={{ open: props.on?.[`open:${row.id}`], openPriceDetail: props.on?.[`priceDetail:${row.id}`] }} isLoading={props.state === "pending"} /></li>)}</ul></SurfaceListCard>
}
