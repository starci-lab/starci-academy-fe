import { ModalBranch } from "@/components/branches/ModalBranch"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** One settled deck row owned by the review library's joined list. */
export type FlashcardReviewDeckRow = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly difficulty: string
    readonly cardCount: number
    readonly dueCount: number
    readonly masteredCount: number
}

type ReviewScope = "all" | "due"

/** Pure review-library state after deck, due, progress and modal data resolve. */
export type CourseFlashcardsReviewPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly subtitle: string
        readonly reviewLabel: string
        readonly quizLabel: string
        readonly dueTitle: string
        readonly dueDescription: string
        readonly statsTitle: string
        readonly streakText: string
        readonly retentionText: string
        readonly decksTitle: string
        readonly cardsLabel: string
        readonly dueLabel: string
        readonly masteredLabel: string
        readonly startLabel: string
        readonly resumeLabel: string
        readonly retryLabel: string
        readonly emptyText: string
        readonly failedText: string
        readonly dueCount: number
        readonly decks: ReadonlyArray<FlashcardReviewDeckRow>
        readonly resumeSessionId?: string
        readonly modalOpen: boolean
        readonly modalTitle: string
        readonly modalDescription: string
        readonly reviewAllLabel: string
        readonly reviewDueLabel: string
        readonly cancelLabel: string
        readonly selectedScope: ReviewScope
        readonly selectedDeckId?: string
    }
    readonly on: {
        readonly openQuiz: () => void
        readonly openReview: (deckId?: string) => void
        readonly selectScope: (scope: ReviewScope) => void
        readonly confirmReview: () => void
        readonly dismissModal: () => void
        readonly resume: (sessionId: string) => void
        readonly retry: () => void
    }
}

type DeckListData = SurfaceListCardData & {
    readonly decks: ReadonlyArray<FlashcardReviewDeckRow>
    readonly labels: Pick<CourseFlashcardsReviewPageProps["props"], "cardsLabel" | "dueLabel" | "masteredLabel" | "startLabel">
}

const DeckListView = ({ props, on, isLoading }: LeafProps<DeckListData, { readonly open?: (id: string) => void }>) => (
    <Tree contract="flashcard-review-deck-list" render={defineContractComponent("flashcard-review-deck-list", {
        deck: props.decks.map((deck) => defineContractComponent("flashcard-review-deck-card", {
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: deck.title, level: 3 }} isLoading={isLoading} />),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: deck.description, size: "sm", tone: "muted" }} isLoading={isLoading} />),
            facts: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: `${deck.cardCount} ${props.labels.cardsLabel} · ${deck.dueCount} ${props.labels.dueLabel} · ${deck.masteredCount} ${props.labels.masteredLabel}`, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: props.labels.startLabel, size: "sm", variant: "outline" }} on={{ press: () => on?.open?.(deck.id) }} isLoading={isLoading} />),
        })),
    })} />
)

const DeckList = defineContractComponent("flashcard-review-deck-list", DeckListView)

/** Draw the complete review overview and its review-scope modal without fetching. */
export const CourseFlashcardsReviewPageBase = (input: CourseFlashcardsReviewPageProps) => {
    const { state, props: data, on } = input
    const isLoading = state === "pending"
    const header = defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.title, level: 1 }} isLoading={isLoading} />),
        description: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} isLoading={isLoading} />),
    })
    const modes = defineContractComponent("flashcard-mode-tabs", {
        tab: [
            defineLeafComponent("nav-link", { kind: "tab" }, () => <NavLink props={{ label: data.reviewLabel, kind: "tab", isCurrent: true }} />),
            defineLeafComponent("nav-link", { kind: "tab" }, () => <NavLink props={{ label: data.quizLabel, kind: "tab" }} on={{ press: on.openQuiz }} />),
        ],
    })
    const notice = state === "failed" || state === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ message: state === "failed" ? data.failedText : data.emptyText, actionLabel: state === "failed" ? data.retryLabel : undefined }} on={{ act: on.retry }} />)
        : undefined
    const due = state === "ready" ? defineContractComponent("flashcard-review-due-card", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.dueTitle, level: 2 }} />),
        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: data.dueDescription, size: "sm", tone: "muted" }} />),
        fact: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => <Text props={{ content: `${data.dueCount} ${data.dueLabel}`, size: "sm", weight: "medium" }} />),
        action: data.resumeSessionId !== undefined
            ? defineLeafComponent("button", {}, () => <Button props={{ label: data.resumeLabel, variant: "primary" }} on={{ press: () => on.resume(data.resumeSessionId as string) }} />)
            : data.dueCount === 0 ? undefined : defineLeafComponent("button", {}, () => <Button props={{ label: data.startLabel, variant: "primary" }} on={{ press: () => on.openReview() }} />),
    }) : undefined
    const stats = state === "ready" ? defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.statsTitle, level: 2 }} />),
        description: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: `${data.streakText} · ${data.retentionText}`, size: "sm", tone: "muted" }} />),
    }) : undefined
    const loadingDecks = Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, title: data.decksTitle, description: "", difficulty: "", cardCount: 0, dueCount: 0, masteredCount: 0 }))
    const visibleDecks = state === "pending" ? loadingDecks : data.decks
    const decks = state === "pending" || state === "ready" ? defineContractProjection("flashcard-review-deck-list", () => (
        <SurfaceListCard
            contract="flashcard-review-deck-list"
            render={DeckList}
            props={{ label: data.decksTitle, decks: visibleDecks, labels: data }}
            on={{ open: on.openReview }}
            isLoading={isLoading}
        />
    )) : undefined
    const modal = defineContractComponent("flashcard-review-mode-modal", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: data.modalTitle, level: 2 }} />),
        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: data.modalDescription, size: "sm", tone: "muted" }} />),
        choice: (["all", "due"] as const).map((scope) => defineContractProjection("flashcard-review-choice-row", () => {
            const label = scope === "all" ? data.reviewAllLabel : data.reviewDueLabel
            return <PressableSurface
                contract="flashcard-review-choice-row"
                label={label}
                press={() => on.selectScope(scope)}
                render={defineContractComponent("flashcard-review-choice-row", {
                    label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: `${data.selectedScope === scope ? "✓ " : ""}${label}`, size: "sm", weight: "semibold" }} />),
                    fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: scope === "all" ? `${data.selectedDeckId === undefined ? data.decks.reduce((total, deck) => total + deck.cardCount, 0) : data.decks.find((deck) => deck.id === data.selectedDeckId)?.cardCount ?? 0} ${data.cardsLabel}` : `${data.dueCount} ${data.dueLabel}`, size: "xs", tone: "muted" }} />),
                })}
            />
        })),
        action: [
            defineLeafComponent("button", {}, () => <Button props={{ label: data.cancelLabel, variant: "outline" }} on={{ press: on.dismissModal }} />),
            defineLeafComponent("button", {}, () => <Button props={{ label: data.startLabel, variant: "primary" }} on={{ press: on.confirmReview }} />),
        ],
    })

    return <>
        <Tree contract="course-flashcards-review-page" render={defineContractComponent("course-flashcards-review-page", {
            header, modes, due, stats,
            decksTitle: state === "ready" || state === "pending" ? defineLeafComponent("heading", {}, () => <Heading props={{ content: data.decksTitle, level: 2 }} isLoading={isLoading} />) : undefined,
            decks,
            notice,
        })} />
        <ModalBranch isOpen={data.modalOpen} size="md" contract="flashcard-review-mode-modal" render={modal} onDismiss={on.dismissModal} />
    </>
}

/** Canon ownership marker for the pure review page. */
export const meta = { world: "pure", domain: "learn" } as const
