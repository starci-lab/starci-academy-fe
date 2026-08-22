import { ModalBranch } from "@/components/branches/ModalBranch"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Input } from "@/components/leaves/Input"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent, type LeafProps } from "@/components/contracts/props"

/** One settled deck row owned by the review library's joined list. */
export type FlashcardReviewDeckRow = { readonly id: string, readonly title: string, readonly description: string, readonly difficulty: string, readonly cardCount: number, readonly dueCount: number, readonly masteredCount: number }
/** One comparable history or review-health row. */
export type FlashcardReviewEvidenceRow = { readonly id: string, readonly title: string, readonly description: string, readonly fact: string }
/** Local evidence panel selected independently from the review/quiz route mode. */
export type FlashcardReviewView = "overview" | "history" | "stats"
/** Transport state for the review workspace. */
export type CourseFlashcardsReviewBlockState = "pending" | "ready" | "empty" | "failed"
/** Page-owned evidence tab state. */
export type CourseFlashcardsReviewPageState = FlashcardReviewView
type ReviewScope = "all" | "due"

/** Pure review-library state after deck, due, progress and panel data resolve. */
export type CourseFlashcardsReviewBlockProps = {
    readonly pageState: CourseFlashcardsReviewPageState
    readonly blockState: CourseFlashcardsReviewBlockState
    readonly props: {
        readonly title: string, readonly subtitle: string, readonly reviewLabel: string, readonly quizLabel: string
        readonly overviewLabel: string, readonly historyLabel: string, readonly statsLabel: string, readonly activeView: FlashcardReviewView
        readonly dueTitle: string, readonly dueDescription: string, readonly decksTitle: string, readonly evidenceTitle: string
        readonly cardsLabel: string, readonly dueLabel: string, readonly masteredLabel: string, readonly startLabel: string, readonly resumeLabel: string
        readonly retryLabel: string, readonly emptyText: string, readonly evidenceEmptyText: string, readonly noResultsText: string, readonly failedText: string, readonly dueCount: number
        readonly statRows: ReadonlyArray<{ readonly label: string, readonly value: string }>
        readonly decks: ReadonlyArray<FlashcardReviewDeckRow>, readonly evidenceRows: ReadonlyArray<FlashcardReviewEvidenceRow>
        readonly searchLabel: string, readonly searchValue: string, readonly foundText: string, readonly resumeSessionId?: string
        readonly modalOpen: boolean, readonly modalTitle: string, readonly modalDescription: string
        readonly reviewAllLabel: string, readonly reviewDueLabel: string, readonly cancelLabel: string
        readonly selectedScope: ReviewScope, readonly selectedDeckId?: string
        readonly startPending: boolean, readonly startErrorText?: string
    }
    readonly on: {
        readonly openQuiz: () => void, readonly selectView: (view: FlashcardReviewView) => void, readonly changeSearch: (value: string) => void
        readonly openReview: (deckId: string) => void, readonly startDue: () => void, readonly selectScope: (scope: ReviewScope) => void
        readonly confirmReview: () => void, readonly dismissModal: () => void, readonly resume: (sessionId: string) => void, readonly retry: () => void
    }
}
/** Compatibility name for the review presentation contract. */
export type CourseFlashcardsReviewPageProps = CourseFlashcardsReviewBlockProps

type DeckListData = SurfaceListCardData & { readonly decks: ReadonlyArray<FlashcardReviewDeckRow>, readonly labels: Pick<CourseFlashcardsReviewBlockProps["props"], "cardsLabel" | "dueLabel" | "masteredLabel" | "startLabel"> }
const DeckListView = ({ props, on, isLoading }: LeafProps<DeckListData, { readonly open?: (id: string) => void }>) => (
    <Tree contract="flashcard-review-deck-list" render={defineContractComponent("flashcard-review-deck-list", {
        deck: props.decks.map((deck) => defineContractComponent("flashcard-review-deck-card", {
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: deck.title, level: 3 }} isLoading={isLoading} />),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: deck.description, size: "sm", tone: "muted" }} isLoading={isLoading} />),
            facts: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: [deck.difficulty, `${deck.cardCount} ${props.labels.cardsLabel}`, `${deck.dueCount} ${props.labels.dueLabel}`, `${deck.masteredCount} ${props.labels.masteredLabel}`].filter(Boolean).join(" · "), size: "xs", tone: "muted" }} isLoading={isLoading} />),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: props.labels.startLabel, size: "sm", variant: "outline" }} on={{ press: () => on?.open?.(deck.id) }} isLoading={isLoading} />),
        })),
    })} />
)
const DeckList = defineContractComponent("flashcard-review-deck-list", DeckListView)

type EvidenceListData = SurfaceListCardData & { readonly rows: ReadonlyArray<FlashcardReviewEvidenceRow> }
const EvidenceListView = ({ props, isLoading }: LeafProps<EvidenceListData>) => (
    <Tree contract="flashcard-evidence-list" render={defineContractComponent("flashcard-evidence-list", {
        row: props.rows.map((row) => defineContractComponent("flashcard-evidence-row", {
            title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => <Text props={{ content: row.title, size: "sm", weight: "medium" }} isLoading={isLoading} />),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: row.description, size: "sm", tone: "muted" }} isLoading={isLoading} />),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: row.fact, size: "xs", tone: "muted" }} isLoading={isLoading} />),
        })),
    })} />
)
const EvidenceList = defineContractComponent("flashcard-evidence-list", EvidenceListView)

/** Draw the complete review overview, history, stats, and review-scope modal without fetching. */
export const CourseFlashcardsReviewBlockBase = (input: CourseFlashcardsReviewBlockProps) => {
    const { pageState, blockState, props: data, on } = input
    const isLoading = blockState === "pending"
    const header = defineContractComponent("learn-page-title-pair", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.title, level: 1 }} />),
        description: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} />),
    })
    const modeTabs = defineContractComponent("flashcard-mode-tabs", { tab: [
        defineLeafComponent("nav-link", { kind: "tab" }, () => <NavLink props={{ label: data.reviewLabel, kind: "tab", isCurrent: true }} />),
        defineLeafComponent("nav-link", { kind: "tab" }, () => <NavLink props={{ label: data.quizLabel, kind: "tab" }} on={{ press: on.openQuiz }} />),
    ] })
    const viewTabs = defineContractComponent("flashcard-view-tabs", {
        tab: (["overview", "history", "stats"] as const).map((view) => defineLeafComponent("nav-link", { kind: "tab" }, () => <NavLink props={{ label: view === "overview" ? data.overviewLabel : view === "history" ? data.historyLabel : data.statsLabel, kind: "tab", isCurrent: data.activeView === view }} on={{ press: () => on.selectView(view) }} />)),
    })
    const toolbar = defineContractComponent("flashcard-dual-tab-toolbar", { mode: modeTabs, view: viewTabs })
    const notice = blockState === "failed" || blockState === "empty" ? defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: blockState === "failed" ? data.failedText : pageState === "overview" ? data.emptyText : data.evidenceEmptyText, actionLabel: blockState === "failed" ? data.retryLabel : undefined }} on={{ act: on.retry }} />) : undefined
    const due = blockState === "ready" && pageState === "overview" ? defineContractComponent("flashcard-review-due-card", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.dueTitle, level: 2 }} />),
        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: data.dueDescription, size: "sm", tone: "muted" }} />),
        fact: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => <Text props={{ content: `${data.dueCount} ${data.dueLabel}`, size: "sm", weight: "medium" }} />),
        notice: data.modalOpen || data.startErrorText === undefined ? undefined : defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: data.startErrorText as string, size: "sm", tone: "accent" }} />),
        action: data.resumeSessionId !== undefined ? defineLeafComponent("button", {}, () => <Button props={{ label: data.resumeLabel, variant: "primary" }} on={{ press: () => on.resume(data.resumeSessionId as string) }} />) : data.dueCount === 0 ? undefined : defineLeafComponent("button", {}, () => <Button props={{ label: data.startLabel, variant: "primary", isPending: data.startPending }} on={{ press: on.startDue }} />),
    }) : undefined
    const stats = (blockState === "ready" || blockState === "pending") && pageState === "overview" ? defineContractComponent("flashcard-stat-grid", {
        stat: data.statRows.map((stat) => defineContractComponent("flashcard-result-stat", {
            label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: stat.label, size: "xs", tone: "muted" }} isLoading={isLoading} />),
            value: defineLeafComponent("heading", {}, () => <Heading props={{ content: stat.value, level: 2 }} isLoading={isLoading} />),
        })),
    }) : undefined
    const visibleDecks = blockState === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, title: data.decksTitle, description: "", difficulty: "", cardCount: 0, dueCount: 0, masteredCount: 0 })) : data.decks
    const deckToolbar = (blockState === "pending" || blockState === "ready") && pageState === "overview" ? defineContractComponent("flashcard-deck-toolbar", {
        search: defineLeafComponent("input", {}, () => <Input props={{ id: "flashcard-deck-search", name: "deckSearch", kind: "text", placeholder: data.searchLabel, defaultValue: data.searchValue }} on={{ change: on.changeSearch }} isLoading={isLoading} />),
        fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: data.foundText, size: "sm", tone: "muted" }} isLoading={isLoading} />),
    }) : undefined
    const decks = (blockState === "pending" || (blockState === "ready" && data.decks.length > 0)) && pageState === "overview" ? defineContractProjection("flashcard-review-deck-list", () => <SurfaceListCard contract="flashcard-review-deck-list" render={DeckList} props={{ label: data.decksTitle, decks: visibleDecks, labels: data }} on={{ open: on.openReview }} isLoading={isLoading} />) : undefined
    const deckNotice = blockState === "ready" && pageState === "overview" && data.decks.length === 0 ? defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: data.noResultsText }} />) : undefined
    const visibleEvidenceRows = blockState === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, title: data.evidenceTitle, description: "", fact: "" })) : data.evidenceRows
    const evidence = (blockState === "ready" || blockState === "pending") && pageState !== "overview" ? defineContractProjection("flashcard-evidence-list", () => <SurfaceListCard contract="flashcard-evidence-list" render={EvidenceList} props={{ label: data.evidenceTitle, rows: visibleEvidenceRows }} isLoading={isLoading} />) : undefined
    const selectedDeck = data.decks.find((deck) => deck.id === data.selectedDeckId)
    const modalScopes: ReadonlyArray<ReviewScope> = selectedDeck !== undefined && selectedDeck.dueCount > 0 ? ["all", "due"] : ["all"]
    const modal = defineContractComponent("flashcard-review-mode-modal", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.modalTitle, level: 2 }} />),
        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: data.modalDescription, size: "sm", tone: "muted" }} />),
        choice: modalScopes.map((scope) => defineContractProjection("flashcard-review-choice-row", () => {
            const label = scope === "all" ? data.reviewAllLabel : data.reviewDueLabel
            return <PressableSurface contract="flashcard-review-choice-row" label={label} press={() => on.selectScope(scope)} render={defineContractComponent("flashcard-review-choice-row", {
                label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: `${data.selectedScope === scope ? "✓ " : ""}${label}`, size: "sm", weight: "semibold" }} />),
                fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: scope === "all" ? `${selectedDeck?.cardCount ?? 0} ${data.cardsLabel}` : `${selectedDeck?.dueCount ?? 0} ${data.dueLabel}`, size: "xs", tone: "muted" }} />),
            })} />
        })),
        notice: data.startErrorText === undefined ? undefined : defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: data.startErrorText, size: "sm", tone: "accent" }} />),
        action: [defineLeafComponent("button", {}, () => <Button props={{ label: data.cancelLabel, variant: "outline" }} on={{ press: on.dismissModal }} />), defineLeafComponent("button", {}, () => <Button props={{ label: data.startLabel, variant: "primary", isPending: data.startPending }} on={{ press: on.confirmReview }} />)],
    })
    return <>
        <Tree contract={"course-flashcards-review-page"} render={defineContractComponent("course-flashcards-review-page", {
            header, toolbar, due, stats, deckToolbar,
            decksTitle: (blockState === "ready" || blockState === "pending") && pageState === "overview" ? defineLeafComponent("heading", {}, () => <Heading props={{ content: data.decksTitle, level: 2 }} isLoading={isLoading} />) : undefined,
            decks, deckNotice,
            evidenceTitle: (blockState === "ready" || blockState === "pending") && pageState !== "overview" ? defineLeafComponent("heading", {}, () => <Heading props={{ content: data.evidenceTitle, level: 2 }} isLoading={isLoading} />) : undefined,
            evidence, notice,
        })} />
        <ModalBranch isOpen={data.modalOpen} size="md" contract="flashcard-review-mode-modal" render={modal} onDismiss={on.dismissModal} />
    </>
}

/** Canon ownership marker for the pure review page. */
export const meta = { world: "pure", domain: "learn" } as const
