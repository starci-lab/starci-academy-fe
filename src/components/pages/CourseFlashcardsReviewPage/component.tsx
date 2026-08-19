import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"

/** One settled deck row rendered by the review overview. */
export type FlashcardReviewDeckRow = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly difficulty: string
    readonly cardCount: number
    readonly dueCount: number
    readonly masteredCount: number
}

/** Pure review-overview contract after all live values and actions resolve. */
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
    }
    readonly on: {
        readonly openQuiz: () => void
        readonly startDue: () => void
        readonly startDeck: (deckId: string) => void
        readonly resume: (sessionId: string) => void
        readonly retry: () => void
    }
}

/** Renders the legacy review hierarchy without fetching or routing internally. */
export const CourseFlashcardsReviewPageBase = (input: CourseFlashcardsReviewPageProps) => {
    const state = input.state
    const data = input.props
    const on = input.on
    const resumeSessionId = data.resumeSessionId
    const isLoading = state === "pending"
    const header = defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: data.title, level: 1 }} isLoading={isLoading} />
        )),
        description: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: data.subtitle, size: "sm", tone: "muted" }} isLoading={isLoading} />
        )),
    })
    const modes = defineContractComponent("flashcard-mode-tabs", {
        tab: [
            defineLeafComponent("nav-link", { kind: "tab" }, () => (
                <NavLink props={{ label: data.reviewLabel, kind: "tab", isCurrent: true }} />
            )),
            defineLeafComponent("nav-link", { kind: "tab" }, () => (
                <NavLink props={{ label: data.quizLabel, kind: "tab" }} on={{ press: on.openQuiz }} />
            )),
        ],
    })
    const notice = state === "failed" || state === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    message: state === "failed" ? data.failedText : data.emptyText,
                    actionLabel: state === "failed" ? data.retryLabel : undefined,
                }}
                on={{ act: on.retry }}
            />
        ))
        : undefined
    const due = state === "ready"
        ? defineContractComponent("flashcard-review-due-card", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: data.dueTitle, level: 2 }} />
            )),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: data.dueDescription, size: "sm", tone: "muted" }} />
            )),
            fact: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                <Text props={{ content: `${data.dueCount} ${data.dueLabel}`, size: "sm", weight: "medium" }} />
            )),
            action: resumeSessionId !== undefined
                ? defineLeafComponent("button", {}, () => (
                    <Button props={{ label: data.resumeLabel, variant: "primary" }} on={{ press: () => on.resume(resumeSessionId) }} />
                ))
                : data.dueCount === 0
                    ? undefined
                    : defineLeafComponent("button", {}, () => (
                        <Button props={{ label: data.startLabel, variant: "primary" }} on={{ press: on.startDue }} />
                    )),
        })
        : undefined
    const stats = state === "ready"
        ? defineContractComponent("centred-title-pair", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: data.statsTitle, level: 2 }} />
            )),
            description: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: `${data.streakText} · ${data.retentionText}`, size: "sm", tone: "muted" }} />
            )),
        })
        : undefined
    const decks = state === "pending"
        ? Array.from({ length: 4 }, (_, index) => defineContractComponent("flashcard-review-deck-card", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: data.decksTitle, level: 3 }} isLoading />
            )),
            description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ size: "sm", tone: "muted" }} isLoading />
            )),
            facts: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ size: "xs" }} isLoading />
            )),
            action: defineLeafComponent("button", {}, () => (
                <Button props={{ label: `${data.startLabel} ${index + 1}` }} isLoading />
            )),
        }))
        : state === "ready"
            ? data.decks.map((deck) => defineContractComponent("flashcard-review-deck-card", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: deck.title, level: 3 }} />
                )),
                description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: deck.description, size: "sm", tone: "muted" }} />
                )),
                facts: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text
                        props={{
                            content: `${deck.cardCount} ${data.cardsLabel} · ${deck.dueCount} ${data.dueLabel} · ${deck.masteredCount} ${data.masteredLabel}`,
                            size: "xs",
                        }}
                    />
                )),
                action: defineLeafComponent("button", {}, () => (
                    <Button props={{ label: data.startLabel, variant: "primary" }} on={{ press: () => on.startDeck(deck.id) }} />
                )),
            }))
            : undefined

    return (
        <Tree contract="course-flashcards-review-page" render={defineContractComponent("course-flashcards-review-page", {
            header,
            modes,
            due,
            stats,
            decksTitle: state === "ready" || state === "pending"
                ? defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: data.decksTitle, level: 2 }} isLoading={isLoading} />
                ))
                : undefined,
            deck: decks,
            notice,
        })} />
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
