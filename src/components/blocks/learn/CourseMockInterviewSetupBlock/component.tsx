import { ContinuationHighlightCard } from "@/components/branches/ContinuationHighlightCard"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceFormCard } from "@/components/branches/SurfaceFormCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** One selectable setup value presented to the learner. */
export type MockInterviewSetupChoice = { readonly id: string; readonly label: string }
/** One completed attempt presented as a history peer. */
export type MockInterviewHistoryRow = { readonly id: string; readonly title: string; readonly fact: string }
/** One aggregate phase presented as a statistics peer. */
export type MockInterviewStatsRow = { readonly id: string; readonly title: string; readonly percent: number; readonly percentText: string }
/** The settled loading, interaction and recovery conditions of the green room. */
export type CourseMockInterviewSetupState = "pending" | "ready" | "resumable" | "starting" | "failed" | "locked"

/** Complete localized content and data needed to draw every setup destination. */
export type CourseMockInterviewSetupData = {
    readonly setupState?: CourseMockInterviewSetupState
    readonly title: string
    readonly description: string
    readonly journeyLabel?: string
    readonly journeyStageLabel?: string
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
    readonly accessMessage: string
    readonly accessLabel: string
    readonly selectedTab: "begin" | "history" | "stats"
    readonly tabsLabel: string
    readonly tabs: ReadonlyArray<MockInterviewSetupChoice>
    readonly beginTitle: string
    readonly briefingEyebrow: string
    readonly briefingTitle: string
    readonly setupTitle: string
    readonly setupDescription: string
    readonly serverNote: string
    readonly savedNote: string
    readonly historyTitle: string
    readonly statsTitle: string
    readonly historyEmpty: string
    readonly statsEmpty: string
    readonly historyFailed: string
    readonly statsFailed: string
    readonly historyState: "pending" | "ready" | "empty" | "failed"
    readonly statsState: "pending" | "ready" | "empty" | "failed"
    readonly historyRows: ReadonlyArray<MockInterviewHistoryRow>
    readonly statsRows: ReadonlyArray<MockInterviewStatsRow>
    readonly returnToBegin: string
    readonly resumeTitle: string
    readonly readinessLabels: ReadonlyArray<string>
    readonly focus: string
}

/** User decisions and recovery actions emitted by the pure green room. */
export type CourseMockInterviewSetupActions = {
    readonly selectTab?: (tab: "begin" | "history" | "stats") => void
    readonly configure?: (field: "level" | "mode", value: string) => void
    readonly start?: () => void
    readonly resume?: () => void
    readonly retry?: () => void
    readonly access?: () => void
}

/** Fixed state, content and action lanes for the presentational setup block. */
export type CourseMockInterviewSetupPageProps = {
    readonly state: CourseMockInterviewSetupState | "begin" | "history" | "stats"
    readonly props: CourseMockInterviewSetupData
    readonly on?: CourseMockInterviewSetupActions
}

type HistoryListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<MockInterviewHistoryRow>
    readonly notice?: string
    readonly recoveryLabel: string
}

const HistoryListView = ({ props, on, isLoading = false }: LeafProps<HistoryListData>) => (
    <Tree contract="mock-interview-history-panel" render={defineContractComponent("mock-interview-history-panel", {
        item: props.notice === undefined ? props.rows.map((row) => defineContractComponent("mock-interview-history-row", {
            title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => <Text props={{ content: row.title, size: "sm", weight: "medium" }} isLoading={isLoading} />),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: row.fact, size: "xs", tone: "muted" }} isLoading={isLoading} />),
        })) : [defineContractComponent("mock-interview-notice-row", {
            notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: props.notice ?? "", actionLabel: props.recoveryLabel }} on={{ act: on?.act }} />),
        })],
    })} />
)
const HistoryList = defineContractComponent("mock-interview-history-panel", HistoryListView)

type StatisticsListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<MockInterviewStatsRow>
    readonly notice?: string
    readonly recoveryLabel: string
}

const StatisticsListView = ({ props, on, isLoading = false }: LeafProps<StatisticsListData>) => (
    <Tree contract="mock-interview-stats-panel" render={defineContractComponent("mock-interview-stats-panel", {
        item: props.notice === undefined ? props.rows.map((row) => defineContractComponent("mock-interview-stats-row", {
            evidence: defineCompositeComponent("labelled-progress-row", {}, () => <LabelledProgressRow props={row} isLoading={isLoading} />),
        })) : [defineContractComponent("mock-interview-notice-row", {
            notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: props.notice ?? "", actionLabel: props.recoveryLabel }} on={{ act: on?.act }} />),
        })],
    })} />
)
const StatisticsList = defineContractComponent("mock-interview-stats-panel", StatisticsListView)

/** Draw the complete green room and every selected destination state. */
export const CourseMockInterviewSetupBlockBase = (input: CourseMockInterviewSetupPageProps) => {
    const setupState = input.props.setupState ?? (input.state === "begin" || input.state === "history" || input.state === "stats" ? "ready" : input.state)
    const selectedTab = input.state === "begin" || input.state === "history" || input.state === "stats" ? input.state : input.props.selectedTab
    const loading = setupState === "pending"
    const starting = setupState === "starting"
    const selectedLevel = input.props.levels.find((choice) => choice.id === input.props.selectedLevel)?.label ?? ""
    const selectedMode = input.props.modes.find((choice) => choice.id === input.props.selectedMode)?.label ?? ""
    const historyLoading = input.props.historyState === "pending"
    const statisticsLoading = input.props.statsState === "pending"
    const historyRows = historyLoading ? Array.from({ length: 3 }, (_, index) => ({ id: `pending-${index}`, title: "", fact: "" })) : input.props.historyRows
    const statisticsRows = statisticsLoading ? Array.from({ length: 3 }, (_, index) => ({ id: `pending-${index}`, title: "", percent: 0, percentText: "" })) : input.props.statsRows
    const readiness = [input.props.focus, selectedLevel, selectedMode].map((value, index) => defineContractComponent("title-with-baseline-fact", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.readinessLabels[index] ?? "", level: 3 }} isLoading={loading} />),
        fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: value, size: "sm", tone: "muted" }} isLoading={loading} />),
    }))
    const begin = defineContractProjection("mock-interview-begin-panel", () => (
        <SurfaceFormCard
            props={{ label: input.props.beginTitle }}
            contract="mock-interview-begin-panel"
            render={defineContractComponent("mock-interview-begin-panel", {
                briefing: defineContractComponent("mock-interview-briefing-track", {
                    eyebrow: defineLeafComponent("text", { size: "sm", tone: "accent" }, () => <Text props={{ content: input.props.briefingEyebrow, size: "sm", tone: "accent", weight: "semibold", icon: "talents" }} isLoading={loading} />),
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.briefingTitle, level: 2 }} isLoading={loading} />),
                    description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />),
                    readiness: defineContractComponent("mock-interview-readiness-snapshot", { fact: readiness }),
                    status: input.props.status === undefined || setupState === "resumable" ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: input.props.status ?? "", size: "xs", tone: "muted", live: "polite" }} />),
                    action: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.startLabel, variant: "primary", disabled: loading || starting, isPending: starting, icon: "next", iconPlacement: "trailing" }} on={{ press: input.on?.start }} isLoading={loading} />),
                }),
                configuration: defineContractComponent("mock-interview-configuration-track", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.setupTitle, level: 2 }} isLoading={loading} />),
                    description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.setupDescription, size: "sm", tone: "muted" }} isLoading={loading} />),
                    levelLabel: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.levelLabel, size: "sm", tone: "muted", weight: "semibold" }} isLoading={loading} />),
                    level: defineLeafComponent("choice-tabs", {}, () => <ChoiceTabs props={{ label: input.props.levelLabel, selectedKey: input.props.selectedLevel, tabs: input.props.levels, variant: "primary" }} on={{ select: (key) => input.on?.configure?.("level", key) }} />),
                    modeLabel: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.modeLabel, size: "sm", tone: "muted", weight: "semibold" }} isLoading={loading} />),
                    mode: defineLeafComponent("choice-tabs", {}, () => <ChoiceTabs props={{ label: input.props.modeLabel, selectedKey: input.props.selectedMode, tabs: input.props.modes, variant: "primary" }} on={{ select: (key) => input.on?.configure?.("mode", key) }} />),
                }),
            })}
        />
    ))
    const trust = defineContractProjection("mock-interview-trust-panel", () => (
        <SurfaceCard contract="mock-interview-trust-panel" render={defineContractComponent("mock-interview-trust-panel", {
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.briefingEyebrow, level: 3 }} isLoading={loading} />),
            item: [input.props.serverNote, input.props.savedNote].map((content) => defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content, size: "sm", tone: "muted" }} isLoading={loading} />
            ))),
        })} />
    ))

    const historyNotice = input.props.historyState === "failed" ? input.props.historyFailed : input.props.historyState === "empty" ? input.props.historyEmpty : undefined
    const statsNotice = input.props.statsState === "failed" ? input.props.statsFailed : input.props.statsState === "empty" ? input.props.statsEmpty : undefined

    return (
        <Tree contract="mock-interview-hub-content" render={defineContractComponent("mock-interview-hub-content", {
            header: defineContractComponent("mock-interview-page-header", {
                identity: defineContractComponent("learn-page-title-pair", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />),
                    description: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />),
                }),
                focus: defineLeafComponent("badge", {}, () => <Badge props={{ content: input.props.focus, icon: "course" }} isLoading={loading} />),
            }),
            navigation: setupState === "locked" || setupState === "failed" ? undefined : defineContractComponent("mock-interview-setup-tabs-over-panel", {
                tabs: defineLeafComponent("choice-tabs", {}, () => <ChoiceTabs props={{ label: input.props.tabsLabel, selectedKey: selectedTab, tabs: input.props.tabs, variant: "secondary" }} on={{ select: (key) => input.on?.selectTab?.(key as "begin" | "history" | "stats") }} />),
            }),
            panel: defineContractComponent("mock-interview-setup-panel", {
                notice: selectedTab === "begin" && (setupState === "failed" || setupState === "locked") ? defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: setupState === "locked" ? input.props.accessMessage : input.props.status ?? "", actionLabel: setupState === "locked" ? input.props.accessLabel : input.props.retryLabel }} on={{ act: setupState === "locked" ? input.on?.access : input.on?.retry }} />) : undefined,
                resume: selectedTab === "begin" && setupState === "resumable" ? defineContractProjection("mock-interview-resume-panel", () => (
                    <ContinuationHighlightCard render={defineContractComponent("mock-interview-resume-panel", {
                        identity: defineContractComponent("title-with-baseline-fact", {
                            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.props.resumeTitle, level: 3 }} />),
                            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: input.props.status ?? "", size: "sm", tone: "muted" }} />),
                        }),
                        action: defineLeafComponent("button", {}, () => <Button props={{ label: input.props.resumeLabel, variant: "primary", icon: "next", iconPlacement: "trailing" }} on={{ press: input.on?.resume }} />),
                    })} />
                )) : undefined,
                begin: selectedTab === "begin" && setupState !== "failed" && setupState !== "locked" && setupState !== "resumable" ? begin : undefined,
                trust: selectedTab === "begin" && setupState !== "failed" && setupState !== "locked" && setupState !== "resumable" ? trust : undefined,
                history: selectedTab === "history" ? defineContractProjection("mock-interview-history-panel", () => (
                    <SurfaceListCard props={{ label: input.props.historyTitle, rows: historyRows, notice: historyNotice, recoveryLabel: input.props.returnToBegin }} contract="mock-interview-history-panel" render={HistoryList} on={{ act: () => input.on?.selectTab?.("begin") }} isLoading={historyLoading} />
                )) : undefined,
                stats: selectedTab === "stats" ? defineContractProjection("mock-interview-stats-panel", () => (
                    <SurfaceListCard props={{ label: input.props.statsTitle, rows: statisticsRows, notice: statsNotice, recoveryLabel: input.props.returnToBegin }} contract="mock-interview-stats-panel" render={StatisticsList} on={{ act: () => input.on?.selectTab?.("begin") }} isLoading={statisticsLoading} />
                )) : undefined,
            }),
        })} />
    )
}

/** Source-level ownership marker for the pure setup twin. */
export const meta = { world: "pure", domain: "learn" } as const
