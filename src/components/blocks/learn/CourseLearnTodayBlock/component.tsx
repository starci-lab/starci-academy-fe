import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { CourseLearningSignalDetail, type CourseLearningSignalDetailProps } from "@/components/blocks/learn/CourseLearningSignalDetail"
import { CourseLearningSignals, type CourseLearningSignalsProps } from "@/components/blocks/learn/CourseLearningSignals"
import { CourseNextActions, type CourseNextActionsProps } from "@/components/blocks/learn/CourseNextActions"
import { CourseProgressOverview, type CourseProgressOverviewProps } from "@/components/blocks/learn/CourseProgressOverview"
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

/** The settled route-level situation of the course dashboard. */
export type CourseLearnTodayState = "pending" | "ready" | "empty" | "failed"

/** One backend-proven next step displayed by the dashboard. */
export type CourseLearnTodayItem = {
    readonly id: string
    readonly title: string
    readonly kind: string
    readonly actionLabel: string
}

/** Accepted block inputs that make up the desktop dashboard. */
export type CourseLearnTodayDashboard = {
    readonly progress: CourseProgressOverviewProps
    readonly nextActions: CourseNextActionsProps
    readonly signals: CourseLearningSignalsProps
    readonly signalDetail: CourseLearningSignalDetailProps
}

/** Resolved copy, mobile alternatives and desktop dashboard evidence. */
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
    readonly dashboard: CourseLearnTodayDashboard
    readonly emptyMessage: string
    readonly failedMessage: string
    readonly retryLabel: string
}

/** Navigation, selection and recovery events reported by the pure dashboard page. */
export type CourseLearnTodayActions = {
    readonly open?: (id: string) => void
    readonly selectSignal?: (id: string) => void
    readonly openSignal?: () => void
    readonly retry?: () => void
}

/** Props accepted by the pure dashboard page twin. */
export type CourseLearnTodayPageProps = {
    readonly blockState: CourseLearnTodayState
    readonly mobileView: Extract<LearnMobileView, "today" | "course" | "progress">
    readonly props: CourseLearnTodayData
    readonly on?: CourseLearnTodayActions
}

const resumeCard = (
    item: CourseLearnTodayItem,
    open: CourseLearnTodayActions["open"],
    isLoading = false,
) => defineContractComponent("resume-item-card", {
    title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
        <Text props={{ content: item.title, size: "sm", weight: "medium" }} isLoading={isLoading} />
    )),
    kind: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
        <Text props={{ content: item.kind, size: "sm", tone: "muted" }} isLoading={isLoading} />
    )),
    resume: isLoading ? undefined : defineLeafComponent("see-more-link", {}, () => (
        <SeeMoreLink props={{ label: item.actionLabel }} on={{ press: () => open?.(item.id) }} />
    )),
})

const dashboardContent = (input: CourseLearnTodayPageProps) =>
    defineContractComponent("course-learning-dashboard-grid", {
        primary: defineContractComponent("course-learning-dashboard-primary-column", {
            progress: defineContractProjection("course-progress-overview", () => (
                <CourseProgressOverview {...input.props.dashboard.progress} on={{ retry: input.on?.retry }} />
            )),
            actions: defineContractProjection("next-action-list", () => (
                <CourseNextActions
                    {...input.props.dashboard.nextActions}
                    on={{ open: input.on?.open, retry: input.on?.retry }}
                />
            )),
        }),
        signals: defineContractComponent("course-learning-dashboard-signal-column", {
            signals: defineContractProjection("course-learning-signal-list", () => (
                <CourseLearningSignals
                    {...input.props.dashboard.signals}
                    on={{ select: input.on?.selectSignal, retry: input.on?.retry }}
                />
            )),
            detail: defineContractProjection("course-learning-signal-detail-stack", () => (
                <CourseLearningSignalDetail
                    {...input.props.dashboard.signalDetail}
                    on={{ open: input.on?.openSignal, retry: input.on?.retry }}
                />
            )),
        }),
    })

const mobileContent = (
    input: CourseLearnTodayPageProps,
    placeholder: CourseLearnTodayItem,
    isLoading: boolean,
) => {
    const showToday = input.mobileView === "today"
    const showCourse = input.mobileView === "course"
    const showProgress = input.mobileView === "progress"
    return defineContractComponent("course-learning-dashboard-mobile", {
        ...(!showToday ? {} : {
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
        ...(!showCourse ? {} : {
            course: defineContractProjection("resume-item-card", () => (
                <SurfaceCard
                    contract="resume-item-card"
                    props={{ label: input.props.courseLabel }}
                    render={resumeCard(input.props.course, input.on?.open, isLoading)}
                    isLoading={isLoading}
                />
            )),
        }),
        ...(!showProgress ? {} : {
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
    })
}

/** Draw the mobile alternatives and the accepted desktop command-center dashboard. */
export const CourseLearnTodayBlockBase = (input: CourseLearnTodayPageProps) => {
    const isLoading = input.blockState === "pending"
    const placeholder: CourseLearnTodayItem = {
        id: "pending",
        title: "",
        kind: "",
        actionLabel: input.props.course.actionLabel,
    }
    const notice = input.blockState === "failed"
        ? { message: input.props.failedMessage, actionLabel: input.props.retryLabel }
        : input.blockState === "empty"
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
                ...(notice === undefined ? {
                    dashboard: dashboardContent(input),
                    mobile: mobileContent(input, placeholder, isLoading),
                } : {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{ icon: input.blockState === "failed" ? "retry" : "course", ...notice }}
                            on={{ act: input.on?.retry }}
                        />
                    )),
                }),
            })}
        />
    )
}


