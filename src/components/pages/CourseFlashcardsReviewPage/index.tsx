"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import {
    useQueryFlashcardDecksByCourseSwr,
    useQueryMyDueFlashcardsSwr,
} from "@/hooks/swr/useQueryFlashcardDecksByCourseSwr"
import { useQueryMyFlashcardStatsSwr } from "@/hooks/swr/useQueryMyFlashcardStatsSwr"
import { useQueryMyInProgressFlashcardSessionSwr } from "@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr"
import { useMutateStartFlashcardSessionSwr } from "@/hooks/swr/useMutateStartFlashcardSessionSwr"
import { CourseFlashcardsReviewPageBase } from "./component"

/** Route identity required by the connected flashcard review overview. */
export type CourseFlashcardsReviewPageProps = { readonly displayId: string }

const reviewStateOf = (failed: boolean, pending: boolean, empty: boolean) => {
    if (failed) return "failed" as const
    if (pending) return "pending" as const
    return empty ? "empty" as const : "ready" as const
}

const labels = (locale: string) => locale === "vi" ? {
    title: "Flashcard",
    subtitle: "Ôn tập theo nhịp nhớ để ghi nhớ lâu hơn.", // vn-ok: localized Vietnamese interface copy.
    review: "Ôn tập", // vn-ok: localized Vietnamese interface copy.
    quiz: "Trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
    dueTitle: "Hôm nay cần ôn", // vn-ok: localized Vietnamese interface copy.
    dueDescription: "Chọn một bộ thẻ để bắt đầu hoặc tiếp tục phiên đang dở.", // vn-ok: localized Vietnamese interface copy.
    stats: "Tiến độ ôn tập", // vn-ok: localized Vietnamese interface copy.
    streak: "ngày liên tiếp", // vn-ok: localized Vietnamese interface copy.
    retention: "tỷ lệ nhớ đúng", // vn-ok: localized Vietnamese interface copy.
    decks: "Bộ thẻ", // vn-ok: localized Vietnamese interface copy.
    cards: "thẻ", // vn-ok: localized Vietnamese interface copy.
    due: "cần ôn", // vn-ok: localized Vietnamese interface copy.
    mastered: "đã nhớ", // vn-ok: localized Vietnamese interface copy.
    start: "Bắt đầu", // vn-ok: localized Vietnamese interface copy.
    resume: "Tiếp tục phiên", // vn-ok: localized Vietnamese interface copy.
    retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
    empty: "Khóa học này chưa có bộ flashcard.", // vn-ok: localized Vietnamese interface copy.
    failed: "Không thể tải flashcard.", // vn-ok: localized Vietnamese interface copy.
    modalTitle: "Chọn chế độ ôn", // vn-ok: localized Vietnamese interface copy.
    reviewAll: "Ôn tất cả", // vn-ok: localized Vietnamese interface copy.
    reviewDue: "Chỉ thẻ đến hạn", // vn-ok: localized Vietnamese interface copy.
    cancel: "Hủy", // vn-ok: localized Vietnamese interface copy.
} : {
    title: "Flashcards",
    subtitle: "Review with spaced repetition to remember longer.",
    review: "Review",
    quiz: "Quiz",
    dueTitle: "Due today",
    dueDescription: "Choose a deck to start or continue an unfinished session.",
    stats: "Review progress",
    streak: "day streak",
    retention: "retention",
    decks: "Decks",
    cards: "cards",
    due: "due",
    mastered: "mastered",
    start: "Start",
    resume: "Resume session",
    retry: "Retry",
    empty: "This course has no flashcard decks yet.",
    failed: "Flashcards could not be loaded.",
    modalTitle: "Choose review mode",
    reviewAll: "Review all",
    reviewDue: "Due cards only",
    cancel: "Cancel",
}

/** Resolves deck, due queue, stats, and resumable sessions for the review overview. */
export const CourseFlashcardsReviewPage = ({ displayId }: CourseFlashcardsReviewPageProps) => {
    const copy = labels(useLocale())
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const decks = useQueryFlashcardDecksByCourseSwr(courseId)
    const due = useQueryMyDueFlashcardsSwr(courseId)
    const stats = useQueryMyFlashcardStatsSwr(courseId !== undefined)
    const resolvedDecks = decks.data ?? []
    const deckInProgress = useQueryMyInProgressFlashcardSessionSwr(courseId === undefined || resolvedDecks.length === 0 ? undefined : {
        mode: "review",
        courseId,
        deckIds: resolvedDecks.map((deck) => deck.id),
    })
    const dueInProgress = useQueryMyInProgressFlashcardSessionSwr(courseId === undefined ? undefined : {
        mode: "review",
        courseId,
        reviewKind: "due",
    })
    const start = useMutateStartFlashcardSessionSwr()
    const [reviewIntent, setReviewIntent] = useState<{ readonly deckId?: string } | null>(null)
    const [reviewScope, setReviewScope] = useState<"all" | "due">("due")
    const failed = course.error !== undefined
        || decks.error !== undefined
        || due.error !== undefined
        || stats.error !== undefined
        || start.error !== undefined
    const pending = course.data === undefined || decks.data === undefined || due.data === undefined || stats.data === undefined
    const state = reviewStateOf(failed, pending, course.data === null || resolvedDecks.length === 0)

    const openSession = (sessionId: string) => router.push(`/courses/${displayId}/learn/flashcards/review/sessions/${sessionId}`)
    const startDeck = async (deckId: string) => {
        const deck = decks.data?.find((item) => item.id === deckId)
        if (deck === undefined) return
        const session = await start.trigger({
            mode: "review",
            kind: "deck",
            deckId,
            cardIds: deck.cards.map((card) => card.id),
        })
        if (session !== null) openSession(session.sessionId)
    }
    const startDue = async () => {
        const dueData = due.data
        if (courseId === undefined || dueData == null || dueData.cards.length === 0) return
        const session = await start.trigger({
            mode: "review",
            kind: "due",
            courseId,
            cardIds: dueData.cards.map((card) => card.cardId),
        })
        if (session !== null) openSession(session.sessionId)
    }

    return (
        <CourseFlashcardsReviewPageBase
            state={state}
            props={{
                title: copy.title,
                subtitle: copy.subtitle,
                reviewLabel: copy.review,
                quizLabel: copy.quiz,
                dueTitle: copy.dueTitle,
                dueDescription: copy.dueDescription,
                statsTitle: copy.stats,
                streakText: `${stats.data?.currentStreak ?? 0} ${copy.streak}`,
                retentionText: `${stats.data?.retentionRate ?? 0}% ${copy.retention}`,
                decksTitle: copy.decks,
                cardsLabel: copy.cards,
                dueLabel: copy.due,
                masteredLabel: copy.mastered,
                startLabel: copy.start,
                resumeLabel: copy.resume,
                retryLabel: copy.retry,
                emptyText: copy.empty,
                failedText: copy.failed,
                dueCount: due.data?.dueCount ?? 0,
                decks: resolvedDecks.map((deck) => ({
                    id: deck.id,
                    title: deck.title,
                    description: deck.description,
                    difficulty: deck.difficulty,
                    cardCount: deck.cards.length,
                    dueCount: deck.dueCount ?? 0,
                    masteredCount: deck.masteredCount ?? 0,
                })),
                resumeSessionId: dueInProgress.data?.sessionId ?? deckInProgress.data?.sessionId,
                modalOpen: reviewIntent !== null,
                modalTitle: copy.modalTitle,
                modalDescription: reviewIntent?.deckId === undefined
                    ? copy.dueDescription
                    : resolvedDecks.find((deck) => deck.id === reviewIntent.deckId)?.title ?? copy.decks,
                reviewAllLabel: copy.reviewAll,
                reviewDueLabel: copy.reviewDue,
                cancelLabel: copy.cancel,
                selectedScope: reviewScope,
                selectedDeckId: reviewIntent?.deckId,
            }}
            on={{
                openQuiz: () => router.push(`/courses/${displayId}/learn/flashcards/quiz`),
                openReview: (deckId) => {
                    setReviewIntent(deckId === undefined ? {} : { deckId })
                    setReviewScope(deckId === undefined ? "due" : "all")
                },
                selectScope: setReviewScope,
                confirmReview: () => {
                    const deckId = reviewIntent?.deckId
                    setReviewIntent(null)
                    if (deckId !== undefined && reviewScope === "all") void startDeck(deckId)
                    else void startDue()
                },
                dismissModal: () => setReviewIntent(null),
                resume: openSession,
                retry: () => { void Promise.all([course.mutate(), decks.mutate(), due.mutate(), stats.mutate()]) },
            }}
        />
    )
}

/** Canon metadata for the connected page half. */
export const meta = { world: "connected", domain: "learn" } as const
