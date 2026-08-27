import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { RecommendedCourseRow, type RecommendedCourseRowData } from "@/components/composites/RecommendedCourseRow"
/** Resolved recommendation frame and rows. */
export type RecommendedCoursesData = SurfaceListCardData & { readonly rows: ReadonlyArray<RecommendedCourseRowData>; readonly errorMessage?: string; readonly retryLabel?: string }
/** Recommendation actions. */
export type RecommendedCoursesActions = { readonly [key: string]: (() => void) | undefined }
/** Traditional recommendation props. */
export type RecommendedCoursesProps = { readonly state: "pending" | "hidden" | "failed" | "ready"; readonly props: RecommendedCoursesData; readonly on?: RecommendedCoursesActions }
/** Draw recommended courses and request outcomes. */
export const RecommendedCoursesBase = (props: RecommendedCoursesProps) => props.state === "hidden" ? null : props.state === "failed" ? <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "course", message: props.props.errorMessage ?? "", actionLabel: props.props.retryLabel }} on={{ act: props.on?.retry }} /></SurfaceCard> : <SurfaceListCard props={props.props} isLoading={props.state === "pending"}>{props.props.rows.map((row) => <RecommendedCourseRow key={row.id} props={row} on={{ open: props.on?.[`open:${row.id}`], openPriceDetail: props.on?.[`priceDetail:${row.id}`] }} isLoading={props.state === "pending"} />)}</SurfaceListCard>
