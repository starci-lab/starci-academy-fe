import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { ChallengeAttemptHistoryDrawer } from "@/components/overlays/learn/ChallengeAttemptHistoryDrawer"

/** One backend-authored scorer finding shown without client interpretation. */
export type CourseLearnChallengeFeedback = {
    readonly id: string
    readonly message: string
    readonly detail?: string
    readonly severity: "low" | "medium" | "high"
    readonly location?: string
    readonly suggestion?: string
}

/** Pure result facts, finite state and route actions. */
export type ChallengeResultBlockProps = {
    readonly blockState: "pending" | "ready" | "unavailable" | "failed"
    readonly props: {
        readonly title: string
        readonly description: string
        readonly scoreLine?: string
        readonly shortFeedback?: string
        readonly feedbacks: ReadonlyArray<CourseLearnChallengeFeedback>
        readonly notice?: string
        readonly reloadLabel: string
        readonly retryLabel: string
        readonly nextLabel: string
        readonly historyLabel?: string
        readonly courseId?: string
        readonly submissionId?: string
        readonly selectedAttemptId?: string
        readonly isHistoryOpen?: boolean
        readonly evaluationTitle?: string
        readonly evaluationDetail?: string
        readonly realtimeStatus?: string
        readonly unavailableTitle?: string
        readonly unavailableDetail?: string
        readonly outcomeLabel?: string
        readonly confidenceLine?: string
        readonly uncertainty?: string
        readonly nextAction?: string
        readonly breadcrumbLabel?: string
        readonly courseTitle?: string
        readonly moduleTitle?: string
        readonly contentTitle?: string
    }
    readonly on?: {
        readonly reload?: () => void
        readonly retry?: () => void
        readonly next?: () => void
        readonly openHistory?: () => void
        readonly closeHistory?: () => void
        readonly selectHistoryAttempt?: (attemptId: string, attemptGroupId?: string) => void
        readonly openCourse?: () => void
        readonly openModule?: () => void
        readonly openContent?: () => void
    }
}

/** Draws pending, graded and failed challenge-result states without querying. */
export const ChallengeResultBase = (input: ChallengeResultBlockProps) => {
    const loading = input.blockState === "pending"
    const breadcrumb = defineLeafComponent("breadcrumbs", {}, () => (
        <Breadcrumbs
            props={{
                label: input.props.breadcrumbLabel ?? "Course challenge path",
                showFullTrail: true,
                steps: [
                    { id: "course", label: input.props.courseTitle ?? "Course" },
                    { id: "module", label: input.props.moduleTitle ?? "Module" },
                    { id: "content", label: input.props.contentTitle ?? "Lesson" },
                    { id: "challenge", label: input.props.title },
                ],
            }}
            on={{ course: input.on?.openCourse, module: input.on?.openModule, content: input.on?.openContent }}
        />
    ))
    if (input.blockState === "pending" || input.blockState === "unavailable") {
        const unavailable = input.blockState === "unavailable"
        return (
            <Tree contract="challenge-result-page-document" render={defineContractComponent("challenge-result-page-document", {
                breadcrumb,
                evaluation: defineContractComponent("challenge-evaluation-status", {
                    title: defineLeafComponent("text", { weight: "semibold" }, () => (
                        <Text props={{ content: unavailable ? input.props.unavailableTitle : input.props.evaluationTitle, weight: "semibold", live: "polite" }} />
                    )),
                    detail: defineContractComponent("stacked-peer-controls", {
                        control: [
                            defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                <Text props={{ content: unavailable ? input.props.unavailableDetail : input.props.evaluationDetail, size: "sm", tone: "muted" }} />
                            )),
                            ...(input.props.realtimeStatus === undefined ? [] : [
                                defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                    <Text props={{ content: input.props.realtimeStatus, size: "sm", tone: "muted", live: "polite" }} />
                                )),
                            ]),
                        ],
                    }),
                    actions: defineContractComponent("challenge-submission-actions", {
                        action: [defineLeafComponent("button", {}, () => (
                            <Button
                                props={{ label: input.props.reloadLabel, variant: unavailable ? "primary" : "outline", isPending: !unavailable }}
                                on={{ press: input.on?.reload }}
                            />
                        ))],
                    }),
                }),
            })} />
        )
    }
    const summaryControls = input.blockState === "failed"
        ? [
            defineLeafComponent("text", {}, () => (
                <Text props={{ content: input.props.notice, live: "assertive" }} />
            )),
        ]
        : [
            ...(input.props.shortFeedback === undefined ? [] : [
                defineLeafComponent("text", {}, () => (
                    <Text props={{ content: input.props.shortFeedback }} isLoading={loading} />
                )),
            ]),
            ...(input.props.outcomeLabel === undefined ? [] : [
                defineLeafComponent("text", { weight: "semibold" }, () => (
                    <Text props={{ content: input.props.outcomeLabel, weight: "semibold" }} />
                )),
            ]),
            ...(input.props.confidenceLine === undefined ? [] : [
                defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.confidenceLine, size: "sm", tone: "muted" }} />
                )),
            ]),
        ]

    const feedbackGroups = input.blockState === "failed" ? [] : [
        ...input.props.feedbacks.map((feedback) => defineContractComponent("stacked-peer-controls", {
            control: [
                defineLeafComponent("text", { weight: "semibold" }, () => (
                    <Text props={{ content: feedback.message, weight: "semibold" }} />
                )),
                defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: feedback.severity, size: "sm", tone: "muted" }} />
                )),
                ...(feedback.detail === undefined ? [] : [
                    defineLeafComponent("text", {}, () => <Text props={{ content: feedback.detail }} />),
                ]),
                ...(feedback.location === undefined ? [] : [
                    defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: feedback.location, size: "sm" }} />
                    )),
                ]),
                ...(feedback.suggestion === undefined ? [] : [
                    defineLeafComponent("text", {}, () => <Text props={{ content: feedback.suggestion }} />),
                ]),
            ],
        })),
        ...(
            input.props.uncertainty === undefined && input.props.nextAction === undefined
                ? []
                : [defineContractComponent("stacked-peer-controls", {
                    control: [
                        ...(input.props.uncertainty === undefined ? [] : [
                            defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                <Text props={{ content: input.props.uncertainty, size: "sm", tone: "muted" }} />
                            )),
                        ]),
                        ...(input.props.nextAction === undefined ? [] : [
                            defineLeafComponent("text", { weight: "semibold" }, () => (
                                <Text props={{ content: input.props.nextAction, weight: "semibold" }} />
                            )),
                        ]),
                    ],
                })]
        ),
    ]

    const actions = input.blockState === "failed"
        ? [defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.reloadLabel }} on={{ press: input.on?.reload }} />
        ))]
        : [
            defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.historyLabel ?? "History", variant: "outline" }}
                    on={{ press: input.on?.openHistory }}
                    isLoading={loading}
                />
            )),
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.retryLabel }} on={{ press: input.on?.retry }} isLoading={loading} />
            )),
            defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.nextLabel, variant: "primary" }}
                    on={{ press: input.on?.next }}
                    isLoading={loading}
                />
            )),
        ]

    return (
        <>
            <Tree
                contract="challenge-result-page-document"
                render={defineContractComponent("challenge-result-page-document", {
                    breadcrumb,
                    result: defineContractComponent("challenge-result-workspace", {
                        summary: defineContractComponent("challenge-result-summary", {
                            header: defineContractComponent("centred-title-pair", {
                                title: defineLeafComponent("heading", {}, () => (
                                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                                )),
                                description: defineLeafComponent("text", { size: "sm" }, () => (
                                    <Text props={{ content: input.props.description, size: "sm" }} isLoading={loading} />
                                )),
                            }),
                            score: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                                <Text
                                    props={{ content: input.props.scoreLine, size: "sm", tone: "muted" }}
                                    isLoading={loading}
                                />
                            )),
                            status: defineContractComponent("stacked-peer-controls", { control: summaryControls }),
                        }),
                        ...(feedbackGroups.length === 0 ? {} : {
                            feedback: defineContractComponent("challenge-criterion-feedback-list", { feedback: feedbackGroups }),
                        }),
                        actions: defineContractComponent("challenge-result-actions", { action: actions }),
                    }),
                })}
            />
            {input.props.isHistoryOpen === true ? <ChallengeAttemptHistoryDrawer
                isOpen
                courseId={input.props.courseId}
                submissionId={input.props.submissionId}
                selectedAttemptId={input.props.selectedAttemptId}
                onDismiss={() => input.on?.closeHistory?.()}
                onSelect={(attempt) => input.on?.selectHistoryAttempt?.(attempt.id, attempt.attemptGroupId)}
            /> : null}
        </>
    )
}

/** Architectural identity for the pure result twin. */
export const meta = { world: "pure", domain: "learn" } as const
