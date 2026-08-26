import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

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
        readonly evaluationTitle?: string
        readonly evaluationDetail?: string
        readonly unavailableTitle?: string
        readonly unavailableDetail?: string
        readonly outcomeLabel?: string
        readonly confidenceLine?: string
        readonly uncertainty?: string
        readonly nextAction?: string
    }
    readonly on?: {
        readonly reload?: () => void
        readonly retry?: () => void
        readonly next?: () => void
    }
}

/** Draws pending, graded and failed challenge-result states without querying. */
export const ChallengeResultBase = (input: ChallengeResultBlockProps) => {
    const loading = input.blockState === "pending"
    if (input.blockState === "pending" || input.blockState === "unavailable") {
        const unavailable = input.blockState === "unavailable"
        return (
            <Tree
                contract="challenge-evaluation-status"
                render={defineContractComponent("challenge-evaluation-status", {
                    title: defineLeafComponent("text", { weight: "semibold" }, () => (
                        <Text props={{ content: unavailable ? input.props.unavailableTitle : input.props.evaluationTitle, weight: "semibold", live: "polite" }} />
                    )),
                    detail: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: unavailable ? input.props.unavailableDetail : input.props.evaluationDetail, size: "sm", tone: "muted" }} />
                    )),
                    actions: defineContractComponent("challenge-submission-actions", {
                        action: [defineLeafComponent("button", {}, () => (
                            <Button
                                props={{ label: input.props.reloadLabel, variant: unavailable ? "primary" : "outline", isPending: !unavailable }}
                                on={{ press: input.on?.reload }}
                            />
                        ))],
                    }),
                })}
            />
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
        <Tree
            contract="challenge-result-workspace"
            render={defineContractComponent("challenge-result-workspace", {
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
            })}
        />
    )
}

/** Architectural identity for the pure result twin. */
export const meta = { world: "pure", domain: "learn" } as const
