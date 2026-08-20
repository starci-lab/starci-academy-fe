import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

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
    readonly selectedTab: "begin" | "history" | "stats"
    readonly tabsLabel: string
    readonly tabs: ReadonlyArray<MockInterviewSetupChoice>
    readonly beginTitle: string
    readonly historyEmpty: string
    readonly statsEmpty: string
    readonly returnToBegin: string
    readonly resumeTitle: string
    readonly readinessLabels: ReadonlyArray<string>
    readonly focus: string
}

/** Actions emitted by the pure setup page. */
export type CourseMockInterviewSetupActions = {
    readonly selectTab?: (tab: "begin" | "history" | "stats") => void
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
    const selectedLevel = input.props.levels.find((choice) => choice.id === input.props.selectedLevel)?.label ?? ""
    const selectedMode = input.props.modes.find((choice) => choice.id === input.props.selectedMode)?.label ?? ""
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
    ]

    const historyOrStats = input.props.selectedTab === "history" || input.props.selectedTab === "stats"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: input.props.selectedTab === "history" ? input.props.historyEmpty : input.props.statsEmpty,
                    actionLabel: input.props.returnToBegin,
                }}
                on={{ act: () => input.on?.selectTab?.("begin") }}
            />
        ))
        : undefined

    const readiness = [selectedLevel, selectedMode, input.props.focus].map((value, index) => (
        defineContractComponent("title-with-baseline-fact", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: input.props.readinessLabels[index] ?? "", level: 3 }} isLoading={loading} />
            )),
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: value, size: "sm", tone: "muted" }} isLoading={loading} />
            )),
        })
    ))

    return (
        <Tree
            contract="course-mock-interview-hub-page"
            render={defineContractComponent("course-mock-interview-hub-page", {
                header: defineContractComponent("page-header-stack", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                    )),
                }),
                navigation: defineContractComponent("mock-interview-setup-tabs-over-panel", {
                    tabs: defineLeafComponent("choice-tabs", {}, () => (
                        <ChoiceTabs
                            props={{ label: input.props.tabsLabel, selectedKey: input.props.selectedTab, tabs: input.props.tabs, variant: "secondary" }}
                            on={{ select: (key) => input.on?.selectTab?.(key as "begin" | "history" | "stats") }}
                        />
                    )),
                }),
                panel: defineContractComponent("mock-interview-setup-panel", {
                    notice: input.state !== "failed" ? undefined : defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice props={{ message: input.props.status ?? "", actionLabel: input.props.retryLabel }} on={{ act: input.on?.retry }} />
                    )),
                    history: input.props.selectedTab === "history" ? defineContractComponent("mock-interview-history-panel", { notice: historyOrStats }) : undefined,
                    stats: input.props.selectedTab === "stats" ? defineContractComponent("mock-interview-stats-panel", { notice: historyOrStats }) : undefined,
                    resume: input.props.selectedTab !== "begin" || input.state !== "resumable" ? undefined : defineContractComponent("mock-interview-resume-panel", {
                        identity: defineContractComponent("title-with-baseline-fact", {
                            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.resumeTitle, level: 3 }} />),
                            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.status ?? "", size: "sm", tone: "muted" }} />),
                        }),
                        action: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.resumeLabel, variant: "secondary" }} on={{ press: input.on?.resume }} />),
                    }),
                    readiness: input.props.selectedTab !== "begin" || input.state === "failed" ? undefined : defineContractComponent("mock-interview-readiness-snapshot", { fact: readiness }),
                    begin: input.props.selectedTab !== "begin" || input.state === "failed" ? undefined : defineContractComponent("mock-interview-begin-panel", {
                        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.beginTitle, level: 2 }} isLoading={loading} />),
                        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />),
                        levelLabel: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.levelLabel, size: "sm", tone: "muted" }} isLoading={loading} />),
                        level: defineLeafComponent("choice-tabs", {}, () => <ChoiceTabs props={{ label: input.props.levelLabel, selectedKey: input.props.selectedLevel, tabs: input.props.levels, variant: "primary" }} on={{ select: (key) => input.on?.configure?.("level", key) }} />),
                        modeLabel: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.modeLabel, size: "sm", tone: "muted" }} isLoading={loading} />),
                        mode: defineLeafComponent("choice-tabs", {}, () => <ChoiceTabs props={{ label: input.props.modeLabel, selectedKey: input.props.selectedMode, tabs: input.props.modes, variant: "primary" }} on={{ select: (key) => input.on?.configure?.("mode", key) }} />),
                        status: input.props.status === undefined || input.state === "resumable" ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.status ?? "", size: "sm", tone: "muted", live: "polite" }} />),
                        action,
                    }),
                }),
            })}
        />
    )
}

/** Source-level ownership marker for the pure setup twin. */
export const meta = { world: "pure", domain: "learn" } as const
