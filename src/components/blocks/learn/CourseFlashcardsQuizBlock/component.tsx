import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import {
    quizActionRowClassName, quizChoiceRowClassName, quizEvidenceListClassName, quizEvidenceRowClassName,
    quizStatsGridClassName, quizStatsPrimaryCardClassName, quizStatsRowClassName,
    quizFieldGroupClassName, quizFormClassName, quizHeaderClassName, quizNavClassName,
    quizPreflightClassName, quizPreflightStatusClassName, quizResumeClassName, quizSetupGridClassName, quizSetupRegionClassName, quizViewTabsClassName,
    quizWorkflowClassName, quizWorkflowStepClassName,
    quizStateClassName, quizWorkspaceClassName,
} from "./classNames"

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
    const renderState = (message: string, failed: boolean) => <SurfaceCard><section className={quizStateClassName} aria-live={failed ? "assertive" : "polite"}>
        <Heading props={{ content: stateTitle, level: 2 }} />
        <Text props={{ content: message, size: "sm", tone: "muted" }} />
        <div className={quizActionRowClassName}>
            {failed
                ? <Button props={{ label: data.retryLabel, variant: "primary" }} on={{ press: props.on.retry }} />
                : props.pageState === "setup"
                    ? <Button props={{ label: data.exitLabel ?? data.reviewLabel, variant: "outline" }} on={{ press: props.on.openReview }} />
                    : <Button props={{ label: data.setupLabel, variant: "primary" }} on={{ press: () => props.on.selectView("setup") }} />}
        </div>
    </section></SurfaceCard>
    const resumeSurface = data.resumeSessionId === undefined ? null : <SurfaceCard><section className={quizResumeClassName} aria-label={data.resumeLabel}>
        <div><Heading props={{ content: data.resumeLabel, level: 3 }} /><Text props={{ content: `${data.cardCount} ${data.cardsLabel}`, size: "sm", tone: "muted" }} /></div>
        <Button props={{ label: data.resumeLabel, variant: "primary" }} on={{ press: () => props.on.resume(data.resumeSessionId!) }} />
    </section></SurfaceCard>
    const setupSurface = <div className={quizSetupGridClassName}>
        <SurfaceCard props={{ label: data.configurationTitle }} isLoading={loading}><section className={quizFormClassName}>
            <Text props={{ content: data.serverDrawDescription, size: "sm", tone: "muted" }} isLoading={loading} />
            <div className={quizFieldGroupClassName}><Text props={{ content: data.modeLabel, size: "sm", weight: "semibold" }} /><div className={quizChoiceRowClassName}>{(["quick", "deep"] as const).map((mode) => <Button key={mode} props={{ label: mode === "quick" ? data.quickLabel : data.deepLabel, size: "sm", variant: data.selectedMode === mode ? "primary" : "outline", disabled: data.resumeSessionId !== undefined }} on={{ press: () => props.on.selectMode(mode) }} />)}</div></div>
        </section></SurfaceCard>
        <SurfaceCard props={{ label: data.eligibilityTitle ?? data.quizLabel }} isLoading={loading}><aside className={quizPreflightClassName}>
            <div className={quizPreflightStatusClassName} aria-live="polite">
                <Heading props={{ content: data.resumeSessionId !== undefined ? data.activeSessionText ?? data.resumeLabel : eligible ? data.eligibilityReadyText ?? data.startLabel : data.eligibilityBlockedText ?? data.emptyText, level: 3 }} isLoading={loading} />
                <Text props={{ content: `${data.cardCount} ${data.cardsLabel} · ${data.requiredCardsLabel ?? "minimum"} ${requiredCount}`, size: "sm", weight: "medium" }} isLoading={loading} />
            </div>
            {data.startErrorText === undefined ? null : <Text props={{ content: data.startErrorText, size: "sm", weight: "semibold" }} />}
            <Button props={{ label: data.startLabel, variant: "primary", disabled: !eligible || data.resumeSessionId !== undefined, isPending: data.startPending }} on={{ press: props.on.start }} isLoading={loading} />
        </aside></SurfaceCard>
    </div>
    const workflowSurface = <SurfaceCard props={{ label: data.workflowTitle }}><ol className={quizWorkflowClassName}>
        {data.workflowSteps.map((step, index) => <li className={quizWorkflowStepClassName} key={step}>
            <Text props={{ content: String(index + 1).padStart(2, "0"), size: "sm", tone: "accent", weight: "semibold" }} />
            <Text props={{ content: step, size: "sm" }} />
        </li>)}
    </ol></SurfaceCard>
    const body = props.blockState === "failed"
        ? <>{resumeSurface}{renderState(data.failedText, true)}</>
        : props.blockState === "empty"
            ? <>{resumeSurface}{renderState(emptyMessage, false)}</>
            : props.pageState === "setup"
                ? <section className={quizSetupRegionClassName} aria-label={data.configurationTitle}>{resumeSurface}{setupSurface}{workflowSurface}</section>
                : <>{resumeSurface}<SurfaceListCard props={{ label: data.evidenceTitle }} isLoading={loading}><ul className={props.pageState === "stats" ? quizStatsGridClassName : quizEvidenceListClassName}>{data.evidenceRows.map((row) => <li className={props.pageState === "stats" ? row.id === "concept-coverage" ? quizStatsPrimaryCardClassName : quizStatsRowClassName : quizEvidenceRowClassName} key={row.id}><Text props={{ content: row.title, size: "sm", weight: "medium" }} /><Text props={{ content: row.description, size: "sm", tone: "muted" }} /><Text props={{ content: row.fact, size: props.pageState === "stats" ? "md" : "xs", weight: props.pageState === "stats" ? "semibold" : undefined, tone: props.pageState === "stats" ? undefined : "muted" }} /></li>)}</ul></SurfaceListCard></>

    return <main className={quizWorkspaceClassName} aria-label={data.title}>
        <header className={quizHeaderClassName}><Heading props={{ content: data.title, level: 1 }} /><Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} /></header>
        <nav className={quizNavClassName} aria-label={data.title}>
            <NavLink props={{ label: data.reviewLabel, kind: "route" }} on={{ press: props.on.openReview }} />
            <div className={quizViewTabsClassName} role="tablist" aria-label={data.quizLabel}>
                {(["setup", "history", "stats"] as const).map((view) => <NavLink key={view} props={{ label: view === "setup" ? data.setupLabel : view === "history" ? data.historyLabel : data.statsLabel, kind: "tab", isCurrent: props.pageState === view }} on={{ press: () => props.on.selectView(view) }} />)}
            </div>
        </nav>

        {body}
    </main>
}
