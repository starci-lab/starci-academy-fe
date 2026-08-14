import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Article } from "@/components/leaves/Article"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { PlaygroundStep } from "@/modules/api/graphql/queries/query-playground"

/** Live relay states exposed by the pure playground workspace. */
export type CoursePlaygroundSessionState = "connecting" | "live" | "reconnecting" | "completed" | "failed"

/** Resolved session steps, progress and owner actions. */
export type CoursePlaygroundSessionPageProps = {
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
export const _CoursePlaygroundSessionPage = (input: CoursePlaygroundSessionPageProps) => {
    const current = input.props.steps[input.props.selectedStepIndex]
    const commandHint = current?.commandHint ?? undefined
    const actionHint = current?.actionHint ?? undefined
    const settled = input.state === "failed" || input.state === "completed"
    const notice = settled
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: input.state === "completed" ? input.props.completedTitle : input.props.failedText,
                    description: input.state === "completed" ? input.props.completedText : undefined,
                    actionLabel: input.state === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.on.retry }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-playground-session-page" render={defineContractComponent("course-playground-session-page", {
            leave: defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.leaveLabel, variant: "ghost" }} on={{ press: input.on.leave }} />
            )),
            connection: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: input.props.connectionText, size: "xs", tone: "muted", live: "polite" }} />
            )),
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: current?.title ?? input.props.title, level: 1 }} />
            )),
            step: input.props.steps.map((step, index) => {
                const passed = input.props.passedStepIndexes.includes(index)
                const available = passed || index <= Math.max(0, input.props.passedStepIndexes.length)
                const status = passed ? `${input.props.passedLabel} · ` : ""
                return defineLeafComponent("nav-link", { kind: "section" }, () => (
                    <NavLink
                        props={{
                            label: `${input.props.stepLabel} ${index + 1} · ${status}${step.title}`,
                            kind: "section",
                            isCurrent: index === input.props.selectedStepIndex,
                        }}
                        on={{ press: available ? () => input.on.step(index) : undefined }}
                    />
                ))
            }),
            ...(!settled ? {
                body: defineLeafComponent("article", {}, () => (
                    <Article props={{ body: current?.body }} />
                )),
                ...(commandHint === undefined ? {} : {
                    command: defineLeafComponent("code-block", {}, () => (
                        <CodeBlock props={{ code: commandHint }} />
                    )),
                }),
                ...(actionHint === undefined ? {} : {
                    hint: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: actionHint, size: "sm" }} />
                    )),
                }),
                ...(input.state !== "live" || current === undefined || input.props.passedStepIndexes.includes(input.props.selectedStepIndex) ? {} : {
                    submit: defineLeafComponent("button", {}, () => (
                        <Button props={{ label: input.props.submitLabel, variant: "primary" }} on={{ press: input.on.submit }} />
                    )),
                }),
            } : {}),
            notice,
        })} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
