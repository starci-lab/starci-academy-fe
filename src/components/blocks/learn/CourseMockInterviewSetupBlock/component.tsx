import Image from "next/image"
import { DashboardShell, SectionHeader } from "@starci/grammar/core"
import { ContinuationHighlightCard } from "@/components/branches/ContinuationHighlightCard"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    mockInterviewDashboardClassName,
    mockInterviewActionRowClassName,
    mockInterviewCompactStateClassName,
    mockInterviewDestinationNavClassName,
    mockInterviewEvidenceCopyClassName,
    mockInterviewEvidenceListClassName,
    mockInterviewEvidenceRowClassName,
    mockInterviewFactClassName,
    mockInterviewFieldClassName,
    mockInterviewHeroActionClassName,
    mockInterviewHeroClassName,
    mockInterviewHeroCopyClassName,
    mockInterviewHeroFactClassName,
    mockInterviewHeroFactsClassName,
    mockInterviewHeroImageClassName,
    mockInterviewHeroMediaClassName,
    mockInterviewHistoryPanelClassName,
    mockInterviewLaunchClassName,
    mockInterviewPreflightClassName,
    mockInterviewProgressClassName,
    mockInterviewResumeClassName,
    mockInterviewResumeCopyClassName,
    mockInterviewSetupFormClassName,
    mockInterviewStateClassName,
    mockInterviewSummaryClassName,
    mockInterviewWorkspaceClassName,
} from "./classNames"

/** One learner-selectable setup option or destination tab. */
export type MockInterviewSetupChoice = { readonly id: string; readonly label: string; readonly description?: string }
/** One completed attempt summarized in setup history. */
export type MockInterviewHistoryRow = { readonly id: string; readonly title: string; readonly fact: string }
/** One aggregate practice statistic. */
export type MockInterviewStatsRow = { readonly id: string; readonly title: string; readonly percent: number; readonly percentText: string }
/** One immutable fact presented in the feature hero. */
export type MockInterviewHeroFact = { readonly label: string; readonly value: string }
/** Setup and access states rendered by the practice home. */
export type CourseMockInterviewSetupState = "pending" | "ready" | "resumable" | "starting" | "failed" | "locked"
/** Learner-facing content and state for the complete setup surface. */
export type CourseMockInterviewSetupData = {
    readonly setupState?: CourseMockInterviewSetupState; readonly title: string; readonly description: string; readonly status?: string
    readonly heroEyebrow: string; readonly heroActionLabel: string; readonly heroFacts: ReadonlyArray<MockInterviewHeroFact>; readonly mediaAlt: string
    readonly levelLabel: string; readonly modeLabel: string; readonly levels: ReadonlyArray<MockInterviewSetupChoice>; readonly modes: ReadonlyArray<MockInterviewSetupChoice>
    readonly selectedLevel: string; readonly selectedMode: string; readonly startLabel: string; readonly resumeLabel: string; readonly retryLabel: string; readonly accessMessage: string; readonly accessLabel: string
    readonly selectedTab: "begin" | "history" | "stats"; readonly tabsLabel: string; readonly tabs: ReadonlyArray<MockInterviewSetupChoice>; readonly beginTitle: string; readonly briefingEyebrow: string; readonly briefingTitle: string
    readonly setupTitle: string; readonly setupDescription: string; readonly serverNote: string; readonly savedNote: string; readonly historyTitle: string; readonly statsTitle: string; readonly historyEmpty: string; readonly statsEmpty: string
    readonly historyFailed: string; readonly statsFailed: string; readonly historyState: "pending" | "ready" | "empty" | "failed"; readonly statsState: "pending" | "ready" | "empty" | "failed"
    readonly historyRows: ReadonlyArray<MockInterviewHistoryRow>; readonly statsRows: ReadonlyArray<MockInterviewStatsRow>; readonly historyCountLabel: string
    readonly recentHistoryTitle: string; readonly progressTitle: string; readonly viewHistoryLabel: string; readonly viewStatsLabel: string; readonly historyActionLabel: string
    readonly newSessionEyebrow: string; readonly newSessionLabel: string; readonly preflightTitle: string; readonly returnToBegin: string; readonly resumeTitle: string; readonly readinessLabels: ReadonlyArray<string>; readonly focus: string
}
/** Interactions emitted by the setup surface. */
export type CourseMockInterviewSetupActions = {
    readonly selectTab?: (tab: "begin" | "history" | "stats") => void
    readonly configure?: (field: "level" | "mode", value: string) => void
    readonly start?: () => void; readonly resume?: () => void; readonly retry?: () => void; readonly access?: () => void
    readonly openHistory?: (sessionId: string) => void; readonly prepare?: () => void
}
/** State, data, and actions required by the setup block. */
export type CourseMockInterviewSetupBlockProps = { readonly state: CourseMockInterviewSetupState | "begin" | "history" | "stats"; readonly props: CourseMockInterviewSetupData; readonly on?: CourseMockInterviewSetupActions }

/** Draw the complete Guided Mission practice home and every selected destination state. */
export const CourseMockInterviewSetupBlockBase = (props: CourseMockInterviewSetupBlockProps) => {
    const data = props.props
    const setupState = data.setupState ?? (["begin", "history", "stats"].includes(props.state) ? "ready" : props.state)
    const selectedTab = ["begin", "history", "stats"].includes(props.state) ? props.state as "begin" | "history" | "stats" : data.selectedTab
    const loading = setupState === "pending"
    const starting = setupState === "starting"
    const selectedLevel = data.levels.find((choice) => choice.id === data.selectedLevel)
    const selectedMode = data.modes.find((choice) => choice.id === data.selectedMode)
    const historyLoading = data.historyState === "pending"
    const statsLoading = data.statsState === "pending"
    const unavailable = setupState === "failed" || setupState === "locked"
    const historyNotice = data.historyState === "failed" ? data.historyFailed : data.historyState === "empty" ? data.historyEmpty : undefined
    const statsNotice = data.statsState === "failed" ? data.statsFailed : data.statsState === "empty" ? data.statsEmpty : undefined
    const historyRows = historyLoading ? Array.from({ length: 3 }, (_, index) => ({ id: `pending-${index}`, title: "", fact: "" })) : data.historyRows
    const statsRows = statsLoading ? Array.from({ length: 3 }, (_, index) => ({ id: `pending-${index}`, title: "", percent: 0, percentText: "" })) : data.statsRows
    const isFirstUse = data.historyState === "empty" && data.statsState === "empty"

    const renderHistoryRows = (rows: ReadonlyArray<MockInterviewHistoryRow>) => (
        <ul className={mockInterviewEvidenceListClassName}>
            {rows.map((row) => <li className={mockInterviewEvidenceRowClassName} key={row.id}>
                <div className={mockInterviewEvidenceCopyClassName}>
                    <Text props={{ content: row.title, size: "sm", weight: "medium" }} isLoading={historyLoading} />
                    <Text props={{ content: row.fact, size: "xs", tone: "muted" }} isLoading={historyLoading} />
                </div>
                {historyLoading ? null : <Button props={{ label: data.historyActionLabel, variant: "ghost", size: "sm", icon: "next", iconPlacement: "trailing" }} on={{ press: () => props.on?.openHistory?.(row.id) }} />}
            </li>)}
        </ul>
    )

    const recentHistory = <SurfaceListCard props={{ label: data.recentHistoryTitle, fact: data.historyCountLabel }} isLoading={historyLoading} labelEnd={historyLoading ? undefined : <Button props={{ label: data.viewHistoryLabel, variant: "secondary", size: "sm", icon: "next", iconPlacement: "trailing" }} on={{ press: () => props.on?.selectTab?.("history") }} />}>
        {historyNotice === undefined ? renderHistoryRows(historyRows.slice(0, 3)) : <div className={mockInterviewCompactStateClassName}><EmptyNotice props={{ icon: "saved", message: historyNotice }} /></div>}
    </SurfaceListCard>

    const progress = <SurfaceCard props={{ label: data.progressTitle }} isLoading={statsLoading}>
        {statsNotice === undefined ? <section className={mockInterviewProgressClassName}>
            {statsRows.slice(0, 4).map((row) => <LabelledProgressRow key={row.id} props={row} isLoading={statsLoading} />)}
            {statsLoading ? null : <div className={mockInterviewActionRowClassName}><Button props={{ label: data.viewStatsLabel, variant: "ghost", size: "sm" }} on={{ press: () => props.on?.selectTab?.("stats") }} /></div>}
        </section> : <div className={mockInterviewCompactStateClassName}><EmptyNotice props={{ icon: "courseLeaderboard", message: statsNotice }} /></div>}
    </SurfaceCard>

    const setup = <SurfaceCard props={{ label: data.setupTitle }} isLoading={loading}>
        <section className={mockInterviewSetupFormClassName} id="mock-interview-new-session" tabIndex={-1}>
            <Text props={{ content: data.setupDescription, size: "sm", tone: "muted" }} isLoading={loading} />
            <div className={mockInterviewFieldClassName}>
                <Text props={{ content: data.modeLabel, size: "sm", weight: "semibold" }} isLoading={loading} />
                <ChoiceTabs props={{ label: data.modeLabel, selectedKey: data.selectedMode, tabs: data.modes, variant: "primary", stackAtNarrow: true }} on={{ select: (key) => props.on?.configure?.("mode", key) }} isLoading={loading} />
                <Text props={{ content: selectedMode?.description ?? "", size: "xs", tone: "muted" }} isLoading={loading} />
            </div>
            <div className={mockInterviewFieldClassName}>
                <Text props={{ content: data.levelLabel, size: "sm", weight: "semibold" }} isLoading={loading} />
                <ChoiceTabs props={{ label: data.levelLabel, selectedKey: data.selectedLevel, tabs: data.levels, variant: "primary", stackAtNarrow: true }} on={{ select: (key) => props.on?.configure?.("level", key) }} isLoading={loading} />
                <Text props={{ content: selectedLevel?.description ?? "", size: "xs", tone: "muted" }} isLoading={loading} />
            </div>
            <Text props={{ content: data.savedNote, size: "xs", tone: "muted" }} isLoading={loading} />
        </section>
    </SurfaceCard>

    const preflight = <section className={mockInterviewPreflightClassName}>
        <div className={mockInterviewSummaryClassName}>
            <Text props={{ content: data.newSessionEyebrow, size: "sm", tone: "accent", weight: "semibold", icon: "talents" }} isLoading={loading} />
            <Heading props={{ content: data.preflightTitle, level: 3 }} isLoading={loading} />
            {[data.focus, selectedMode?.label ?? "", selectedLevel?.label ?? ""].map((value, index) => <div className={mockInterviewFactClassName} key={data.readinessLabels[index]}>
                <Text props={{ content: data.readinessLabels[index] ?? "", size: "xs", tone: "muted" }} isLoading={loading} />
                <Text props={{ content: value, size: "sm", weight: "semibold" }} isLoading={loading} />
            </div>)}
            <Text props={{ content: data.serverNote, size: "xs", tone: "muted" }} isLoading={loading} />
            {data.status === undefined ? null : <Text props={{ content: data.status, size: "sm", weight: "semibold", live: "polite" }} />}
        </div>
        <Button props={{ label: data.startLabel, variant: "primary", disabled: loading || starting, isPending: starting, icon: "next", iconPlacement: "trailing" }} on={{ press: props.on?.start }} isLoading={loading} />
    </section>

    const resume = <ContinuationHighlightCard><section className={mockInterviewResumeClassName}>
        <div className={mockInterviewResumeCopyClassName}><Text props={{ content: data.briefingEyebrow, size: "sm", tone: "accent", weight: "semibold" }} /><Heading props={{ content: data.resumeTitle, level: 3 }} /><Text props={{ content: data.status ?? "", size: "sm", tone: "muted" }} /></div>
        <Button props={{ label: data.resumeLabel, variant: "primary", icon: "next", iconPlacement: "trailing" }} on={{ press: props.on?.resume }} />
    </section></ContinuationHighlightCard>

    const destinationHistory = <SurfaceListCard props={{ label: data.historyTitle, fact: data.historyCountLabel }} isLoading={historyLoading}>{historyNotice === undefined ? renderHistoryRows(historyRows) : <div className={mockInterviewStateClassName}><EmptyNotice props={{ icon: "saved", message: historyNotice, actionLabel: data.returnToBegin }} on={{ act: () => props.on?.selectTab?.("begin") }} /></div>}</SurfaceListCard>
    const destinationStats = <SurfaceListCard props={{ label: data.statsTitle }} isLoading={statsLoading}>{statsNotice === undefined ? <div className={mockInterviewProgressClassName}>{statsRows.map((row) => <LabelledProgressRow key={row.id} props={row} isLoading={statsLoading} />)}</div> : <div className={mockInterviewStateClassName}><EmptyNotice props={{ icon: "courseLeaderboard", message: statsNotice, actionLabel: data.returnToBegin }} on={{ act: () => props.on?.selectTab?.("begin") }} /></div>}</SurfaceListCard>

    const hero = <section className={mockInterviewHeroClassName} aria-labelledby="mock-interview-heading">
        <div className={mockInterviewHeroCopyClassName}>
            <SectionHeader eyebrow={data.heroEyebrow} title={data.title} description={data.description} level={1} id="mock-interview-heading" composition="context-intro" />
            {unavailable || setupState === "resumable" ? null : <div className={mockInterviewHeroActionClassName}><Button props={{ label: data.heroActionLabel, variant: "primary", icon: "next", iconPlacement: "trailing" }} on={{ press: props.on?.prepare }} isLoading={loading} /></div>}
        </div>
        <div className={mockInterviewHeroMediaClassName}>
            <Image className={mockInterviewHeroImageClassName} src="/images/mock-interview/interview-practice-v1.png" alt={data.mediaAlt} width={1536} height={1024} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 34vw, 360px" priority />
        </div>
        <dl className={mockInterviewHeroFactsClassName}>{data.heroFacts.map((fact) => <div className={mockInterviewHeroFactClassName} key={fact.label}><Text props={{ content: fact.label, size: "xs", tone: "muted" }} isLoading={loading} /><Text props={{ content: fact.value, size: "sm", weight: "semibold" }} isLoading={loading} /></div>)}</dl>
    </section>

    const destinationNav = unavailable ? null : <nav className={mockInterviewDestinationNavClassName} aria-label={data.tabsLabel}><ChoiceTabs props={{ label: data.tabsLabel, selectedKey: selectedTab, tabs: data.tabs, variant: "secondary" }} on={{ select: (key) => props.on?.selectTab?.(key as "begin" | "history" | "stats") }} /></nav>
    const unavailableState = <SurfaceCard><section className={mockInterviewStateClassName}><EmptyNotice props={{ icon: setupState === "locked" ? "password" : "retry", message: setupState === "locked" ? data.accessMessage : data.status ?? "", actionLabel: setupState === "locked" ? data.accessLabel : data.retryLabel }} on={{ act: setupState === "locked" ? props.on?.access : props.on?.retry }} /></section></SurfaceCard>
    const beginContent = setupState === "resumable" ? resume : <><div className={mockInterviewLaunchClassName}>{setup}<SurfaceCard>{preflight}</SurfaceCard></div>{isFirstUse ? null : <div className={mockInterviewDashboardClassName}><div className={mockInterviewHistoryPanelClassName}>{recentHistory}</div>{progress}</div>}</>
    const primary = <div className={mockInterviewWorkspaceClassName}>{destinationNav}{unavailable ? unavailableState : selectedTab === "begin" ? beginContent : selectedTab === "history" ? destinationHistory : destinationStats}</div>
    return <main aria-label={data.title}><DashboardShell align="start" header={hero} mainLandmark="caller" primary={primary} /></main>
}
