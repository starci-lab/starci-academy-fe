import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import type { LearnMobileView } from "@/components/layouts/LearnShellLayout/component"

/** The settled loading situation of the Today route. */
export type CourseLearnTodayState = "pending" | "ready" | "empty" | "failed"

/** One backend-proven next step displayed by Today. */
export type CourseLearnTodayItem = {
    readonly id: string
    readonly title: string
    readonly kind: string
    readonly actionLabel: string
}

/** Resolved copy and ranked work rendered by the pure Today page. */
export type CourseLearnTodayData = {
    readonly title: string
    readonly subtitle: string
    readonly primaryLabel: string
    readonly secondaryLabel: string
    readonly courseLabel: string
    readonly progressLabel: string
    readonly progressFact?: string
    readonly progressValue?: number
    readonly primary?: CourseLearnTodayItem
    readonly secondary: ReadonlyArray<CourseLearnTodayItem>
    readonly course: CourseLearnTodayItem
    readonly emptyMessage: string
    readonly failedMessage: string
    readonly retryLabel: string
}

/** Navigation and recovery events reported by the pure Today page. */
export type CourseLearnTodayActions = {
    readonly open?: (id: string) => void
    readonly retry?: () => void
}

/** Props accepted by the pure Today page twin. */
export type CourseLearnTodayPageProps = {
    readonly state: CourseLearnTodayState
    readonly mobileView: Extract<LearnMobileView, "today" | "course" | "progress">
    readonly props: CourseLearnTodayData
    readonly on?: CourseLearnTodayActions
}

const resumeCard = (
    item: CourseLearnTodayItem,
    open: CourseLearnTodayActions["open"],
    isLoading = false,
) => defineContractComponent("resume-item-card", {
    title: defineLeafComponent("text", { size: "md", weight: "medium" }, () => (
        <Text props={{ content: item.title, size: "md", weight: "medium" }} isLoading={isLoading} />
    )),
    kind: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
        <Text props={{ content: item.kind, size: "sm", tone: "muted" }} isLoading={isLoading} />
    )),
    resume: defineLeafComponent("see-more-link", {}, () => (
        <SeeMoreLink props={{ label: item.actionLabel }} on={{ press: () => open?.(item.id) }} isLoading={isLoading} />
    )),
})

/** Draw the selected Today, course or progress mobile composition. */
export const _CourseLearnTodayPage = (input: CourseLearnTodayPageProps) => {
    const isLoading = input.state === "pending"
    const showToday = input.mobileView === "today"
    const showCourse = input.mobileView === "course"
    const showProgress = input.mobileView === "progress"
    const placeholder: CourseLearnTodayItem = {
        id: "pending",
        title: "",
        kind: "",
        actionLabel: input.props.course.actionLabel,
    }
    const notice = input.state === "failed"
        ? { message: input.props.failedMessage, actionLabel: input.props.retryLabel }
        : input.state === "empty"
            ? { message: input.props.emptyMessage }
            : undefined

    return (
        <Tree
            contract="course-learn-today-page"
            render={defineContractComponent("course-learn-today-page", {
                header: defineContractComponent("page-header-stack", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} />
                    )),
                }),
                subtitle: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.subtitle, size: "sm", tone: "muted" }} />
                )),
                ...(notice === undefined ? {} : {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{ icon: input.state === "failed" ? "retry" : "course", ...notice }}
                            on={{ act: input.on?.retry }}
                        />
                    )),
                }),
                ...(!showToday || notice !== undefined ? {} : {
                    primary: defineContractProjection("resume-item-card", () => (
                        <SurfaceCard
                            contract="resume-item-card"
                            props={{ label: input.props.primaryLabel }}
                            render={resumeCard(input.props.primary ?? placeholder, input.on?.open, isLoading)}
                            isLoading={isLoading}
                        />
                    )),
                    ...(!isLoading && input.props.secondary.length === 0 ? {} : {
                        secondary: defineContractProjection("resume-card-grid", () => (
                            <SurfaceCard
                                contract="resume-card-grid"
                                props={{ label: input.props.secondaryLabel, isFrameless: true }}
                                render={defineContractComponent("resume-card-grid", {
                                    card: isLoading
                                        ? [resumeCard(placeholder, input.on?.open, true)]
                                        : input.props.secondary.map((item) => resumeCard(item, input.on?.open)),
                                })}
                            />
                        )),
                    }),
                }),
                ...(!showCourse || notice !== undefined ? {} : {
                    course: defineContractProjection("resume-item-card", () => (
                        <SurfaceCard
                            contract="resume-item-card"
                            props={{ label: input.props.courseLabel }}
                            render={resumeCard(input.props.course, input.on?.open, isLoading)}
                            isLoading={isLoading}
                        />
                    )),
                }),
                ...(!showProgress || notice !== undefined ? {} : {
                    progress: defineContractProjection("label-fact-over-progress", () => (
                        <SurfaceCard
                            contract="label-fact-over-progress"
                            props={{ label: input.props.progressLabel }}
                            render={defineContractComponent("label-fact-over-progress", {
                                line: defineContractComponent("label-with-muted-fact-row", {
                                    label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                                        <Text props={{ content: input.props.progressLabel, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                                    )),
                                    fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                        <Text props={{ content: input.props.progressFact, size: "xs", tone: "muted" }} isLoading={isLoading} />
                                    )),
                                }),
                                progress: defineLeafComponent("progress", {}, () => (
                                    <Progress props={{ label: input.props.progressLabel, value: input.props.progressValue }} isLoading={isLoading} />
                                )),
                            })}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
