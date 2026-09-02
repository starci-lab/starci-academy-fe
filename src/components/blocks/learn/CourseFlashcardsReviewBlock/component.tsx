import { ModalBranch } from "@/components/branches/ModalBranch"
import { SurfaceCard } from "@starci/grammar/common"
import { SurfaceListCard } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Heading } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@starci/grammar/common"
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
export type FlashcardReviewEvidenceRow = { readonly id: string; readonly title: string; readonly description: string; readonly fact: string; readonly percent?: number }
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
    const renderState = (message: string, isFailure: boolean, title = isFailure ? data.title : data.emptyTitle ?? data.title, showCourseAction = true) => <SurfaceCard composition="joined"><section className={flashcardStateClassName} aria-live={isFailure ? "assertive" : "polite"}>
        <Heading level={2}>{title}</Heading>
        <Text size={"sm"} tone={"muted"}>{message}</Text>
        <div className={flashcardActionRowClassName}>
            {isFailure ? <Button variant="primary" onPress={props.on.retry}>{data.retryLabel}</Button> : null}
            {props.pageState === "overview" ? null : <Button variant={isFailure ? "outline" : "primary"} onPress={() => props.on.selectView("overview")}>{data.overviewLabel}</Button>}
            {!showCourseAction || props.pageState !== "overview" || props.on.openCourse === undefined || data.emptyActionLabel === undefined ? null : <Button variant={isFailure ? "outline" : "primary"} onPress={props.on.openCourse}>{data.emptyActionLabel}</Button>}
        </div>
    </section></SurfaceCard>

    if ((failed || unavailable) && props.pageState === "overview") {
        return <main className={flashcardHubClassName} aria-label={data.title}>
            <header className={flashcardHubHeaderClassName}><Heading level={1}>{data.title}</Heading><Text size={"sm"} tone={"muted"}>{data.subtitle}</Text></header>
            {renderState(failed ? data.failedText : data.emptyText, failed)}
        </main>
    }

    return <>
        <main className={flashcardHubClassName} aria-label={data.title}>
            <header className={flashcardHubHeaderClassName}><Heading level={1}>{data.title}</Heading><Text size={"sm"} tone={"muted"}>{data.subtitle}</Text></header>

            <section className={flashcardModeSectionClassName} aria-label={gatewayTitle}>
                <div><Heading level={2}>{gatewayTitle}</Heading><Text size={"sm"} tone={"muted"}>{gatewayDescription}</Text></div>
                <div className={flashcardModeGridClassName}>
                    <SurfaceCard composition="joined" state={loading ? "pending" : "neutral"}><article className={flashcardModeCardClassName}>
                        <div className={flashcardModeCopyClassName}><Heading level={3}>{data.reviewLabel}</Heading><Text size={"sm"} tone={"muted"}>{data.reviewDescription ?? data.dueDescription}</Text><div className={flashcardFactRowClassName}><Text size={"sm"} weight={"medium"} isSkeleton={loading}>{`${data.dueCount} ${data.cardsLabel} ${data.dueLabel}`}</Text></div></div>
                        {data.resumeSessionId === undefined ? <Button variant={"primary"} isDisabled={loading || data.dueCount === 0} isPending={data.startPending} isSkeleton={loading} onPress={({ press: props.on.startDue })?.press}>{data.reviewActionLabel ?? `Open ${data.reviewLabel}`}</Button> : <Button variant={"primary"} isDisabled={loading} isSkeleton={loading} onPress={({ press: () => props.on.resume(data.resumeSessionId!) })?.press}>{data.resumeActionLabel ?? data.resumeLabel}</Button>}
                    </article></SurfaceCard>
                    <SurfaceCard composition="joined" state={loading ? "pending" : "neutral"}><article className={flashcardModeCardClassName}>
                        <div className={flashcardModeCopyClassName}><Heading level={3}>{data.quizTitleLabel ?? `Quick ${data.quizLabel}`}</Heading><Text size={"sm"} tone={"muted"}>{data.quizDescription ?? data.subtitle}</Text><div className={flashcardFactRowClassName}><Text size={"sm"} weight={"medium"} isSkeleton={loading}>{`${data.quizCardCount} ${data.cardsLabel}`}</Text></div></div>
                        <Button variant={"primary"} isDisabled={loading} isSkeleton={loading} onPress={({ press: () => props.on.openQuiz() })?.press}>{data.quizActionLabel ?? data.quizLabel}</Button>
                    </article></SurfaceCard>
                </div>
            </section>

            <div className={flashcardViewNavClassName}><ChoiceTabs props={{ label: data.viewTabsLabel, selectedKey: data.activeView, variant: "secondary", tabs: [{ id: "overview", label: data.overviewLabel }, { id: "history", label: data.historyLabel }, { id: "stats", label: data.statsLabel }] }} on={{ select: (key) => { if (key === "overview" || key === "history" || key === "stats") props.on.selectView(key) } }} /></div>

            {props.pageState === "overview" ? <div className={flashcardOverviewClassName}>
                <SurfaceCard label={data.dueTitle} composition="joined" state={loading ? "pending" : "neutral"}><section className={flashcardDueCardClassName}><Text size={"sm"} tone={"muted"}>{data.dueDescription}</Text><Text size={"sm"} weight={"medium"} isSkeleton={loading}>{`${data.dueCount} ${data.dueLabel}`}</Text>{data.resumeSessionId !== undefined ? <Text size={"sm"} weight={"semibold"}>{data.activeSessionText ?? data.resumeDescription}</Text> : data.dueCount === 0 ? null : <Button variant="primary" isPending={data.startPending} onPress={props.on.startDue}>{data.startLabel}</Button>}</section></SurfaceCard>
                <section className={flashcardDeckSectionClassName} aria-label={data.decksTitle}>
                    <div className={flashcardDeckToolbarClassName}><div><Heading level={2}>{data.decksTitle}</Heading><Text size={"sm"} tone={"muted"} isSkeleton={loading}>{data.foundText}</Text></div><div className={flashcardActionRowClassName} aria-label={data.layoutLabel}><Button variant={data.layout === "grid" ? "primary" : "outline"} size="sm" onPress={() => props.on.changeLayout("grid")}>{data.gridLabel}</Button><Button variant={data.layout === "line" ? "primary" : "outline"} size="sm" onPress={() => props.on.changeLayout("line")}>{data.lineLabel}</Button></div></div>
                    <SearchBox props={{ placeholder: data.searchLabel, label: data.searchLabel, clearLabel: data.searchClearLabel }} on={{ search: props.on.changeSearch }} />
                    {loading ? <div className={getFlashcardDeckGridClassName(data.layout)}>{[1, 2, 3].map((position) => <SurfaceCard key={position} composition="joined" state="pending"><article className={flashcardDeckCardClassName}><Heading level={3} isSkeleton>{data.decksTitle}</Heading><Text size={"sm"} isSkeleton>{data.subtitle}</Text></article></SurfaceCard>)}</div> : data.decks.length === 0 ? renderState(data.noResultsText, false, data.noResultsTitle, false) : <div className={getFlashcardDeckGridClassName(data.layout)}>{data.decks.map((deck) => <SurfaceCard key={deck.id} composition="joined"><article className={flashcardDeckCardClassName}>
                        <Heading level={3}>{deck.title}</Heading><div className={flashcardDeckDescriptionClassName}><Text size={"sm"} tone={"muted"}>{deck.description}</Text></div><Text size={"xs"} tone={"muted"}>{[deck.difficulty, `${deck.cardCount} ${data.cardsLabel}`, `${deck.dueCount} ${data.dueLabel}`, `${deck.masteredCount} ${data.masteredLabel}`].join(" · ")}</Text>
                        <div className={flashcardActionRowClassName}><Button variant="outline" size="sm" isDisabled={data.resumeSessionId !== undefined} onPress={() => props.on.openReview(deck.id)}>{data.startLabel}</Button>{deck.quizEligible ? <Button variant="outline" size="sm" onPress={() => props.on.openQuiz(deck.id)}>{data.quizDeckLabel}</Button> : null}</div>
                    </article></SurfaceCard>)}</div>}
                </section>
            </div> : failed || unavailable ? renderState(failed ? data.failedText : data.evidenceEmptyText, failed, data.evidenceTitle) : <SurfaceListCard label={data.evidenceTitle} isLoading={loading}><ul className={flashcardEvidenceListClassName}>{data.evidenceRows.map((row) => <li className={flashcardEvidenceRowClassName} key={row.id}><Text size={"sm"} weight={"medium"}>{row.title}</Text><Text size={"sm"} tone={"muted"}>{row.description}</Text><Text size={"xs"} tone={"muted"}>{row.fact}</Text>{row.percent === undefined ? null : <Progress label={row.title} value={row.percent} />}</li>)}</ul></SurfaceListCard>}
        </main>

        <ModalBranch isOpen={data.modalOpen} size="md" onDismiss={props.on.dismissModal}><section className={flashcardModalClassName}>
            <Heading level={2}>{data.modalTitle}</Heading><Text size={"sm"} tone={"muted"}>{data.modalDescription}</Text>
            <div className={flashcardActionRowClassName}><Button variant={data.selectedScope === "all" ? "primary" : "outline"} onPress={() => props.on.selectScope("all")}>{data.reviewAllLabel}</Button><Button variant={data.selectedScope === "due" ? "primary" : "outline"} onPress={() => props.on.selectScope("due")}>{data.reviewDueLabel}</Button></div>
            {data.startErrorText === undefined ? null : <Text size={"sm"} weight={"semibold"}>{data.startErrorText}</Text>}
            <div className={flashcardActionRowClassName}><Button variant="outline" onPress={props.on.dismissModal}>{data.cancelLabel}</Button><Button variant="primary" isPending={data.startPending} onPress={props.on.confirmReview}>{data.startLabel}</Button></div>
        </section></ModalBranch>
    </>
}
