import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
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
export type CoursePersonalProjectResultPageProps = {
    readonly state: "pending" | "ready" | "partial" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly description: string
        readonly maximumScore: number
        readonly selectedAttempt?: CoursePersonalProjectResultAttempt
        readonly attempts: ReadonlyArray<CoursePersonalProjectResultAttempt>
        readonly attemptCount: number
        readonly feedbacks: ReadonlyArray<CoursePersonalProjectResultFeedback>
        readonly historyOpen: boolean
        readonly historyPage: number
        readonly historyPageSize: number
        readonly notice?: string
        readonly labels: CoursePersonalProjectResultLabels
    }
    readonly on?: {
        readonly back?: () => void
        readonly nextTask?: () => void
        readonly retryTask?: () => void
        readonly openHistory?: () => void
        readonly closeHistory?: () => void
        readonly selectAttempt?: (id: string) => void
        readonly previousHistoryPage?: () => void
        readonly nextHistoryPage?: () => void
    }
}

/** Draws selected grading evidence and the selectable, paged attempt-history drawer. */
export const CoursePersonalProjectResultPageBase = (input: CoursePersonalProjectResultPageProps) => {
    const loading = input.state === "pending"
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
    const historyRows = input.props.attempts.map((item) => defineContractComponent("personal-project-attempt-row", {
        action: defineLeafComponent("button", {}, () => (
            <Button
                props={{
                    label: input.props.labels.selectAttempt(item.attemptNumber, item.score),
                    variant: item.id === attempt?.id ? "primary" : "secondary",
                    size: "sm",
                }}
                on={{ press: () => input.on?.selectAttempt?.(item.id) }}
                isLoading={loading}
            />
        )),
        meta: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text
                props={{
                    content: [item.passed ? input.props.labels.passed : input.props.labels.needsWork, item.servedModel, item.processedAt]
                        .filter(Boolean).join(" · "),
                    size: "xs",
                    tone: "muted",
                }}
                isLoading={loading}
            />
        )),
    }))
    const hasPrevious = input.props.historyPage > 0
    const hasNext = (input.props.historyPage + 1) * input.props.historyPageSize < input.props.attemptCount
    const history = defineContractComponent("personal-project-attempt-history-drawer", {
        summary: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
            <Text props={{ content: input.props.labels.historySummary(input.props.attemptCount), size: "sm", tone: "muted" }} />
        )),
        ...(historyRows.length === 0 ? {
            notice: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.notice, live: input.state === "failed" ? "assertive" : "polite" }} />),
        } : { attempt: historyRows }),
        ...(!hasPrevious && !hasNext ? {} : {
            pagination: defineContractComponent("stacked-peer-controls", { control: [
                defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.labels.previous, disabled: !hasPrevious }} on={{ press: input.on?.previousHistoryPage }} />
                )),
                defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.labels.next, disabled: !hasNext }} on={{ press: input.on?.nextHistoryPage }} />
                )),
            ] }),
        }),
    })

    return <>
        <Tree contract="course-personal-project-result-page" render={defineContractComponent("course-personal-project-result-page", {
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
                notice: defineLeafComponent("text", {}, () => <Text props={{ content: input.props.notice, live: input.state === "failed" ? "assertive" : "polite" }} isLoading={loading} />),
            }),
            actions: defineContractComponent("stacked-peer-controls", { control: [
                defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.history }} on={{ press: input.on?.openHistory }} isLoading={loading} />),
                defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.retryTask }} on={{ press: input.on?.retryTask }} isLoading={loading} />),
                defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.nextTask, variant: "primary", disabled: attempt?.passed !== true }} on={{ press: input.on?.nextTask }} isLoading={loading} />),
            ] }),
        })} />
        <DrawerBranch
            isOpen={input.props.historyOpen}
            title={input.props.labels.history}
            onDismiss={() => input.on?.closeHistory?.()}
            contract="personal-project-attempt-history-drawer"
            render={history}
        />
    </>
}

/** Source-level ownership marker for the pure learning page. */
export const meta = { world: "pure", domain: "learn" } as const
