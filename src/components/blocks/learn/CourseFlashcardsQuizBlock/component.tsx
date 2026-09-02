import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import {
    quizActionRowClassName, quizChoiceRowClassName, quizEvidenceListClassName, quizEvidenceRowClassName,
    quizStatsGridClassName, quizStatsPrimaryCardClassName, quizStatsRowClassName,
    quizFieldGroupClassName, quizFormClassName, quizHeaderClassName, quizNavClassName,
    quizPreflightClassName, quizPreflightStatusClassName, quizResumeClassName, quizSetupGridClassName, quizSetupRegionClassName, quizViewTabsClassName,
    quizWorkflowClassName, quizWorkflowStepClassName,
    quizStateClassName, quizWorkspaceClassName,
} from "./classNames"
import { TextAction } from "@starci/grammar/common"


/** Secondary surface shown within the Quick quiz route. */
export type FlashcardQuizView = "setup" | "history" | "stats"
/** Transport state owned by the Quick quiz route. */
export type CourseFlashcardsQuizBlockState = "pending" | "ready" | "empty" | "failed"
/** One persisted Quiz history or performance fact. */
export type FlashcardQuizEvidenceRow = { readonly id: string; readonly title: string; readonly description: string; readonly fact: string }
/** Resolved Quick quiz setup content and legal interactions. */
export type CourseFlashcardsQuizProps = {
    readonly pageState: FlashcardQuizView
    readonly blockState: CourseFlashcardsQuizBlockState
    readonly props: {
        readonly title: string; readonly subtitle: string; readonly reviewLabel: string; readonly quizLabel: string
        readonly setupLabel: string; readonly historyLabel: string; readonly statsLabel: string; readonly activeView: FlashcardQuizView
        readonly evidenceTitle: string; readonly evidenceRows: ReadonlyArray<FlashcardQuizEvidenceRow>; readonly configurationTitle: string
        readonly workflowTitle: string; readonly workflowSteps: ReadonlyArray<string>
        readonly historyEmptyText?: string; readonly statsEmptyText?: string
        readonly serverDrawDescription: string; readonly modeLabel: string; readonly quickLabel: string; readonly deepLabel: string
        readonly startLabel: string; readonly resumeLabel: string; readonly retryLabel: string; readonly emptyText: string; readonly failedText: string
        readonly eligibilityTitle?: string; readonly eligibilityReadyText?: string; readonly eligibilityBlockedText?: string; readonly activeSessionText?: string; readonly exitLabel?: string
        readonly startErrorText?: string; readonly startPending?: boolean
        readonly selectedMode: "quick" | "deep"; readonly cardCount: number; readonly requiredCardCount?: number
        readonly cardsLabel: string; readonly requiredCardsLabel?: string; readonly resumeSessionId?: string
    }
    readonly on: {
        readonly openReview: () => void; readonly selectView: (view: FlashcardQuizView) => void; readonly selectMode: (mode: "quick" | "deep") => void
        readonly start: () => void; readonly resume: (sessionId: string) => void; readonly retry: () => void
    }
}

/** Stable alias for the Quick quiz renderer contract. */
export type CourseFlashcardsQuizBlockProps = CourseFlashcardsQuizProps

/** Draw scored-Quiz setup with an explicit eligibility owner and complete recovery. */
export const CourseFlashcardsQuizBlockBase = (props: CourseFlashcardsQuizBlockProps) => {
    const data = props.props
    const loading = props.blockState === "pending"
    const requiredCount = data.requiredCardCount ?? (data.selectedMode === "quick" ? 5 : 10)
    const eligible = data.cardCount >= requiredCount
    const stateTitle = props.pageState === "setup" ? data.configurationTitle : data.evidenceTitle
    const emptyMessage = props.pageState === "history" ? data.historyEmptyText ?? data.emptyText : props.pageState === "stats" ? data.statsEmptyText ?? data.emptyText : data.emptyText
    const renderState = (message: string, failed: boolean) => <SurfaceCard composition="joined"><section className={quizStateClassName} aria-live={failed ? "assertive" : "polite"}>
        <Heading level={2}>{stateTitle}</Heading>
        <Text size={"sm"} tone={"muted"}>{message}</Text>
        <div className={quizActionRowClassName}>
            {failed
                ? <Button variant="primary" onPress={props.on.retry}>{data.retryLabel}</Button>
                : props.pageState === "setup"
                    ? <Button variant="outline" onPress={props.on.openReview}>{data.exitLabel ?? data.reviewLabel}</Button>
                    : <Button variant="primary" onPress={() => props.on.selectView("setup")}>{data.setupLabel}</Button>}
        </div>
    </section></SurfaceCard>
    const resumeSurface = data.resumeSessionId === undefined ? null : <SurfaceCard composition="joined"><section className={quizResumeClassName} aria-label={data.resumeLabel}>
        <div><Heading level={3}>{data.resumeLabel}</Heading><Text size={"sm"} tone={"muted"}>{`${data.cardCount} ${data.cardsLabel}`}</Text></div>
        <Button variant="primary" onPress={() => props.on.resume(data.resumeSessionId!)}>{data.resumeLabel}</Button>
    </section></SurfaceCard>
    const setupSurface = <div className={quizSetupGridClassName}>
        <SurfaceCard label={data.configurationTitle} composition="joined" state={loading ? "pending" : "neutral"}><section className={quizFormClassName}>
            <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{data.serverDrawDescription}</Text>
            <div className={quizFieldGroupClassName}><Text size={"sm"} weight={"semibold"}>{data.modeLabel}</Text><div className={quizChoiceRowClassName}>{(["quick", "deep"] as const).map((mode) => <Button key={mode} variant={data.selectedMode === mode ? "primary" : "outline"} size="sm" isDisabled={data.resumeSessionId !== undefined} onPress={() => props.on.selectMode(mode)}>{mode === "quick" ? data.quickLabel : data.deepLabel}</Button>)}</div></div>
        </section></SurfaceCard>
        <SurfaceCard label={data.eligibilityTitle ?? data.quizLabel} composition="joined" state={loading ? "pending" : "neutral"}><aside className={quizPreflightClassName}>
            <div className={quizPreflightStatusClassName} aria-live="polite">
                <Heading level={3} isSkeleton={loading}>{data.resumeSessionId !== undefined ? data.activeSessionText ?? data.resumeLabel : eligible ? data.eligibilityReadyText ?? data.startLabel : data.eligibilityBlockedText ?? data.emptyText}</Heading>
                <Text size={"sm"} weight={"medium"} isSkeleton={loading}>{`${data.cardCount} ${data.cardsLabel} · ${data.requiredCardsLabel ?? "minimum"} ${requiredCount}`}</Text>
            </div>
            {data.startErrorText === undefined ? null : <Text size={"sm"} weight={"semibold"}>{data.startErrorText}</Text>}
            <Button variant={"primary"} isDisabled={!eligible || data.resumeSessionId !== undefined} isPending={data.startPending} isSkeleton={loading} onPress={({ press: props.on.start })?.press}>{data.startLabel}</Button>
        </aside></SurfaceCard>
    </div>
    const workflowSurface = <SurfaceCard label={data.workflowTitle} composition="joined"><ol className={quizWorkflowClassName}>
        {data.workflowSteps.map((step, index) => <li className={quizWorkflowStepClassName} key={step}>
            <Text size={"sm"} tone={"accent"} weight={"semibold"}>{String(index + 1).padStart(2, "0")}</Text>
            <Text size={"sm"}>{step}</Text>
        </li>)}
    </ol></SurfaceCard>
    const body = props.blockState === "failed"
        ? <>{resumeSurface}{renderState(data.failedText, true)}</>
        : props.blockState === "empty"
            ? <>{resumeSurface}{renderState(emptyMessage, false)}</>
            : props.pageState === "setup"
                ? <section className={quizSetupRegionClassName} aria-label={data.configurationTitle}>{resumeSurface}{setupSurface}{workflowSurface}</section>
                : <>{resumeSurface}<SurfaceListCard label={data.evidenceTitle} isLoading={loading}><ul className={props.pageState === "stats" ? quizStatsGridClassName : quizEvidenceListClassName}>{data.evidenceRows.map((row) => <li className={props.pageState === "stats" ? row.id === "concept-coverage" ? quizStatsPrimaryCardClassName : quizStatsRowClassName : quizEvidenceRowClassName} key={row.id}><Text size={"sm"} weight={"medium"}>{row.title}</Text><Text size={"sm"} tone={"muted"}>{row.description}</Text><Text size={props.pageState === "stats" ? "md" : "xs"} tone={props.pageState === "stats" ? undefined : "muted"} weight={props.pageState === "stats" ? "semibold" : undefined}>{row.fact}</Text></li>)}</ul></SurfaceListCard></>

    return <main className={quizWorkspaceClassName} aria-label={data.title}>
        <header className={quizHeaderClassName}><Heading level={1}>{data.title}</Heading><Text size={"sm"} tone={"muted"}>{data.subtitle}</Text></header>
        <nav className={quizNavClassName} aria-label={data.title}>
            <TextAction appearance={"route"} onPress={props.on.openReview}>{data.reviewLabel}</TextAction>
            <div className={quizViewTabsClassName} role="tablist" aria-label={data.quizLabel}>
                {(["setup", "history", "stats"] as const).map((view) => <TextAction key={view} appearance={"tab"} isCurrent={props.pageState === view} onPress={() => props.on.selectView(view)}>{view === "setup" ? data.setupLabel : view === "history" ? data.historyLabel : data.statsLabel}</TextAction>)}
            </div>
        </nav>

        {body}
    </main>
}
