import { ContinuationHighlightCard } from "@/components/branches/ContinuationHighlightCard"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

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
    readonly setupState?: CourseMockInterviewSetupState; readonly title: string; readonly description: string; readonly status?: string
    readonly levelLabel: string; readonly modeLabel: string; readonly levels: ReadonlyArray<MockInterviewSetupChoice>; readonly modes: ReadonlyArray<MockInterviewSetupChoice>
    readonly selectedLevel: string; readonly selectedMode: string; readonly startLabel: string; readonly resumeLabel: string; readonly retryLabel: string; readonly accessMessage: string; readonly accessLabel: string
    readonly selectedTab: "begin" | "history" | "stats"; readonly tabsLabel: string; readonly tabs: ReadonlyArray<MockInterviewSetupChoice>; readonly beginTitle: string; readonly briefingEyebrow: string; readonly briefingTitle: string
    readonly setupTitle: string; readonly setupDescription: string; readonly serverNote: string; readonly savedNote: string; readonly historyTitle: string; readonly statsTitle: string; readonly historyEmpty: string; readonly statsEmpty: string
    readonly historyFailed: string; readonly statsFailed: string; readonly historyState: "pending" | "ready" | "empty" | "failed"; readonly statsState: "pending" | "ready" | "empty" | "failed"
    readonly historyRows: ReadonlyArray<MockInterviewHistoryRow>; readonly statsRows: ReadonlyArray<MockInterviewStatsRow>; readonly returnToBegin: string; readonly resumeTitle: string; readonly readinessLabels: ReadonlyArray<string>; readonly focus: string
}
/** User decisions and recovery actions emitted by the pure green room. */
export type CourseMockInterviewSetupActions = { readonly selectTab?: (tab: "begin" | "history" | "stats") => void; readonly configure?: (field: "level" | "mode", value: string) => void; readonly start?: () => void; readonly resume?: () => void; readonly retry?: () => void; readonly access?: () => void }
/** Fixed state, content and action lanes for the presentational setup block. */
export type CourseMockInterviewSetupBlockProps = { readonly state: CourseMockInterviewSetupState | "begin" | "history" | "stats"; readonly props: CourseMockInterviewSetupData; readonly on?: CourseMockInterviewSetupActions }

/** Draw the complete green room and every selected destination state. */
export const CourseMockInterviewSetupBlockBase = (props: CourseMockInterviewSetupBlockProps) => {
    const setupState = props.props.setupState ?? (["begin", "history", "stats"].includes(props.state) ? "ready" : props.state)
    const selectedTab = ["begin", "history", "stats"].includes(props.state) ? props.state as "begin" | "history" | "stats" : props.props.selectedTab
    const loading = setupState === "pending"
    const starting = setupState === "starting"
    const selectedLevel = props.props.levels.find((choice) => choice.id === props.props.selectedLevel)?.label ?? ""
    const selectedMode = props.props.modes.find((choice) => choice.id === props.props.selectedMode)?.label ?? ""
    const historyLoading = props.props.historyState === "pending"
    const statsLoading = props.props.statsState === "pending"
    const historyNotice = props.props.historyState === "failed" ? props.props.historyFailed : props.props.historyState === "empty" ? props.props.historyEmpty : undefined
    const statsNotice = props.props.statsState === "failed" ? props.props.statsFailed : props.props.statsState === "empty" ? props.props.statsEmpty : undefined
    const begin = <SurfaceCard props={{ label: props.props.beginTitle }}><section><Text props={{ content: props.props.briefingEyebrow, size: "sm", tone: "accent", weight: "semibold", icon: "talents" }} isLoading={loading} /><Heading props={{ content: props.props.briefingTitle, level: 2 }} isLoading={loading} /><Text props={{ content: props.props.description, size: "sm", tone: "muted" }} isLoading={loading} /><div>{[props.props.focus, selectedLevel, selectedMode].map((value, index) => <div key={props.props.readinessLabels[index]}><Heading props={{ content: props.props.readinessLabels[index] ?? "", level: 3 }} isLoading={loading} /><Text props={{ content: value, size: "sm", tone: "muted" }} isLoading={loading} /></div>)}</div>{props.props.status === undefined || setupState === "resumable" ? null : <Text props={{ content: props.props.status, size: "xs", tone: "muted", live: "polite" }} />}<Button props={{ label: props.props.startLabel, variant: "primary", disabled: loading || starting, isPending: starting, icon: "next", iconPlacement: "trailing" }} on={{ press: props.on?.start }} isLoading={loading} /></section><section><Heading props={{ content: props.props.setupTitle, level: 2 }} isLoading={loading} /><Text props={{ content: props.props.setupDescription, size: "sm", tone: "muted" }} isLoading={loading} /><Text props={{ content: props.props.levelLabel, size: "sm", tone: "muted", weight: "semibold" }} isLoading={loading} /><ChoiceTabs props={{ label: props.props.levelLabel, selectedKey: props.props.selectedLevel, tabs: props.props.levels, variant: "primary" }} on={{ select: (key) => props.on?.configure?.("level", key) }} /><Text props={{ content: props.props.modeLabel, size: "sm", tone: "muted", weight: "semibold" }} isLoading={loading} /><ChoiceTabs props={{ label: props.props.modeLabel, selectedKey: props.props.selectedMode, tabs: props.props.modes, variant: "primary" }} on={{ select: (key) => props.on?.configure?.("mode", key) }} /></section></SurfaceCard>
    const trust = <SurfaceCard props={{ label: props.props.briefingEyebrow }}><Text props={{ content: props.props.serverNote, size: "sm", tone: "muted" }} isLoading={loading} /><Text props={{ content: props.props.savedNote, size: "sm", tone: "muted" }} isLoading={loading} /></SurfaceCard>
    const historyRows = historyLoading ? Array.from({ length: 3 }, (_, index) => ({ id: `pending-${index}`, title: "", fact: "" })) : props.props.historyRows
    const statsRows = statsLoading ? Array.from({ length: 3 }, (_, index) => ({ id: `pending-${index}`, title: "", percent: 0, percentText: "" })) : props.props.statsRows
    const history = <SurfaceListCard props={{ label: props.props.historyTitle }} isLoading={historyLoading}>{historyNotice === undefined ? historyRows.map((row) => <div key={row.id}><Text props={{ content: row.title, size: "sm", weight: "medium" }} isLoading={historyLoading} /><Text props={{ content: row.fact, size: "xs", tone: "muted" }} isLoading={historyLoading} /></div>) : <EmptyNotice props={{ message: historyNotice, actionLabel: props.props.returnToBegin }} on={{ act: () => props.on?.selectTab?.("begin") }} />}</SurfaceListCard>
    const stats = <SurfaceListCard props={{ label: props.props.statsTitle }} isLoading={statsLoading}>{statsNotice === undefined ? statsRows.map((row) => <LabelledProgressRow key={row.id} props={row} isLoading={statsLoading} />) : <EmptyNotice props={{ message: statsNotice, actionLabel: props.props.returnToBegin }} on={{ act: () => props.on?.selectTab?.("begin") }} />}</SurfaceListCard>
    return <main><header><Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} /><Text props={{ content: props.props.description, size: "sm", tone: "muted" }} isLoading={loading} /><Badge props={{ content: props.props.focus, icon: "course" }} isLoading={loading} /></header>{setupState === "locked" || setupState === "failed" ? null : <ChoiceTabs props={{ label: props.props.tabsLabel, selectedKey: selectedTab, tabs: props.props.tabs, variant: "secondary" }} on={{ select: (key) => props.on?.selectTab?.(key as "begin" | "history" | "stats") }} />}{selectedTab === "begin" && (setupState === "failed" || setupState === "locked") ? <EmptyNotice props={{ message: setupState === "locked" ? props.props.accessMessage : props.props.status ?? "", actionLabel: setupState === "locked" ? props.props.accessLabel : props.props.retryLabel }} on={{ act: setupState === "locked" ? props.on?.access : props.on?.retry }} /> : null}{selectedTab === "begin" && setupState === "resumable" ? <ContinuationHighlightCard><Heading props={{ content: props.props.resumeTitle, level: 3 }} /><Text props={{ content: props.props.status ?? "", size: "sm", tone: "muted" }} /><Button props={{ label: props.props.resumeLabel, variant: "primary", icon: "next", iconPlacement: "trailing" }} on={{ press: props.on?.resume }} /></ContinuationHighlightCard> : null}{selectedTab === "begin" && !["failed", "locked", "resumable"].includes(setupState) ? <>{begin}{trust}</> : null}{selectedTab === "history" ? history : null}{selectedTab === "stats" ? stats : null}</main>
}
