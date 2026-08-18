import { Tree } from "@/components/branches/Tree"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"

/** Finite runtime situations shown by the interview room. */
export type CourseMockInterviewSessionState = "connecting" | "live" | "syncing" | "expired" | "failed"

/** One persisted or streaming transcript turn resolved for display. */
export type CourseMockInterviewVisibleTurn = {
    readonly id: string
    readonly role: "interviewer" | "candidate"
    readonly label: string
    readonly content: string
}

/** Resolved copy, progress and transcript consumed by the pure room. */
export type CourseMockInterviewSessionData = {
    readonly title: string
    readonly promptTitle: string
    readonly stateLabel: string
    readonly counterLabel: string
    readonly progressLabel: string
    readonly progress: number
    readonly remainingLabel?: string
    readonly turns: ReadonlyArray<CourseMockInterviewVisibleTurn>
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

/** Full-bleed, presentational interview room. Runtime data and transport stay in the connected twin. */
export const _CourseMockInterviewSessionPage = (input: CourseMockInterviewSessionPageProps) => {
    const isPending = input.state === "connecting"
    const isBusy = input.state === "connecting" || input.state === "syncing"
    const canAnswer = input.state === "live"
    const workspaceCode = input.props.workspaceCode
    const turn = input.props.turns.map((item) => defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: item.label, level: 3 }} />
        )),
        description: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: item.content, size: "sm" }} />
        )),
    }))
    const action = [
        input.state === "failed"
            ? defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.retryLabel, variant: "primary" }} on={{ press: input.on?.retry }} />
            ))
            : defineLeafComponent("button", {}, () => (
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
        ...(input.props.streamingText === undefined ? [] : [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.abortLabel, variant: "outline" }} on={{ press: input.on?.abort }} />
            )),
        ]),
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.finishLabel, variant: "outline", disabled: isBusy }} on={{ press: input.on?.finish }} />
        )),
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.leaveLabel, variant: "ghost" }} on={{ press: input.on?.leave }} />
        )),
    ]

    return (
        <Tree
            contract="course-mock-interview-session-page"
            render={defineContractComponent("course-mock-interview-session-page", {
                header: defineContractComponent("centred-title-pair", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.promptTitle, level: 1 }} isLoading={isPending} />
                    )),
                    description: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: input.props.title, size: "sm", tone: "muted" }} isLoading={isPending} />
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
                notice: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text
                        props={{
                            content: input.props.notice ?? input.props.stateLabel,
                            size: "sm",
                            tone: input.state === "failed" || input.state === "expired" ? "accent" : "muted",
                            live: input.state === "failed" ? "assertive" : "polite",
                        }}
                        isLoading={isPending}
                    />
                )),
                turn,
                ...(input.props.streamingText === undefined ? {} : {
                    streaming: defineContractComponent("centred-title-pair", {
                        title: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.interviewerPendingLabel, level: 3 }} />
                        )),
                        description: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: input.props.streamingText, size: "sm", live: "polite" }} />
                        )),
                    }),
                }),
                answerLabel: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                    <Text props={{ content: input.props.answerLabel, size: "sm", weight: "medium" }} />
                )),
                answer: defineLeafComponent("textarea", {}, () => (
                    <Textarea
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
                action,
                workspaceTitle: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.workspaceLabel, level: 2 }} isLoading={isPending} />
                )),
                workspace: workspaceCode === undefined
                    ? defineLeafComponent("text", {}, () => (
                        <Text props={{ content: input.props.interviewerPendingLabel, size: "sm", tone: "muted" }} isLoading={isPending} />
                    ))
                    : defineLeafComponent("code-block", {}, () => (
                        <CodeBlock props={{ code: workspaceCode }} />
                    )),
            })}
        />
    )
}

/** Source-level ownership marker for the pure session twin. */
export const meta = { world: "pure", domain: "learn" } as const
