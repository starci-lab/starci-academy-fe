import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@/components/leaves/Badge"
import { DestinationCue } from "@/components/leaves/DestinationCue"
import { IconTile } from "@/components/leaves/IconTile"
import { Progress } from "@/components/leaves/Progress"
import { StatusDot, type StatusDotTone } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import { courseProgressBodyClassName, courseProgressHeadingClassName, courseProgressLegendClassName, courseProgressLegendItemClassName, courseProgressRowClassName, courseProgressTrackClassName } from "./classNames"

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
                <IconTile props={{ icon: "course", image: data.cover, tone: "accent", size: "md" }} isLoading={isLoading} />
                <div className={courseProgressBodyClassName}>
                    <div className={courseProgressHeadingClassName}><Text props={{ content: data.title, size: "md", weight: "semibold", isPressLabel: true }} isLoading={isLoading} />{data.isTrial === true && !isLoading ? <Badge props={{ content: data.trialLabel, tone: "warning" }} /> : null}<Text props={{ content: data.percentLabel, size: "xs", tone: "muted" }} isLoading={isLoading} /></div>
                    <div className={courseProgressTrackClassName}>{data.dimensions.map((dimension) => <Progress key={dimension.id} props={{ value: dimension.percent, label: dimension.label }} isLoading={isLoading} />)}</div>
                    <div className={courseProgressLegendClassName}>{data.dimensions.map((dimension) => <span className={courseProgressLegendItemClassName} key={dimension.id}><StatusDot props={{ tone: dimension.tone, label: dimension.label }} isLoading={isLoading} /><Text props={{ content: `${dimension.label} · ${dimension.completed}/${dimension.total}`, size: "xs", tone: "muted" }} isLoading={isLoading} /></span>)}</div>
                    {data.actionLabel === undefined ? null : <DestinationCue props={{ label: data.actionLabel }} isLoading={isLoading} />}
                </div>
            </div>
        </PressableSurface>
    )
}
