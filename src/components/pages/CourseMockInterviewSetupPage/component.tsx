import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** One setup choice presented to the learner. */
export type MockInterviewSetupChoice = {
    readonly id: string
    readonly label: string
}

/** The situations the mock-interview green room can present. */
export type CourseMockInterviewSetupState = "pending" | "ready" | "resumable" | "starting" | "failed"

/** Resolved setup copy and current configuration. */
export type CourseMockInterviewSetupData = {
    readonly title: string
    readonly description: string
    readonly status?: string
    readonly levelLabel: string
    readonly modeLabel: string
    readonly levels: ReadonlyArray<MockInterviewSetupChoice>
    readonly modes: ReadonlyArray<MockInterviewSetupChoice>
    readonly selectedLevel: string
    readonly selectedMode: string
    readonly startLabel: string
    readonly resumeLabel: string
    readonly retryLabel: string
}

/** Actions emitted by the pure setup page. */
export type CourseMockInterviewSetupActions = {
    readonly configure?: (field: "level" | "mode", value: string) => void
    readonly start?: () => void
    readonly resume?: () => void
    readonly retry?: () => void
}

/** Props for the presentational mock-interview setup twin. */
export type CourseMockInterviewSetupPageProps = {
    readonly state: CourseMockInterviewSetupState
    readonly props: CourseMockInterviewSetupData
    readonly on?: CourseMockInterviewSetupActions
}

/** Draw the setup, resumable, loading and failed green-room states. */
export const CourseMockInterviewSetupPageBase = (input: CourseMockInterviewSetupPageProps) => {
    const loading = input.state === "pending"
    const starting = input.state === "starting"
    const level = input.props.levels.map((choice) => defineLeafComponent("button", {}, () => (
        <Button
            props={{
                label: choice.label,
                variant: choice.id === input.props.selectedLevel ? "primary" : "ghost",
                disabled: loading || starting,
            }}
            on={{ press: () => input.on?.configure?.("level", choice.id) }}
            isLoading={loading}
        />
    )))
    const mode = input.props.modes.map((choice) => defineLeafComponent("button", {}, () => (
        <Button
            props={{
                label: choice.label,
                variant: choice.id === input.props.selectedMode ? "primary" : "ghost",
                disabled: loading || starting,
            }}
            on={{ press: () => input.on?.configure?.("mode", choice.id) }}
            isLoading={loading}
        />
    )))
    const action = input.state === "failed" ? [
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.retryLabel, variant: "primary" }} on={{ press: input.on?.retry }} />
        )),
    ] : [
        defineLeafComponent("button", {}, () => (
            <Button
                props={{
                    label: input.props.startLabel,
                    variant: "primary",
                    disabled: loading || starting,
                    isPending: starting,
                }}
                on={{ press: input.on?.start }}
                isLoading={loading}
            />
        )),
        ...(input.state !== "resumable" ? [] : [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.resumeLabel, variant: "ghost" }} on={{ press: input.on?.resume }} />
            )),
        ]),
    ]

    return (
        <Tree
            contract="course-mock-interview-setup-page"
            render={defineContractComponent("course-mock-interview-setup-page", {
                header: defineContractComponent("centred-title-pair", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                    )),
                    description: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: input.props.description, size: "sm" }} isLoading={loading} />
                    )),
                }),
                levelLabel: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.levelLabel, size: "sm", tone: "muted" }} isLoading={loading} />
                )),
                level,
                modeLabel: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.modeLabel, size: "sm", tone: "muted" }} isLoading={loading} />
                )),
                mode,
                ...(input.props.status === undefined ? {} : {
                    status: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text
                            props={{
                                content: input.props.status,
                                size: "sm",
                                tone: "muted",
                                live: input.state === "failed" ? "assertive" : "polite",
                            }}
                        />
                    )),
                }),
                action,
            })}
        />
    )
}

/** Source-level ownership marker for the pure setup twin. */
export const meta = { world: "pure", domain: "learn" } as const
