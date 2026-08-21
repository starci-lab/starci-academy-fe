import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

/** One task destination in the current milestone. */
export type CoursePersonalProjectTaskRow = {
    readonly id: string
    readonly title: string
    readonly status: string
    readonly actionLabel: string
    readonly isCurrent?: boolean
}

/** The next executable task shown before project-wide completion evidence. */
export type CoursePersonalProjectNextTask = {
    readonly id: string
    readonly position: string
    readonly title: string
}

/** Pure dashboard states, project evidence and navigation actions. */
export type CoursePersonalProjectPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
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
    readonly on?: {
        readonly openCourse?: () => void
        readonly openTask?: (id: string) => void
        readonly retry?: () => void
    }
}

/** Draws the legacy-shaped capstone dashboard without owning transport or routing. */
export const CoursePersonalProjectPageBase = (input: CoursePersonalProjectPageProps) => {
    const loading = input.state === "pending"
    const tasks: ReadonlyArray<CoursePersonalProjectTaskRow> = loading && input.props.tasks.length === 0
        ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, title: "", status: "", actionLabel: input.props.continueLabel }))
        : input.props.tasks
    const header = defineContractComponent("page-header-stack", {
        trail: input.props.courseTitle === undefined && !loading ? undefined : defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    label: input.props.breadcrumbLabel,
                    steps: [
                        { id: "course", label: input.props.courseTitle ?? "" },
                        { id: "project", label: input.props.title },
                    ],
                }}
                on={loading ? undefined : { course: input.on?.openCourse }}
                isLoading={loading}
            />
        )),
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
        )),
    })
    const next = input.state === "empty" || input.state === "failed"
        ? undefined
        : defineContractProjection("course-personal-project-next-task", () => (
            <SurfaceCard
                contract="course-personal-project-next-task"
                render={defineContractComponent("course-personal-project-next-task", {
                    position: input.props.nextTask === undefined
                        ? undefined
                        : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: input.props.nextTask?.position, size: "xs", tone: "muted" }} isLoading={loading} />
                        )),
                    title: input.props.nextTask === undefined && !loading
                        ? undefined
                        : defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.nextTask?.title, level: 2 }} isLoading={loading} />
                        )),
                    action: input.props.nextTask === undefined && !loading
                        ? undefined
                        : defineLeafComponent("button", {}, () => (
                            <Button
                                props={{ label: input.props.continueLabel, variant: "primary", size: "md", icon: "next", iconPlacement: "trailing" }}
                                on={loading ? undefined : { press: () => input.props.nextTask === undefined
                                    ? undefined
                                    : input.on?.openTask?.(input.props.nextTask.id) }}
                                isLoading={loading}
                            />
                        )),
                    completed: input.props.nextTask !== undefined || loading
                        ? undefined
                        : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: input.props.allCompleteLabel, size: "sm", tone: "muted" }} />
                        )),
                })}
                isLoading={loading}
            />
        ))
    const completion = defineContractComponent("course-personal-project-completion-summary", {
        label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
            <Text props={{ content: input.props.completionLabel, size: "sm", weight: "medium" }} isLoading={loading} />
        )),
        progress: defineLeafComponent("progress", {}, () => (
            <Progress
                props={{ value: input.props.completionPercent, label: input.props.completionLabel }}
                isLoading={loading}
            />
        )),
        fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
            <Text props={{ content: input.props.completionFacts.join(" · "), size: "sm", tone: "muted" }} isLoading={loading} />
        )),
    })
    const milestone = input.props.milestoneTitle === undefined && !loading
        ? undefined
        : defineContractComponent("course-personal-project-current-milestone", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: input.props.milestoneTitle, level: 2 }} isLoading={loading} />
            )),
            tasks: defineContractComponent("course-personal-project-current-task-grid", {
                task: tasks.map((task) => defineContractProjection("course-personal-project-task-card", () => (
                    <SurfaceCard
                        contract="course-personal-project-task-card"
                        render={defineContractComponent("course-personal-project-task-card", {
                            title: defineLeafComponent("heading", {}, () => (
                                <Heading props={{ content: task.title, level: 3 }} isLoading={loading} />
                            )),
                            status: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text props={{ content: task.status, size: "xs", tone: "muted" }} isLoading={loading} />
                            )),
                            action: defineLeafComponent("button", {}, () => (
                                <Button
                                    props={{ label: task.actionLabel, variant: "tertiary", size: "sm", icon: "next", iconPlacement: "trailing" }}
                                    on={loading ? undefined : { press: () => input.on?.openTask?.(task.id) }}
                                    isLoading={loading}
                                />
                            )),
                        })}
                        isLoading={loading}
                    />
                ))),
            }),
        })
    const notice = input.props.notice === undefined
        ? undefined
        : defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: input.props.notice ?? "",
                    actionLabel: input.state === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.on?.retry }}
            />
        ))
    return (
        <Tree
            contract="course-personal-project-page"
            render={defineContractComponent("course-personal-project-page", {
                header,
                next,
                completion,
                milestone,
                notice,
            })}
        />
    )
}

/** Architectural identity for the pure personal-project dashboard twin. */
export const meta = { world: "pure", domain: "learn" } as const
