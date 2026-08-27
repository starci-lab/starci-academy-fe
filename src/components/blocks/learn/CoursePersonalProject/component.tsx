import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { LeadingNumber } from "@starci/grammar/core"
import {
    coursePersonalProjectClassName,
    projectCompletionClassName,
    projectHeaderClassName,
    projectMilestoneClassName,
    projectNextTaskClassName,
    projectTaskCardClassName,
    projectTaskGridClassName,
    projectTaskHeadingClassName,
} from "./classNames"

/** One task destination in the current milestone. */
export type CoursePersonalProjectTaskRow = { readonly id: string; readonly position: number; readonly title: string; readonly status: string; readonly actionLabel: string; readonly isCurrent?: boolean }
/** The next executable task shown before project completion evidence. */
export type CoursePersonalProjectNextTask = { readonly id: string; readonly position: string; readonly title: string }
/** Genuine whole-block states; only these alter the block's notices and resting geometry. */
export type CoursePersonalProjectState = "pending" | "ready" | "empty" | "failed"
/** Pure project dashboard data and actions. */
export type CoursePersonalProjectProps = {
    readonly state: CoursePersonalProjectState
    readonly data: {
        readonly breadcrumbLabel: string
        readonly courseTitle?: string
        readonly title: string
        readonly nextTask?: CoursePersonalProjectNextTask
        readonly continueLabel: string
        readonly allCompleteLabel: string
        readonly completionLabel: string
        readonly completionPercent?: number
        readonly completionFacts: ReadonlyArray<string>
        readonly milestoneTitle?: string
        readonly tasks: ReadonlyArray<CoursePersonalProjectTaskRow>
        readonly notice?: string
        readonly retryLabel: string
    }
    readonly on?: { readonly openCourse?: () => void; readonly openTask?: (id: string) => void; readonly retry?: () => void }
}

/** Render the legacy-shaped capstone dashboard without owning transport or routing. */
export const CoursePersonalProjectBase = (props: CoursePersonalProjectProps) => {
    const loading = props.state === "pending"
    const tasks = loading && props.data.tasks.length === 0
        ? Array.from({ length: 4 }, (_, index): CoursePersonalProjectTaskRow => ({ id: `pending-${index}`, position: index + 1, title: "", status: "", actionLabel: props.data.continueLabel }))
        : props.data.tasks
    return <section className={coursePersonalProjectClassName}>
        <div className={projectHeaderClassName}>
            {props.data.courseTitle === undefined && !loading ? null : <Breadcrumbs props={{ label: props.data.breadcrumbLabel, steps: [{ id: "course", label: props.data.courseTitle ?? "" }, { id: "project", label: props.data.title }] }} on={loading ? undefined : { course: props.on?.openCourse }} isLoading={loading} />}
            <Heading props={{ content: props.data.title, level: 1 }} isLoading={loading} />
        </div>
        {props.state === "empty" || props.state === "failed" ? null : <SurfaceCard isLoading={loading}>
            <div className={projectNextTaskClassName}>
                {props.data.nextTask === undefined ? null : <Text props={{ content: props.data.nextTask.position, size: "xs", tone: "muted" }} isLoading={loading} />}
                {props.data.nextTask === undefined && !loading ? null : <Heading props={{ content: props.data.nextTask?.title, level: 2 }} isLoading={loading} />}
                {props.data.nextTask === undefined && !loading ? null : <Button props={{ label: props.data.continueLabel, variant: "primary", size: "md", icon: "next", iconPlacement: "trailing" }} on={loading ? undefined : { press: () => props.data.nextTask === undefined ? undefined : props.on?.openTask?.(props.data.nextTask.id) }} isLoading={loading} />}
                {props.data.nextTask !== undefined || loading ? null : <Text props={{ content: props.data.allCompleteLabel, size: "sm", tone: "muted" }} />}
            </div>
        </SurfaceCard>}
        <div className={projectCompletionClassName}>
            <Text props={{ content: props.data.completionLabel, size: "sm", weight: "medium" }} isLoading={loading} />
            <Progress props={{ value: props.data.completionPercent, label: props.data.completionLabel }} isLoading={loading} />
            <Text props={{ content: props.data.completionFacts.join(" · "), size: "sm", tone: "muted" }} isLoading={loading} />
        </div>
        {props.data.milestoneTitle === undefined && !loading ? null : <div className={projectMilestoneClassName}>
            <Heading props={{ content: props.data.milestoneTitle, level: 2 }} isLoading={loading} />
            <div className={projectTaskGridClassName}>{tasks.map((task) => <SurfaceCard key={task.id} isLoading={loading}>
                <div className={projectTaskCardClassName}>
                    <div className={projectTaskHeadingClassName}><LeadingNumber position={task.position} /><Heading props={{ content: task.title, level: 3 }} isLoading={loading} /></div>
                    <Text props={{ content: task.status, size: "xs", tone: "muted" }} isLoading={loading} />
                    <Button props={{ label: task.actionLabel, variant: "tertiary", size: "sm", icon: "next", iconPlacement: "trailing" }} on={loading ? undefined : { press: () => props.on?.openTask?.(task.id) }} isLoading={loading} />
                </div>
            </SurfaceCard>)}</div>
        </div>}
        {props.data.notice === undefined ? null : <EmptyNotice props={{ message: props.data.notice, actionLabel: props.state === "failed" ? props.data.retryLabel : undefined }} on={{ act: props.on?.retry }} />}
    </section>
}
