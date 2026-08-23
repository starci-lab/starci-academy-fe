import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { PersonalProjectHistoryDrawer } from "@/components/overlays/learn/PersonalProjectHistoryDrawer"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

/** One structured grading finding attached to the selected attempt. */
export type CoursePersonalProjectResultFeedback = {
    readonly id: string
    readonly message: string
    readonly location?: string
    readonly suggestion?: string
}
/** One immutable grading attempt available for selection in result history. */
export type CoursePersonalProjectResultAttempt = {
    readonly id: string
    readonly attemptNumber: number
    readonly score: number
    readonly passed: boolean
    readonly processedAt?: string
    readonly servedModel?: string
}
/** Localized result-page words and score/history formatters. */
export type CoursePersonalProjectResultLabels = {
    readonly back: string
    readonly attempt: (number: number) => string
    readonly score: (score: number, maximum: number) => string
    readonly passed: string
    readonly needsWork: string
    readonly feedback: string
    readonly history: string
    readonly historySummary: (count: number) => string
    readonly selectAttempt: (number: number, score: number) => string
    readonly previous: string
    readonly next: string
    readonly nextTask: string
    readonly retryTask: string
}

/** Selected grading evidence, history page and actions consumed by the pure result page. */
export type PersonalProjectResultBlockProps = {
    readonly state: "pending" | "ready" | "partial" | "empty" | "failed"
    readonly props: {
        readonly title: string
        /** Result and feedback transport states are owned by this result block. */
        readonly resultState?: "pending" | "ready" | "empty" | "failed"
        readonly feedbackState?: "pending" | "ready" | "failed"
        readonly description: string
        readonly maximumScore: number
        readonly selectedAttempt?: CoursePersonalProjectResultAttempt
        readonly feedbacks: ReadonlyArray<CoursePersonalProjectResultFeedback>
        readonly notice?: string
        readonly labels: CoursePersonalProjectResultLabels
    }
    /** Coordination-only identity and visibility inputs for the independently connected history drawer. */
    readonly courseId?: string
    readonly taskId: string
    readonly historyOpen: boolean
    readonly selectedAttemptId?: string
    readonly on?: {
        readonly back?: () => void
        readonly nextTask?: () => void
        readonly retryTask?: () => void
        readonly openHistory?: () => void
        readonly dismissHistory?: () => void
        readonly selectHistory?: (attempt: CoursePersonalProjectResultAttempt) => void
    }
}

/** Draw selected grading evidence; the independently stateful history drawer is composed by the connected owner. */
export const PersonalProjectResultBase = (input: PersonalProjectResultBlockProps) => {
    const resultState = input.props.resultState ?? input.state
    const feedbackState = input.props.feedbackState ?? (input.state === "partial" ? "failed" : "ready")
    const loading = resultState === "pending"
    const attempt = input.props.selectedAttempt
    const feedback = input.props.feedbacks.map((item) => defineContractComponent("personal-project-feedback-row", {
        message: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text props={{ content: item.message, size: "sm", weight: "semibold" }} />
        )),
        ...(item.location === undefined ? {} : {
            location: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: item.location, size: "xs", tone: "muted" }} />
            )),
        }),
        ...(item.suggestion === undefined ? {} : {
            suggestion: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.suggestion, size: "sm" }} />),
        }),
    }))
    return <>
        <Tree contract="personal-project-result-workspace" render={defineContractComponent("personal-project-result-workspace", {
            header: defineContractComponent("personal-project-result-header", {
                back: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.back, size: "sm" }} on={{ press: input.on?.back }} />),
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />),
                description: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.description }} isLoading={loading} />),
            }),
            ...(attempt === undefined ? {} : {
                summary: defineContractProjection("personal-project-result-summary", () => <SurfaceCard
                    contract="personal-project-result-summary"
                    render={defineContractComponent("personal-project-result-summary", {
                        attempt: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: input.props.labels.attempt(attempt.attemptNumber), size: "sm", tone: "muted" }} />
                        )),
                        score: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.labels.score(attempt.score, input.props.maximumScore), level: 2 }} />
                        )),
                        verdict: defineLeafComponent("badge", {}, () => (
                            <Badge props={{ content: attempt.passed ? input.props.labels.passed : input.props.labels.needsWork, tone: attempt.passed ? "success" : "warning" }} />
                        )),
                        model: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: [attempt.servedModel, attempt.processedAt].filter(Boolean).join(" · "), size: "xs", tone: "muted" }} />
                        )),
                    })}
                />),
            }),
            ...(feedback.length === 0 ? {} : {
                feedback: defineContractProjection("personal-project-feedback-list", () => <SurfaceCard
                    contract="personal-project-feedback-list"
                    render={defineContractComponent("personal-project-feedback-list", {
                        title: defineLeafComponent("text", { weight: "semibold" }, () => <Text props={{ content: input.props.labels.feedback, weight: "semibold" }} />),
                        feedback,
                    })}
                />),
            }),
            ...(input.props.notice === undefined ? {} : {
                notice: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.notice, live: resultState === "failed" || feedbackState === "failed" ? "assertive" : "polite" }} isLoading={loading} />),
            }),
            actions: defineContractComponent("stacked-peer-controls", { control: [
                defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.history }} on={{ press: input.on?.openHistory }} isLoading={loading} />),
                defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.retryTask }} on={{ press: input.on?.retryTask }} isLoading={loading} />),
                defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.nextTask, variant: "primary", disabled: attempt?.passed !== true }} on={{ press: input.on?.nextTask }} isLoading={loading} />),
            ] }),
        })} />
        <PersonalProjectHistoryDrawer
            isOpen={input.historyOpen}
            courseId={input.courseId}
            taskId={input.taskId}
            selectedAttemptId={input.selectedAttemptId}
            onDismiss={input.on?.dismissHistory ?? (() => undefined)}
            onSelect={input.on?.selectHistory}
        />
    </>
}

/** Source-level ownership marker for the pure learning page. */
export const meta = { world: "pure", domain: "learn" } as const
