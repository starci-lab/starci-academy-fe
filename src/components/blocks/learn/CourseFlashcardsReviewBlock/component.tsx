import { ModalBranch } from "@/components/branches/ModalBranch"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@/components/leaves/Heading"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import {
    flashcardActionRowClassName, flashcardDeckCardClassName, flashcardDeckDescriptionClassName, flashcardDeckSectionClassName, flashcardDeckToolbarClassName,
    flashcardDueCardClassName, flashcardEvidenceListClassName, flashcardEvidenceRowClassName,
    flashcardFactRowClassName, flashcardHubClassName, flashcardHubHeaderClassName,
    flashcardModalClassName, flashcardModeCardClassName, flashcardModeCopyClassName,
    flashcardModeGridClassName, flashcardModeSectionClassName, flashcardOverviewClassName,
    flashcardStateClassName,
    flashcardViewNavClassName, getFlashcardDeckGridClassName,
} from "./classNames"

/** One deck summary and its mode eligibility. */
export type FlashcardReviewDeckRow = { readonly id: string; readonly title: string; readonly description: string; readonly difficulty: string; readonly cardCount: number; readonly dueCount: number; readonly masteredCount: number; readonly quizEligible: boolean }
/** One persisted history or study-health fact. */
export type FlashcardReviewEvidenceRow = { readonly id: string; readonly title: string; readonly description: string; readonly fact: string }
/** Secondary evidence surface visible below the mode gateway. */
export type FlashcardReviewView = "overview" | "history" | "stats"
/** Deck-library density selected by the learner. */
export type FlashcardReviewLayout = "grid" | "line"
/** Transport state owned by the Flashcard hub. */
export type CourseFlashcardsReviewBlockState = "pending" | "ready" | "empty" | "failed"
type ReviewScope = "all" | "due"

/** Resolved Flashcard hub content and legal interactions. */
export type CourseFlashcardsReviewProps = {
    readonly pageState: FlashcardReviewView
    readonly blockState: CourseFlashcardsReviewBlockState
    readonly props: {
        readonly title: string; readonly subtitle: string; readonly gatewayTitle?: string; readonly gatewayDescription?: string
        readonly reviewLabel: string; readonly reviewDescription?: string; readonly reviewActionLabel?: string; readonly quizLabel: string; readonly quizTitleLabel?: string; readonly quizDescription?: string; readonly quizActionLabel?: string
        readonly modeTabsLabel: string; readonly viewTabsLabel: string; readonly overviewLabel: string; readonly historyLabel: string; readonly statsLabel: string; readonly activeView: FlashcardReviewView
        readonly dueTitle: string; readonly dueDescription: string; readonly decksTitle: string; readonly evidenceTitle: string
        readonly cardsLabel: string; readonly dueLabel: string; readonly masteredLabel: string; readonly startLabel: string; readonly quizDeckLabel: string
        readonly resumeLabel: string; readonly resumeActionLabel?: string; readonly resumeDescription?: string; readonly activeSessionText?: string; readonly retryLabel: string; readonly emptyTitle?: string; readonly emptyText: string; readonly emptyActionLabel?: string
        readonly evidenceEmptyText: string; readonly noResultsTitle: string; readonly noResultsText: string; readonly failedText: string; readonly dueCount: number; readonly quizCardCount: number
        readonly statRows: ReadonlyArray<{ readonly label: string; readonly value: string }>
        readonly decks: ReadonlyArray<FlashcardReviewDeckRow>; readonly evidenceRows: ReadonlyArray<FlashcardReviewEvidenceRow>
        readonly searchLabel: string; readonly searchClearLabel: string; readonly searchValue: string; readonly foundText: string
        readonly layoutLabel: string; readonly gridLabel: string; readonly lineLabel: string; readonly layout: FlashcardReviewLayout
        readonly resumeSessionId?: string; readonly modalOpen: boolean; readonly modalTitle: string; readonly modalDescription: string
        readonly reviewAllLabel: string; readonly reviewDueLabel: string; readonly cancelLabel: string; readonly selectedScope: ReviewScope
        readonly selectedDeckId?: string; readonly startPending: boolean; readonly startErrorText?: string
    }
    readonly on: {
        readonly openQuiz: (deckId?: string) => void; readonly openCourse?: () => void; readonly selectView: (view: FlashcardReviewView) => void
        readonly changeSearch: (value: string) => void; readonly changeLayout: (layout: FlashcardReviewLayout) => void; readonly openReview: (deckId: string) => void
        readonly startDue: () => void; readonly selectScope: (scope: ReviewScope) => void; readonly confirmReview: () => void; readonly dismissModal: () => void
        readonly resume: (sessionId: string) => void; readonly retry: () => void
    }
}

/** Stable alias for the Flashcard hub renderer contract. */
export type CourseFlashcardsReviewBlockProps = CourseFlashcardsReviewProps

/** Draw the explicit mode gateway, Study library, evidence, and owned boundary states. */
export const CourseFlashcardsReviewBlockBase = (props: CourseFlashcardsReviewBlockProps) => {
    const data = props.props
    const loading = props.blockState === "pending"
    const unavailable = props.blockState === "empty"
    const failed = props.blockState === "failed"
    const gatewayTitle = data.gatewayTitle ?? data.modeTabsLabel
    const gatewayDescription = data.gatewayDescription ?? data.subtitle
    const renderState = (message: string, isFailure: boolean, title = isFailure ? data.title : data.emptyTitle ?? data.title, showCourseAction = true) => <SurfaceCard><section className={flashcardStateClassName} aria-live={isFailure ? "assertive" : "polite"}>
        <Heading props={{ content: title, level: 2 }} />
        <Text props={{ content: message, size: "sm", tone: "muted" }} />
        <div className={flashcardActionRowClassName}>
            {isFailure ? <Button props={{ label: data.retryLabel, variant: "primary" }} on={{ press: props.on.retry }} /> : null}
            {props.pageState === "overview" ? null : <Button props={{ label: data.overviewLabel, variant: isFailure ? "outline" : "primary" }} on={{ press: () => props.on.selectView("overview") }} />}
            {!showCourseAction || props.pageState !== "overview" || props.on.openCourse === undefined || data.emptyActionLabel === undefined ? null : <Button props={{ label: data.emptyActionLabel, variant: isFailure ? "outline" : "primary" }} on={{ press: props.on.openCourse }} />}
        </div>
    </section></SurfaceCard>

    if ((failed || unavailable) && props.pageState === "overview") {
        return <main className={flashcardHubClassName} aria-label={data.title}>
            <header className={flashcardHubHeaderClassName}><Heading props={{ content: data.title, level: 1 }} /><Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} /></header>
            {renderState(failed ? data.failedText : data.emptyText, failed)}
        </main>
    }

    return <>
        <main className={flashcardHubClassName} aria-label={data.title}>
            <header className={flashcardHubHeaderClassName}><Heading props={{ content: data.title, level: 1 }} /><Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} /></header>

            <section className={flashcardModeSectionClassName} aria-label={gatewayTitle}>
                <div><Heading props={{ content: gatewayTitle, level: 2 }} /><Text props={{ content: gatewayDescription, size: "sm", tone: "muted" }} /></div>
                <div className={flashcardModeGridClassName}>
                    <SurfaceCard isLoading={loading}><article className={flashcardModeCardClassName}>
                        <div className={flashcardModeCopyClassName}><Heading props={{ content: data.reviewLabel, level: 3 }} /><Text props={{ content: data.reviewDescription ?? data.dueDescription, size: "sm", tone: "muted" }} /><div className={flashcardFactRowClassName}><Text props={{ content: `${data.dueCount} ${data.cardsLabel} ${data.dueLabel}`, size: "sm", weight: "medium" }} isLoading={loading} /></div></div>
                        {data.resumeSessionId === undefined ? <Button props={{ label: data.reviewActionLabel ?? `Open ${data.reviewLabel}`, variant: "primary", disabled: loading || data.dueCount === 0, isPending: data.startPending }} on={{ press: props.on.startDue }} isLoading={loading} /> : <Button props={{ label: data.resumeActionLabel ?? data.resumeLabel, variant: "primary", disabled: loading }} on={{ press: () => props.on.resume(data.resumeSessionId!) }} isLoading={loading} />}
                    </article></SurfaceCard>
                    <SurfaceCard isLoading={loading}><article className={flashcardModeCardClassName}>
                        <div className={flashcardModeCopyClassName}><Heading props={{ content: data.quizTitleLabel ?? `Quick ${data.quizLabel}`, level: 3 }} /><Text props={{ content: data.quizDescription ?? data.subtitle, size: "sm", tone: "muted" }} /><div className={flashcardFactRowClassName}><Text props={{ content: `${data.quizCardCount} ${data.cardsLabel}`, size: "sm", weight: "medium" }} isLoading={loading} /></div></div>
                        <Button props={{ label: data.quizActionLabel ?? data.quizLabel, variant: "primary", disabled: loading }} on={{ press: () => props.on.openQuiz() }} isLoading={loading} />
                    </article></SurfaceCard>
                </div>
            </section>

            <div className={flashcardViewNavClassName}><ChoiceTabs props={{ label: data.viewTabsLabel, selectedKey: data.activeView, variant: "secondary", tabs: [{ id: "overview", label: data.overviewLabel }, { id: "history", label: data.historyLabel }, { id: "stats", label: data.statsLabel }] }} on={{ select: (key) => { if (key === "overview" || key === "history" || key === "stats") props.on.selectView(key) } }} /></div>

            {props.pageState === "overview" ? <div className={flashcardOverviewClassName}>
                <SurfaceCard props={{ label: data.dueTitle }} isLoading={loading}><section className={flashcardDueCardClassName}><Text props={{ content: data.dueDescription, size: "sm", tone: "muted" }} /><Text props={{ content: `${data.dueCount} ${data.dueLabel}`, size: "sm", weight: "medium" }} isLoading={loading} />{data.resumeSessionId !== undefined ? <Text props={{ content: data.activeSessionText ?? data.resumeDescription, size: "sm", weight: "semibold" }} /> : data.dueCount === 0 ? null : <Button props={{ label: data.startLabel, variant: "primary", isPending: data.startPending }} on={{ press: props.on.startDue }} />}</section></SurfaceCard>
                <section className={flashcardDeckSectionClassName} aria-label={data.decksTitle}>
                    <div className={flashcardDeckToolbarClassName}><div><Heading props={{ content: data.decksTitle, level: 2 }} /><Text props={{ content: data.foundText, size: "sm", tone: "muted" }} isLoading={loading} /></div><div className={flashcardActionRowClassName} aria-label={data.layoutLabel}><Button props={{ label: data.gridLabel, size: "sm", variant: data.layout === "grid" ? "primary" : "outline" }} on={{ press: () => props.on.changeLayout("grid") }} /><Button props={{ label: data.lineLabel, size: "sm", variant: data.layout === "line" ? "primary" : "outline" }} on={{ press: () => props.on.changeLayout("line") }} /></div></div>
                    <SearchBox props={{ placeholder: data.searchLabel, label: data.searchLabel, clearLabel: data.searchClearLabel }} on={{ search: props.on.changeSearch }} />
                    {loading ? <div className={getFlashcardDeckGridClassName(data.layout)}>{[1, 2, 3].map((position) => <SurfaceCard key={position} isLoading><article className={flashcardDeckCardClassName}><Heading props={{ content: data.decksTitle, level: 3 }} isLoading /><Text props={{ content: data.subtitle, size: "sm" }} isLoading /></article></SurfaceCard>)}</div> : data.decks.length === 0 ? renderState(data.noResultsText, false, data.noResultsTitle, false) : <div className={getFlashcardDeckGridClassName(data.layout)}>{data.decks.map((deck) => <SurfaceCard key={deck.id}><article className={flashcardDeckCardClassName}>
                        <Heading props={{ content: deck.title, level: 3 }} /><div className={flashcardDeckDescriptionClassName}><Text props={{ content: deck.description, size: "sm", tone: "muted" }} /></div><Text props={{ content: [deck.difficulty, `${deck.cardCount} ${data.cardsLabel}`, `${deck.dueCount} ${data.dueLabel}`, `${deck.masteredCount} ${data.masteredLabel}`].join(" · "), size: "xs", tone: "muted" }} />
                        <div className={flashcardActionRowClassName}><Button props={{ label: data.startLabel, size: "sm", variant: "outline", disabled: data.resumeSessionId !== undefined }} on={{ press: () => props.on.openReview(deck.id) }} />{deck.quizEligible ? <Button props={{ label: data.quizDeckLabel, size: "sm", variant: "outline" }} on={{ press: () => props.on.openQuiz(deck.id) }} /> : null}</div>
                    </article></SurfaceCard>)}</div>}
                </section>
            </div> : failed || unavailable ? renderState(failed ? data.failedText : data.evidenceEmptyText, failed, data.evidenceTitle) : <SurfaceListCard props={{ label: data.evidenceTitle }} isLoading={loading}><ul className={flashcardEvidenceListClassName}>{data.evidenceRows.map((row) => <li className={flashcardEvidenceRowClassName} key={row.id}><Text props={{ content: row.title, size: "sm", weight: "medium" }} /><Text props={{ content: row.description, size: "sm", tone: "muted" }} /><Text props={{ content: row.fact, size: "xs", tone: "muted" }} /></li>)}</ul></SurfaceListCard>}
        </main>

        <ModalBranch isOpen={data.modalOpen} size="md" onDismiss={props.on.dismissModal}><section className={flashcardModalClassName}>
            <Heading props={{ content: data.modalTitle, level: 2 }} /><Text props={{ content: data.modalDescription, size: "sm", tone: "muted" }} />
            <div className={flashcardActionRowClassName}><Button props={{ label: data.reviewAllLabel, variant: data.selectedScope === "all" ? "primary" : "outline" }} on={{ press: () => props.on.selectScope("all") }} /><Button props={{ label: data.reviewDueLabel, variant: data.selectedScope === "due" ? "primary" : "outline" }} on={{ press: () => props.on.selectScope("due") }} /></div>
            {data.startErrorText === undefined ? null : <Text props={{ content: data.startErrorText, size: "sm", weight: "semibold" }} />}
            <div className={flashcardActionRowClassName}><Button props={{ label: data.cancelLabel, variant: "outline" }} on={{ press: props.on.dismissModal }} /><Button props={{ label: data.startLabel, variant: "primary", isPending: data.startPending }} on={{ press: props.on.confirmReview }} /></div>
        </section></ModalBranch>
    </>
}
