import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@starci/grammar/common"
import { DestinationCue } from "@/components/leaves/DestinationCue"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Progress } from "@starci/grammar/common"
import { StatusDot, type StatusDotTone } from "@/components/leaves/StatusDot"
import { Text } from "@starci/grammar/common"
import { courseProgressBodyClassName, courseProgressHeadingClassName, courseProgressLegendClassName, courseProgressLegendItemClassName, courseProgressRowClassName, courseProgressTrackClassName, courseProgressCoverClassName } from "./classNames"

/** One semantic course-progress dimension. */
export type CourseProgressDimension = { readonly id: string; readonly label: string; readonly completed: number; readonly total: number; readonly percent: number; readonly tone: StatusDotTone }
/** Resolved course-progress data. */
export type CourseProgressRowData = { readonly id: string; readonly title?: string; readonly cover?: string | null; readonly percent?: number; readonly percentLabel?: string; readonly actionLabel?: string; readonly trialLabel?: string; readonly isTrial?: boolean; readonly isPending?: boolean; readonly isDisabled?: boolean; readonly dimensions: ReadonlyArray<CourseProgressDimension> }
/** Course destination action. */
export type CourseProgressRowActions = { readonly open?: () => void }
/** Public inputs for the course progress row. */
export type CourseProgressRowProps = { readonly props: CourseProgressRowData; readonly on?: CourseProgressRowActions; readonly isLoading?: boolean }

/** Draw one whole-row course destination with progress dimensions. */
export const CourseProgressRow = (props: CourseProgressRowProps) => {
    const { props: data, on, isLoading = false } = props
    return (
        <PressableSurface label={data.title ?? "Course"} press={on?.open} disabled={isLoading || data.isPending === true || data.isDisabled === true} hover="label">
            <div className={courseProgressRowClassName}>
                <IconTile source={iconSourceFor("course", "leading")} artwork={data.cover ? <img src={data.cover} alt="" className={courseProgressCoverClassName} /> : undefined} tone={"accent"} size={"md"} isSkeleton={isLoading} />
                <div className={courseProgressBodyClassName}>
                    <div className={courseProgressHeadingClassName}><Text size={"md"} weight={"semibold"} isSkeleton={isLoading}>{data.title}</Text>{data.isTrial === true && !isLoading ? <Badge tone={"neutral"}>{data.trialLabel}</Badge> : null}<Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.percentLabel}</Text></div>
                    <div className={courseProgressTrackClassName}>{data.dimensions.map((dimension) => <Progress key={dimension.id} label={dimension.label} value={dimension.percent} isSkeleton={isLoading} />)}</div>
                    <div className={courseProgressLegendClassName}>{data.dimensions.map((dimension) => <span className={courseProgressLegendItemClassName} key={dimension.id}><StatusDot props={{ tone: dimension.tone, label: dimension.label }} isLoading={isLoading} /><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{`${dimension.label} · ${dimension.completed}/${dimension.total}`}</Text></span>)}</div>
                    {data.actionLabel === undefined ? null : <DestinationCue props={{ label: data.actionLabel }} isLoading={isLoading} />}
                </div>
            </div>
        </PressableSurface>
    )
}
