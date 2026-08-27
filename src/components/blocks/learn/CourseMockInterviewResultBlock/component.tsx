import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
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
import { SurfaceCard } from "@starci/grammar/core"

/** Finite situations shown by the result route. */
export type CourseMockInterviewResultState = "grading" | "gradingFailed" | "ready" | "failed"

/** One scored rubric row in the debrief. */
export type CourseMockInterviewScoreRow = {
    readonly id: string
    readonly label: string
    readonly score: number
    readonly max: number
}

/** One backend-authored comparison between a candidate answer and its expected coverage. */
export type CourseMockInterviewQuestionReview = {
    readonly id: string
    readonly title: string
    readonly answer: string
    readonly feedback: string
    readonly scoreLabel: string
}

/** Resolved debrief data consumed by the pure result page. */
export type CourseMockInterviewResultData = {
    /** Grading/debrief transport state owned by the result block. */
    readonly resultState?: CourseMockInterviewResultState
    readonly title: string
    readonly description: string
    readonly journeyLabel?: string
    readonly journeyStageLabel?: string
    readonly gradingLabel: string
    readonly gradingFailedLabel: string
    readonly gradingFailureDetail: string
    readonly gradingAttemptLabel?: string
    readonly retryingLabel: string
    readonly failedLabel: string
    readonly scoreLabel: string
    readonly score?: number
    readonly verdict?: string
    readonly promptTitle?: string
    readonly phaseTitle: string
    readonly phases: ReadonlyArray<CourseMockInterviewScoreRow>
    readonly strengthsTitle: string
    readonly strengths: ReadonlyArray<string>
    readonly gapsTitle: string
    readonly gaps: ReadonlyArray<string>
    readonly reviewsTitle: string
    readonly reviews: ReadonlyArray<CourseMockInterviewQuestionReview>
    readonly retryLabel: string
    readonly abandonLabel: string
    readonly newSessionLabel: string
    readonly openTranscriptLabel: string
    readonly openHistoryLabel: string
    readonly returnToCourseLabel: string
    readonly actionsTitle?: string
    readonly sessionSummaryTitle: string
    readonly sessionSummaryPromptLabel: string
    readonly sessionSummaryQuestionLabel: string
    readonly recommendationTitle: string
    readonly recommendation?: string
    readonly retrying: boolean
    readonly canRetryGrading: boolean
}

/** User intents emitted by the pure result page. */
export type CourseMockInterviewResultActions = {
    readonly retry?: () => void
    readonly abandon?: () => void
    readonly newSession?: () => void
    readonly openTranscript?: () => void
    readonly openHistory?: () => void
    readonly returnToCourse?: () => void
}

/** Public boundary of the presentational result twin. */
export type CourseMockInterviewResultPageProps = {
    readonly state: CourseMockInterviewResultState
    readonly props: CourseMockInterviewResultData
    readonly on?: CourseMockInterviewResultActions
}

/** Presentational debrief for a URL-addressable graded interview attempt. */
export const CourseMockInterviewResultBlockBase = (input: CourseMockInterviewResultPageProps) => {
    const resultState = input.props.resultState ?? input.state
    const loading = resultState === "grading"
    const ready = resultState === "ready"
    const action = resultState === "gradingFailed" ? [
        ...(input.props.canRetryGrading ? [defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.retrying ? input.props.retryingLabel : input.props.retryLabel, variant: "primary", isPending: input.props.retrying }} on={{ press: input.on?.retry }} />
        ))] : []),
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.abandonLabel, variant: "outline", disabled: input.props.retrying }} on={{ press: input.on?.abandon }} />
        )),
    ] : [
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.newSessionLabel, variant: "primary" }} on={{ press: input.on?.newSession }} />
        )),
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.openTranscriptLabel, variant: "outline" }} on={{ press: input.on?.openTranscript }} />
        )),
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.openHistoryLabel, variant: "outline" }} on={{ press: input.on?.openHistory }} />
        )),
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.returnToCourseLabel, variant: "outline" }} on={{ press: input.on?.returnToCourse }} />
        )),
    ]
    const summarySurface = (
        <SurfaceCard ariaLabel={input.props.scoreLabel}>
            <Tree
                contract="mock-interview-result-summary"
                render={defineContractComponent("mock-interview-result-summary", {
                    scoreLabel: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: input.props.scoreLabel, size: "xs", tone: "muted" }} />
                    )),
                    score: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: `${input.props.score ?? 0}/100`, level: 1 }} />
                    )),
                    verdict: defineContractComponent("learn-page-title-pair", {
                        title: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.verdict, level: 2 }} />
                        )),
                        description: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: input.props.promptTitle, size: "sm", tone: "muted" }} />
                        )),
                    }),
                })}
            />
        </SurfaceCard>
    )
    const rubricSurface = (
        <SurfaceCard ariaLabel={input.props.phaseTitle}>
            <Tree
                contract="mock-interview-result-rubric"
                render={defineContractComponent("mock-interview-result-rubric", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.phaseTitle, level: 2 }} />
                    )),
                    phase: input.props.phases.map((item) => defineCompositeComponent("labelled-progress-row", {}, () => (
                        <LabelledProgressRow
                            props={{
                                id: item.id,
                                title: item.label,
                                percent: item.max === 0 ? 0 : (item.score / item.max) * 100,
                                percentText: `${item.score}/${item.max}`,
                            }}
                        />
                    ))),
                })}
            />
        </SurfaceCard>
    )
    const strengthsSurface = (
        <SurfaceCard ariaLabel={input.props.strengthsTitle}>
            <Tree
                contract="mock-interview-result-insight"
                render={defineContractComponent("mock-interview-result-insight", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.strengthsTitle, level: 2 }} />
                    )),
                    item: input.props.strengths.map((item) => defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: item, size: "sm" }} />
                    ))),
                })}
            />
        </SurfaceCard>
    )
    const gapsSurface = (
        <SurfaceCard ariaLabel={input.props.gapsTitle}>
            <Tree
                contract="mock-interview-result-insight"
                render={defineContractComponent("mock-interview-result-insight", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.gapsTitle, level: 2 }} />
                    )),
                    item: input.props.gaps.map((item) => defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: item, size: "sm" }} />
                    ))),
                })}
            />
        </SurfaceCard>
    )
    const reviewsSurface = (
        <SurfaceCard ariaLabel={input.props.reviewsTitle}>
            <Tree
                contract="mock-interview-result-reviews"
                render={defineContractComponent("mock-interview-result-reviews", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.reviewsTitle, level: 2 }} />
                    )),
                    review: input.props.reviews.map((item) => defineCompositeComponent("evidence-row", {}, () => (
                        <EvidenceRow
                            props={{
                                title: `${item.title}: ${item.answer}`,
                                subtitle: item.feedback,
                                fact: item.scoreLabel,
                            }}
                        />
                    ))),
                })}
            />
        </SurfaceCard>
    )
    const actionsSurface = (
        <SurfaceCard
            ariaLabel={input.props.actionsTitle ?? input.props.newSessionLabel}
            state={loading ? "pending" : "neutral"}
        >
            <Tree
                contract="mock-interview-result-actions"
                render={defineContractComponent("mock-interview-result-actions", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.actionsTitle ?? input.props.newSessionLabel, level: 2 }} />
                    )),
                    action,
                })}
            />
        </SurfaceCard>
    )
    const recommendationSurface = input.props.recommendation === undefined ? null : (
        <SurfaceCard ariaLabel={input.props.recommendationTitle}>
            <Tree contract="mock-interview-result-recommendation" render={defineContractComponent("mock-interview-result-recommendation", {
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.recommendationTitle, level: 2 }} />),
                description: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: input.props.recommendation ?? "", size: "sm" }} />),
            })} />
        </SurfaceCard>
    )
    const sessionSummarySurface = (
        <SurfaceCard ariaLabel={input.props.sessionSummaryTitle}>
            <Tree contract="mock-interview-report-session-summary" render={defineContractComponent("mock-interview-report-session-summary", {
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.sessionSummaryTitle, level: 2 }} />),
                prompt: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: `${input.props.sessionSummaryPromptLabel}: ${input.props.promptTitle ?? "—"}`, size: "sm" }} />
                )),
                questions: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: `${input.props.sessionSummaryQuestionLabel}: ${input.props.reviews.length}`, size: "sm", tone: "muted" }} />
                )),
            })} />
        </SurfaceCard>
    )

    return (
        <Tree
            contract={"course-mock-interview-result-page"}
            render={defineContractComponent("course-mock-interview-result-page", {
                header: defineContractComponent("learn-page-title-pair", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                    )),
                    description: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />
                    )),
                }),
                ...(resultState === "failed" ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{ message: input.props.failedLabel, actionLabel: input.props.retryLabel }}
                            on={{ act: input.on?.retry }}
                        />
                    )),
                } : {}),
                ...(resultState === "grading" ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice props={{ message: input.props.gradingLabel }} />
                    )),
                    grading: defineLeafComponent("progress", {}, () => (
                        <Progress props={{ label: input.props.gradingLabel }} isLoading />
                    )),
                } : {}),
                ...(resultState === "gradingFailed" ? {
                    gradingFailure: defineContractComponent("mock-interview-grading-recovery", {
                        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.gradingFailedLabel, level: 2 }} />),
                        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.gradingFailureDetail, size: "sm", tone: "muted" }} />),
                        attempt: input.props.gradingAttemptLabel === undefined ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: input.props.gradingAttemptLabel ?? "", size: "xs", tone: "muted" }} />),
                    }),
                } : {}),
                ...(ready ? {
                    workspace: defineContractComponent("mock-interview-result-workspace", {
                        primary: defineContractComponent("mock-interview-result-primary", {
                            summary: defineContractProjection("mock-interview-result-summary", () => summarySurface),
                            rubric: defineContractProjection("mock-interview-result-rubric", () => rubricSurface),
                            insights: defineContractComponent("mock-interview-result-insights", {
                                strengths: defineContractProjection("mock-interview-result-insight", () => strengthsSurface),
                                gaps: defineContractProjection("mock-interview-result-insight", () => gapsSurface),
                            }),
                            ...(input.props.reviews.length === 0 ? {} : {
                                reviews: defineContractProjection("mock-interview-result-reviews", () => reviewsSurface),
                            }),
                            ...(recommendationSurface === null ? {} : {
                                recommendation: defineContractProjection("mock-interview-result-recommendation", () => recommendationSurface),
                            }),
                        }),
                        rail: defineContractComponent("mock-interview-result-rail", {
                            summary: defineContractProjection("mock-interview-report-session-summary", () => sessionSummarySurface),
                            actions: defineContractProjection("mock-interview-result-actions", () => actionsSurface),
                        }),
                    }),
                } : {}),
                ...(ready ? {} : {
                    actions: defineContractProjection("mock-interview-result-actions", () => actionsSurface),
                }),
            })}
        />
    )
}

/** Source-level ownership marker for the pure result twin. */
export const meta = { world: "pure", domain: "learn" } as const
