import Image from "next/image"
import { WorkspaceShell, SectionHeader, Button } from "@starci/grammar/common"
import { ContinuationHighlightCard } from "@/components/branches/ContinuationHighlightCard"
import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Icon } from "@starci/grammar/common"

import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
                    <Text size={"sm"} weight={"medium"} isSkeleton={historyLoading}>{row.title}</Text>
                    <Text size={"xs"} tone={"muted"} isSkeleton={historyLoading}>{row.fact}</Text>
                </div>
                {historyLoading ? null : <Button variant={"ghost"} size={"sm"} onPress={({ press: () => props.on?.openHistory?.(row.id) })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{data.historyActionLabel}</Button>}
            </li>)}
        </ul>
    )

    const recentHistory = <SurfaceListCard labelEnd={historyLoading ? undefined : <Button variant={"secondary"} size={"sm"} onPress={({ press: () => props.on?.selectTab?.("history") })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{data.viewHistoryLabel}</Button>} label={data.recentHistoryTitle} fact={data.historyCountLabel} isLoading={historyLoading}>
        {historyNotice === undefined ? renderHistoryRows(historyRows.slice(0, 3)) : <div className={mockInterviewCompactStateClassName}><EmptyNotice message={historyNotice} iconSource={iconSourceFor("saved", "leading")} /></div>}
    </SurfaceListCard>

    const progress = <SurfaceCard label={data.progressTitle} composition="joined" state={statsLoading ? "pending" : "neutral"}>
        {statsNotice === undefined ? <section className={mockInterviewProgressClassName}>
            {statsRows.slice(0, 4).map((row) => <LabelledProgressRow key={row.id} props={row} isLoading={statsLoading} />)}
            {statsLoading ? null : <div className={mockInterviewActionRowClassName}><Button variant="ghost" size="sm" onPress={() => props.on?.selectTab?.("stats")}>{data.viewStatsLabel}</Button></div>}
        </section> : <div className={mockInterviewCompactStateClassName}><EmptyNotice message={statsNotice} iconSource={iconSourceFor("courseLeaderboard", "leading")} /></div>}
    </SurfaceCard>

    const setup = <SurfaceCard label={data.setupTitle} composition="joined" state={loading ? "pending" : "neutral"}>
        <section className={mockInterviewSetupFormClassName} id="mock-interview-new-session" tabIndex={-1}>
            <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{data.setupDescription}</Text>
            <div className={mockInterviewFieldClassName}>
                <Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{data.modeLabel}</Text>
                <ChoiceTabs props={{ label: data.modeLabel, selectedKey: data.selectedMode, tabs: data.modes, variant: "primary", stackAtNarrow: true }} on={{ select: (key) => props.on?.configure?.("mode", key) }} isLoading={loading} />
                <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{selectedMode?.description ?? ""}</Text>
            </div>
            <div className={mockInterviewFieldClassName}>
                <Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{data.levelLabel}</Text>
                <ChoiceTabs props={{ label: data.levelLabel, selectedKey: data.selectedLevel, tabs: data.levels, variant: "primary", stackAtNarrow: true }} on={{ select: (key) => props.on?.configure?.("level", key) }} isLoading={loading} />
                <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{selectedLevel?.description ?? ""}</Text>
            </div>
            <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{data.savedNote}</Text>
        </section>
    </SurfaceCard>

    const preflight = <section className={mockInterviewPreflightClassName}>
        <div className={mockInterviewSummaryClassName}>
            <Text size={"sm"} tone={"accent"} weight={"semibold"} startContent={<Icon source={iconSourceFor("talents", "chip")} role="chip" />} isSkeleton={loading}>{data.newSessionEyebrow}</Text>
            <Heading level={3} isSkeleton={loading}>{data.preflightTitle}</Heading>
            {[data.focus, selectedMode?.label ?? "", selectedLevel?.label ?? ""].map((value, index) => <div className={mockInterviewFactClassName} key={data.readinessLabels[index]}>
                <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{data.readinessLabels[index] ?? ""}</Text>
                <Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{value}</Text>
            </div>)}
            <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{data.serverNote}</Text>
            {data.status === undefined ? null : <Text size={"sm"} weight={"semibold"} live={"polite"}>{data.status}</Text>}
        </div>
        <Button variant={"primary"} isDisabled={loading || starting} isPending={starting} isSkeleton={loading} onPress={({ press: props.on?.start })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{data.startLabel}</Button>
    </section>

    const resume = <ContinuationHighlightCard><section className={mockInterviewResumeClassName}>
        <div className={mockInterviewResumeCopyClassName}><Text size={"sm"} tone={"accent"} weight={"semibold"}>{data.briefingEyebrow}</Text><Heading level={3}>{data.resumeTitle}</Heading><Text size={"sm"} tone={"muted"}>{data.status ?? ""}</Text></div>
        <Button variant={"primary"} onPress={({ press: props.on?.resume })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{data.resumeLabel}</Button>
    </section></ContinuationHighlightCard>

    const destinationHistory = <SurfaceListCard label={data.historyTitle} fact={data.historyCountLabel} isLoading={historyLoading}>{historyNotice === undefined ? renderHistoryRows(historyRows) : <div className={mockInterviewStateClassName}><EmptyNotice message={historyNotice} actionLabel={data.returnToBegin} iconSource={iconSourceFor("saved", "leading")} onAction={({ act: () => props.on?.selectTab?.("begin") })?.act} /></div>}</SurfaceListCard>
    const destinationStats = <SurfaceListCard label={data.statsTitle} isLoading={statsLoading}>{statsNotice === undefined ? <div className={mockInterviewProgressClassName}>{statsRows.map((row) => <LabelledProgressRow key={row.id} props={row} isLoading={statsLoading} />)}</div> : <div className={mockInterviewStateClassName}><EmptyNotice message={statsNotice} actionLabel={data.returnToBegin} iconSource={iconSourceFor("courseLeaderboard", "leading")} onAction={({ act: () => props.on?.selectTab?.("begin") })?.act} /></div>}</SurfaceListCard>

    const hero = <section className={mockInterviewHeroClassName} aria-labelledby="mock-interview-heading">
        <div className={mockInterviewHeroCopyClassName}>
            <SectionHeader eyebrow={data.heroEyebrow} title={data.title} description={data.description} level={1} id="mock-interview-heading" composition="context-intro" />
            {unavailable || setupState === "resumable" ? null : <div className={mockInterviewHeroActionClassName}><Button variant={"primary"} isSkeleton={loading} onPress={({ press: props.on?.prepare })?.press} endContent={"next" === "next" && "trailing" === "trailing" ? <Icon source={iconSourceFor("next", "chip")} role="chip" /> : undefined}>{data.heroActionLabel}</Button></div>}
        </div>
        <div className={mockInterviewHeroMediaClassName}>
            <Image className={mockInterviewHeroImageClassName} src="/images/mock-interview/interview-practice-v1.png" alt={data.mediaAlt} width={1536} height={1024} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 34vw, 360px" priority />
        </div>
        <dl className={mockInterviewHeroFactsClassName}>{data.heroFacts.map((fact) => <div className={mockInterviewHeroFactClassName} key={fact.label}><Text size={"xs"} tone={"muted"} isSkeleton={loading}>{fact.label}</Text><Text size={"sm"} weight={"semibold"} isSkeleton={loading}>{fact.value}</Text></div>)}</dl>
    </section>

    const destinationNav = unavailable ? null : <nav className={mockInterviewDestinationNavClassName} aria-label={data.tabsLabel}><ChoiceTabs props={{ label: data.tabsLabel, selectedKey: selectedTab, tabs: data.tabs, variant: "secondary" }} on={{ select: (key) => props.on?.selectTab?.(key as "begin" | "history" | "stats") }} /></nav>
    const unavailableState = <SurfaceCard composition="joined"><section className={mockInterviewStateClassName}><EmptyNotice message={setupState === "locked" ? data.accessMessage : data.status ?? ""} actionLabel={setupState === "locked" ? data.accessLabel : data.retryLabel} iconSource={iconSourceFor(setupState === "locked" ? "password" : "retry", "leading")} onAction={({ act: setupState === "locked" ? props.on?.access : props.on?.retry })?.act} /></section></SurfaceCard>
    const beginContent = setupState === "resumable" ? resume : <><div className={mockInterviewLaunchClassName}>{setup}<SurfaceCard composition="joined">{preflight}</SurfaceCard></div>{isFirstUse ? null : <div className={mockInterviewDashboardClassName}><div className={mockInterviewHistoryPanelClassName}>{recentHistory}</div>{progress}</div>}</>
    const primary = <div className={mockInterviewWorkspaceClassName}>{destinationNav}{unavailable ? unavailableState : selectedTab === "begin" ? beginContent : selectedTab === "history" ? destinationHistory : destinationStats}</div>
    return <main aria-label={data.title}><WorkspaceShell align="start" header={hero} mainLandmark="caller" primary={primary} /></main>
}
