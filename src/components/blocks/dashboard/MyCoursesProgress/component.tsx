import { Button, SurfaceListCard, Text } from "@starci/grammar/common"
import { CourseProgressRow, type CourseProgressRowData } from "@/components/composites/CourseProgressRow"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { courseProgressListClassName } from "./classNames"
/** Resolved frame and rows for enrolled-course progress. */
export type MyCoursesProgressData = { readonly label: string; readonly fact?: string; readonly description?: string; readonly actionLabel?: string; readonly isNested?: boolean; readonly isLabelHidden?: boolean; readonly isVerdict?: boolean; readonly isScrollable?: boolean; readonly rows: ReadonlyArray<CourseProgressRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Retry and per-course navigation actions. */
export type MyCoursesProgressActions = { readonly [key: string]: (() => void) | undefined }
/** Situation-discriminated enrolled-course progress props. */
export type MyCoursesProgressProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: MyCoursesProgressData; readonly on?: MyCoursesProgressActions }
/** Draw enrolled-course progress and its empty/error states. */
export const MyCoursesProgressBase = (props: MyCoursesProgressProps) => {
    const isLoading = props.state === "pending"
    const footer = props.props.actionLabel !== undefined && (isLoading || props.on?.act !== undefined)
        ? <Button variant="primary" size="sm" isSkeleton={isLoading} onPress={props.on?.act}>{props.props.actionLabel}</Button>
        : props.props.description === undefined ? undefined : <Text size="xs" tone="muted" isSkeleton={isLoading}>{props.props.description}</Text>
    const frame = { label: props.props.label, fact: props.props.fact, labelHidden: props.props.isLabelHidden, depth: props.props.isNested === true ? "nested" as const : "top" as const, footer, isLoading, isVerdict: props.props.isVerdict, isScrollable: props.props.isScrollable }
    if (props.state === "empty" || props.state === "failed") return <SurfaceListCard {...frame}><EmptyNotice message={props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? ""} actionLabel={props.props.retryLabel} iconSource={iconSourceFor("course", "leading")} onAction={props.on?.retry} /></SurfaceListCard>
    const rows = isLoading ? [] : props.props.rows
    return <SurfaceListCard {...frame}><div className={courseProgressListClassName}>{rows.map((row) => <CourseProgressRow key={row.id} props={row} on={{ open: props.on?.[`open:${row.id}`] }} isLoading={isLoading} />)}</div></SurfaceListCard>
}
