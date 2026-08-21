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
import { useQueryMyFlashcardReviewHistorySwr } from "@/hooks/swr/useQueryMyFlashcardReviewHistorySwr"
import { useQueryMyFlashcardReviewStatsSwr } from "@/hooks/swr/useQueryMyFlashcardReviewStatsSwr"
import { useQueryMyInProgressFlashcardSessionSwr } from "@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr"
import { useMutateStartFlashcardSessionSwr } from "@/hooks/swr/useMutateStartFlashcardSessionSwr"
import { CourseFlashcardsReviewPageBase, type FlashcardReviewView } from "./component"

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
    overview: "Tổng quan", // vn-ok: localized Vietnamese interface copy.
    history: "Lịch sử", // vn-ok: localized Vietnamese interface copy.
    statistics: "Thống kê", // vn-ok: localized Vietnamese interface copy.
    dueTitle: "Hôm nay cần ôn", // vn-ok: localized Vietnamese interface copy.
    dueDescription: "Chọn một bộ thẻ để bắt đầu hoặc tiếp tục phiên đang dở.", // vn-ok: localized Vietnamese interface copy.
    stats: "Tiến độ ôn tập", // vn-ok: localized Vietnamese interface copy.
    streak: "ngày liên tiếp", // vn-ok: localized Vietnamese interface copy.
    retention: "tỷ lệ nhớ đúng", // vn-ok: localized Vietnamese interface copy.
    decks: "Bộ thẻ", // vn-ok: localized Vietnamese interface copy.
    search: "Tìm trong bộ thẻ", // vn-ok: localized Vietnamese interface copy.
    found: "bộ được tìm thấy", // vn-ok: localized Vietnamese interface copy.
    totalCards: "Tổng số thẻ", // vn-ok: localized Vietnamese interface copy.
    totalMastered: "Đã ghi nhớ", // vn-ok: localized Vietnamese interface copy.
    historyTitle: "Phiên ôn gần đây", // vn-ok: localized Vietnamese interface copy.
    statsTitle: "Sức khỏe ghi nhớ", // vn-ok: localized Vietnamese interface copy.
    reviewed: "đã ôn", // vn-ok: localized Vietnamese interface copy.
    xp: "XP", // vn-ok: localized Vietnamese interface copy.
    reviews: "lượt ôn", // vn-ok: localized Vietnamese interface copy.
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
    overview: "Overview",
    history: "History",
    statistics: "Statistics",
    dueTitle: "Due today",
    dueDescription: "Choose a deck to start or continue an unfinished session.",
    stats: "Review progress",
    streak: "day streak",
    retention: "retention",
    decks: "Decks",
    search: "Search decks",
    found: "decks found",
    totalCards: "Total cards",
    totalMastered: "Mastered",
    historyTitle: "Recent review sessions",
    statsTitle: "Memory health",
    reviewed: "reviewed",
    xp: "XP",
    reviews: "reviews",
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
    const [activeView, setActiveView] = useState<FlashcardReviewView>("overview")
    const [search, setSearch] = useState("")
    const history = useQueryMyFlashcardReviewHistorySwr(courseId, activeView === "history")
    const reviewStats = useQueryMyFlashcardReviewStatsSwr(courseId, activeView === "stats")
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
        || history.error !== undefined
        || reviewStats.error !== undefined
        || start.error !== undefined
    const pending = course.data === undefined || decks.data === undefined || due.data === undefined || stats.data === undefined
        || (activeView === "history" && history.data === undefined)
        || (activeView === "stats" && reviewStats.data === undefined)
    const state = reviewStateOf(failed, pending, course.data === null || resolvedDecks.length === 0)
    const normalizedSearch = search.trim().toLocaleLowerCase()
    const visibleDecks = normalizedSearch.length === 0 ? resolvedDecks : resolvedDecks.filter((deck) => (
        `${deck.title} ${deck.description}`.toLocaleLowerCase().includes(normalizedSearch)
    ))
    const totalCards = resolvedDecks.reduce((total, deck) => total + deck.cards.length, 0)
    const totalMastered = resolvedDecks.reduce((total, deck) => total + (deck.masteredCount ?? 0), 0)
    const evidenceRows = activeView === "history"
        ? (history.data?.items ?? []).map((item) => ({
            id: item.id,
            title: item.deckTitle,
            description: `${item.reviewedCount}/${item.cardCount} ${copy.reviewed}`,
            fact: `${new Date(item.updatedAt).toLocaleDateString()} · +${item.xpEarned} ${copy.xp}`,
        }))
        : [
            ...(reviewStats.data?.weakTags ?? []).map((item) => ({ id: `tag-${item.tag}`, title: item.tag, description: `${item.cardCount} ${copy.cards}`, fact: `${item.retention}%` })),
            ...(reviewStats.data?.deckRetention ?? []).map((item) => ({ id: `deck-${item.deckId}`, title: item.deckTitle, description: `${item.reviewCount} ${copy.reviews}`, fact: `${item.retention}%` })),
            ...(reviewStats.data?.leechFocus ?? []).map((item) => ({ id: `leech-${item.cardId}`, title: item.question, description: item.deckTitle, fact: `${item.lapseCount}×` })),
        ]

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
                overviewLabel: copy.overview,
                historyLabel: copy.history,
                statsLabel: copy.statistics,
                activeView,
                dueTitle: copy.dueTitle,
                dueDescription: copy.dueDescription,
                decksTitle: copy.decks,
                evidenceTitle: activeView === "history" ? copy.historyTitle : copy.statsTitle,
                cardsLabel: copy.cards,
                dueLabel: copy.due,
                masteredLabel: copy.mastered,
                startLabel: copy.start,
                resumeLabel: copy.resume,
                retryLabel: copy.retry,
                emptyText: copy.empty,
                failedText: copy.failed,
                dueCount: due.data?.dueCount ?? 0,
                statRows: [
                    { label: copy.totalCards, value: totalCards.toString() },
                    { label: copy.totalMastered, value: totalMastered.toString() },
                    { label: copy.retention, value: `${stats.data?.retentionRate ?? 0}%` },
                    { label: copy.streak, value: (stats.data?.currentStreak ?? 0).toString() },
                ],
                decks: visibleDecks.map((deck) => ({
                    id: deck.id,
                    title: deck.title,
                    description: deck.description,
                    difficulty: deck.difficulty,
                    cardCount: deck.cards.length,
                    dueCount: deck.dueCount ?? 0,
                    masteredCount: deck.masteredCount ?? 0,
                })),
                evidenceRows,
                searchLabel: copy.search,
                searchValue: search,
                foundText: `${visibleDecks.length} ${copy.found}`,
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
                selectView: setActiveView,
                changeSearch: setSearch,
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
                retry: () => { void Promise.all([course.mutate(), decks.mutate(), due.mutate(), stats.mutate(), history.mutate(), reviewStats.mutate()]) },
            }}
        />
    )
}

/** Canon metadata for the connected page half. */
export const meta = { world: "connected", domain: "learn" } as const
