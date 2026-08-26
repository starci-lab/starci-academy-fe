import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Article } from "@/components/branches/Article"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import type { PlaygroundStep } from "@/modules/api/graphql/queries/query-playground"

/** Live relay states exposed by the pure playground workspace. */
export type CoursePlaygroundSessionState = "connecting" | "live" | "reconnecting" | "completed" | "failed"

/** Resolved session steps, progress and owner actions. */
export type PlaygroundSessionBaseProps = {
    readonly state: CoursePlaygroundSessionState
    readonly props: {
        readonly title: string
        readonly steps: ReadonlyArray<PlaygroundStep>
        readonly selectedStepIndex: number
        readonly passedStepIndexes: ReadonlyArray<number>
        readonly connectionText: string
        readonly submitLabel: string
        readonly leaveLabel: string
        readonly retryLabel: string
        readonly completedTitle: string
        readonly completedText: string
        readonly failedText: string
        readonly stepLabel: string
        readonly passedLabel: string
    }
    readonly on: {
        readonly step: (index: number) => void
        readonly submit: () => void
        readonly leave: () => void
        readonly retry: () => void
    }
}

/** Draw a live playground whose progress advances only from server `step:verified` events. */
export const PlaygroundSessionBase = (input: PlaygroundSessionBaseProps) => {
    const sessionState = input.state
    const current = input.props.steps[input.props.selectedStepIndex]
    const commandHint = current?.commandHint ?? undefined
    const actionHint = current?.actionHint ?? undefined
    const settled = sessionState === "failed" || sessionState === "completed"
    const progressValue = input.props.steps.length === 0 ? 0 : Math.round((input.props.passedStepIndexes.length / input.props.steps.length) * 100)
    const notice = settled
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: sessionState === "completed" ? input.props.completedTitle : input.props.failedText,
                    description: sessionState === "completed" ? input.props.completedText : undefined,
                    actionLabel: sessionState === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.on.retry }}
            />
        ))
        : undefined

    const identity = defineContractProjection("playground-session-identity", () => (
        <SurfaceCard
            contract="playground-session-identity"
            render={defineContractComponent("playground-session-identity", {
                leave: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.leaveLabel, variant: "ghost" }} on={{ press: input.on.leave }} />),
                title: defineLeafComponent("heading", {}, () => <Heading props={{ content: current?.title ?? input.props.title, level: 1 }} />),
                progress: defineLeafComponent("progress", {}, () => <Progress props={{ label: input.props.title, value: progressValue }} />),
                connection: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: input.props.connectionText, size: "xs", tone: "muted", live: "polite" }} />),
            })}
        />
    ))
    const workspace = settled ? undefined : defineContractProjection("playground-session-guided-split", () => (
        <Tree contract="playground-session-guided-split" render={defineContractComponent("playground-session-guided-split", {
            steps: defineContractProjection("playground-session-step-rail", () => (
                <SurfaceCard
                    contract="playground-session-step-rail"
                    render={defineContractComponent("playground-session-step-rail", {
                        step: input.props.steps.map((step, index) => {
                            const passed = input.props.passedStepIndexes.includes(index)
                            const available = passed || index <= Math.max(0, input.props.passedStepIndexes.length)
                            const status = passed ? `${input.props.passedLabel} · ` : ""
                            return defineLeafComponent("nav-link", { kind: "section" }, () => (
                                <NavLink props={{ label: `${input.props.stepLabel} ${index + 1} · ${status}${step.title}`, kind: "section", isCurrent: index === input.props.selectedStepIndex }} on={{ press: available ? () => input.on.step(index) : undefined }} />
                            ))
                        }),
                    })}
                />
            )),
            task: defineContractProjection("playground-session-task", () => (
                <SurfaceCard
                    contract="playground-session-task"
                    render={defineContractComponent("playground-session-task", {
                        body: defineLeafComponent("article", {}, () => <Article props={{ body: current?.body }} />),
                        ...(commandHint === undefined ? {} : { command: defineLeafComponent("code-block", {}, () => <CodeBlock props={{ code: commandHint }} />) }),
                        ...(actionHint === undefined ? {} : { hint: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: actionHint, size: "sm" }} />) }),
                        ...(sessionState !== "live" || current === undefined || input.props.passedStepIndexes.includes(input.props.selectedStepIndex) ? {} : { submit: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.submitLabel, variant: "primary" }} on={{ press: input.on.submit }} />) }),
                    })}
                />
            )),
        })} />
    ))

    return <Tree contract="course-playground-session-workspace" render={defineContractComponent("course-playground-session-workspace", { identity, workspace, notice })} />
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
