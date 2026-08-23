import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceFormCard } from "@/components/branches/SurfaceFormCard"
import { SurfaceListCard, type SurfaceListCardActions } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"

/** Finite runtime situations shown by the interview room. */
export type CourseMockInterviewSessionState = "connecting" | "live" | "syncing" | "expired" | "failed"

/** The transient operation refining a connected room without changing its page architecture. */
export type CourseMockInterviewSessionOperation = "streaming" | "syncing" | "grading"

/** One persisted transcript turn resolved for display. */
export type CourseMockInterviewVisibleTurn = {
    readonly id: string
    readonly role: "interviewer" | "candidate"
    readonly label: string
    readonly content: string
}

/** Resolved copy, progress and transcript consumed by the pure room. */
export type CourseMockInterviewSessionData = {
    /** Connection, transport and terminal outcomes belong to the interview-room block. */
    readonly sessionState?: CourseMockInterviewSessionState
    readonly operation?: CourseMockInterviewSessionOperation
    readonly title: string
    readonly promptTitle: string
    readonly stateLabel: string
    readonly counterLabel: string
    readonly progressLabel: string
    readonly progress: number
    readonly remainingLabel?: string
    readonly turns: ReadonlyArray<CourseMockInterviewVisibleTurn>
    readonly turnsLabel: string
    readonly turnsEmptyLabel: string
    readonly streamingText?: string
    readonly interviewerPendingLabel: string
    readonly answerLabel: string
    readonly answerPlaceholder: string
    readonly answer: string
    readonly submitLabel: string
    readonly abortLabel: string
    readonly leaveLabel: string
    readonly finishLabel: string
    readonly retryLabel: string
    readonly workspaceLabel: string
    readonly workspaceEmptyLabel: string
    readonly workspaceCode?: string
    readonly notice?: string
}

/** User intents emitted by the pure room. */
export type CourseMockInterviewSessionActions = {
    readonly answer?: (value: string) => void
    readonly ask?: () => void
    readonly abort?: () => void
    readonly leave?: () => void
    readonly finish?: () => void
    readonly retry?: () => void
}

/** Public boundary of the presentational interview room. */
export type CourseMockInterviewSessionPageProps = {
    readonly state: CourseMockInterviewSessionState
    readonly props: CourseMockInterviewSessionData
    readonly on?: CourseMockInterviewSessionActions
}

/** Full-page interview desk. Runtime data and transport stay in the connected twin. */
export const CourseMockInterviewSessionBlockBase = (input: CourseMockInterviewSessionPageProps) => {
    const sessionState = input.props.sessionState ?? input.state
    const operation = input.props.operation
    const isPending = sessionState === "connecting"
    const isBusy = isPending || sessionState === "syncing" || operation !== undefined
    const canAnswer = sessionState === "live" && operation === undefined
    const isFailed = sessionState === "failed"
    const interviewerTurns = input.props.turns.filter((turn) => turn.role === "interviewer")
    const latestInterviewer = interviewerTurns.at(-1)
    const streamingCopy = input.props.streamingText?.trim()
    const activePrompt = latestInterviewer?.content ?? streamingCopy ?? input.props.interviewerPendingLabel
    const completedTurns = input.props.turns.flatMap((turn, index) => {
        if (turn.role !== "candidate") return []
        const question = input.props.turns.slice(0, index).findLast((candidate) => candidate.role === "interviewer")
        return [{ id: turn.id, title: question?.content ?? turn.label, description: turn.content }]
    })
    const showNotice = input.props.notice !== undefined

    const formActions = [
        ...(!isFailed ? [
            defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: input.props.submitLabel,
                        variant: "primary",
                        disabled: !canAnswer || input.props.answer.trim().length === 0,
                        isPending: isBusy,
                    }}
                    on={{ press: input.on?.ask }}
                />
            )),
        ] : []),
        ...(operation === "streaming" || input.props.streamingText !== undefined ? [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.abortLabel, variant: "outline" }} on={{ press: input.on?.abort }} />
            )),
        ] : []),
    ]
    const outcomeActions = [
        ...(isFailed ? [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.retryLabel, size: "sm", variant: "primary" }} on={{ press: input.on?.retry }} />
            )),
        ] : [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.finishLabel, size: "sm", variant: "ghost", disabled: isBusy }} on={{ press: input.on?.finish }} />
            )),
        ]),
    ]
    const HistoryList = defineContractComponent("mock-interview-turn-list", ({ isLoading = false }: LeafProps<{ label: string }, SurfaceListCardActions>) => {
        const historyRows = completedTurns.length === 0 ? [
            defineContractComponent("mock-interview-turn-empty-row", {
                notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.turnsEmptyLabel, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
            }),
        ] : completedTurns.map((turn) => defineContractComponent("mock-interview-turn-row", {
            title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: turn.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: turn.description, size: "sm", tone: "muted" }} isLoading={isLoading} />
            )),
        }))
        return (
            <Tree
                contract="mock-interview-turn-list"
                render={defineContractComponent("mock-interview-turn-list", { item: historyRows })}
            />
        )
    })
    const workspaceCode = input.props.workspaceCode

    const headerSurface = (
        <SurfaceCard
            contract="mock-interview-session-header"
            render={defineContractComponent("mock-interview-session-header", {
                identity: defineContractComponent("mock-interview-session-identity", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} isLoading={isPending} />
                    )),
                    description: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: input.props.promptTitle, size: "xs", tone: "muted" }} isLoading={isPending} />
                    )),
                }),
                progress: defineCompositeComponent("labelled-progress-row", {}, () => (
                    <LabelledProgressRow
                        props={{
                            id: "mock-interview-progress",
                            title: input.props.progressLabel,
                            percent: input.props.progress,
                            percentText: input.props.counterLabel,
                        }}
                        isLoading={isPending}
                    />
                )),
                ...(input.props.remainingLabel === undefined ? {} : {
                    remaining: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: input.props.remainingLabel, size: "xs", tone: "muted" }} />
                    )),
                }),
                leave: defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.leaveLabel, size: "sm", variant: "outline" }} on={{ press: input.on?.leave }} />
                )),
            })}
        />
    )
    const promptSurface = (
        <SurfaceCard
            props={{ label: latestInterviewer?.label ?? input.props.interviewerPendingLabel }}
            contract="mock-interview-active-prompt"
            render={defineContractComponent("mock-interview-active-prompt", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.promptTitle, level: 2 }} isLoading={isPending} />
                )),
                body: defineLeafComponent("text", {}, () => (
                    <Text props={{ content: activePrompt, size: "md" }} isLoading={isPending} />
                )),
                ...(streamingCopy === undefined || streamingCopy.length === 0 ? {} : {
                    streaming: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: streamingCopy, size: "sm", live: "polite" }} />
                    )),
                }),
            })}
        />
    )
    const answerSurface = (
        <SurfaceFormCard
            props={{ label: input.props.answerLabel }}
            contract="mock-interview-answer-operation"
            render={defineContractComponent("mock-interview-answer-operation", {
                answer: defineLeafComponent("textarea", {}, () => (
                    <Textarea
                        key={`answer-${completedTurns.length}`}
                        props={{
                            id: "mock-interview-answer",
                            name: "answer",
                            label: input.props.answerLabel,
                            placeholder: input.props.answerPlaceholder,
                            defaultValue: input.props.answer,
                            disabled: !canAnswer,
                        }}
                        on={{ change: input.on?.answer }}
                    />
                )),
                actions: defineContractComponent("challenge-deliverable-actions", { action: formActions }),
            })}
        />
    )
    const historySurface = (
        <SurfaceListCard
            contract="mock-interview-turn-list"
            props={{ label: input.props.turnsLabel }}
            render={HistoryList}
        />
    )
    const workspaceSurface = (
        <SurfaceCard
            props={{ label: input.props.workspaceLabel }}
            contract="mock-interview-question-workspace"
            render={defineContractComponent("mock-interview-question-workspace", {
                content: workspaceCode === undefined
                    ? defineLeafComponent("text", {}, () => (
                        <Text props={{ content: input.props.workspaceEmptyLabel, size: "sm", tone: "muted" }} isLoading={isPending} />
                    ))
                    : defineLeafComponent("code-block", {}, () => (
                        <CodeBlock props={{ code: workspaceCode }} />
                    )),
            })}
        />
    )
    const outcomesSurface = (
        <SurfaceCard
            contract="mock-interview-session-outcomes"
            render={defineContractComponent("mock-interview-session-outcomes", {
                status: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text
                        props={{
                            content: input.props.stateLabel,
                            size: "sm",
                            tone: isFailed || sessionState === "expired" ? "accent" : "muted",
                            live: isFailed ? "assertive" : "polite",
                        }}
                        isLoading={isPending}
                    />
                )),
                action: outcomeActions,
            })}
        />
    )
    const noticeSurface = showNotice ? (
        <SurfaceCard
            contract="mock-interview-session-notice"
            render={defineContractComponent("mock-interview-session-notice", {
                title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                    <Text props={{ content: input.props.stateLabel, size: "sm", weight: "semibold" }} />
                )),
                description: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text
                        props={{
                            content: input.props.notice ?? input.props.stateLabel,
                            size: "sm",
                            tone: isFailed || sessionState === "expired" ? "accent" : "muted",
                            live: isFailed ? "assertive" : "polite",
                        }}
                    />
                )),
            })}
        />
    ) : null

    return (
        <Tree
            contract="mock-interview-session-content"
            render={defineContractComponent("mock-interview-session-content", {
                header: defineContractComponent("mock-interview-session-header-owner", {
                    surface: defineContractProjection("mock-interview-session-header", () => headerSurface),
                }),
                workspace: defineContractComponent("mock-interview-session-workspace", {
                    primary: defineContractComponent("mock-interview-session-main-column", {
                        ...(noticeSurface === null ? {} : {
                            notice: defineContractProjection("mock-interview-session-notice", () => noticeSurface),
                        }),
                        prompt: defineContractProjection("mock-interview-active-prompt", () => promptSurface),
                        answer: defineContractProjection("mock-interview-answer-operation", () => answerSurface),
                        history: defineContractProjection("mock-interview-turn-list", () => historySurface),
                    }),
                    rail: defineContractComponent("mock-interview-session-rail", {
                        workspace: defineContractProjection("mock-interview-question-workspace", () => workspaceSurface),
                        outcomes: defineContractProjection("mock-interview-session-outcomes", () => outcomesSurface),
                    }),
                }),
            })}
        />
    )
}

/** Source-level ownership marker for the pure session twin. */
export const meta = { world: "pure", domain: "learn" } as const
