import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { CourseProgressRow, type CourseProgressRowData } from "@/components/composites/CourseProgressRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
/** Resolved frame and rows for enrolled-course progress. */
export type MyCoursesProgressData = SurfaceListCardData & { readonly rows: ReadonlyArray<CourseProgressRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Retry and per-course navigation actions. */
export type MyCoursesProgressActions = { readonly [key: string]: (() => void) | undefined }
/** Situation-discriminated enrolled-course progress props. */
export type MyCoursesProgressProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: MyCoursesProgressData; readonly on?: MyCoursesProgressActions }
/** Draw enrolled-course progress and its empty/error states. */
export const MyCoursesProgressBase = (props: MyCoursesProgressProps) => { if (props.state === "empty" || props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "course", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.props.retryLabel }} on={{ act: props.on?.retry }} /></SurfaceCard>; const rows = props.state === "pending" ? [] : props.props.rows; return <SurfaceListCard props={props.props} on={{ act: props.on?.act }} isLoading={props.state === "pending"}>{rows.map((row) => <CourseProgressRow key={row.id} props={row} on={{ open: props.on?.[`open:${row.id}`] }} isLoading={props.state === "pending"} />)}</SurfaceListCard> }
