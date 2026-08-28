"use client"

import { useEffect, useState } from "react"
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
import { CourseFlashcardsReviewBlockBase, type FlashcardReviewLayout, type FlashcardReviewView } from "./component"

/** Route identity required by the connected flashcard review overview. */
export type CourseFlashcardsReviewBlockProps = { readonly displayId: string }

/** The deck collection keeps the reader's preferred scan mode between visits. */
const VIEW_STORAGE_KEY = "starci.flashcards.review.view"

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
    modeTabsLabel: "Chế độ flashcard", // vn-ok: localized Vietnamese interface copy.
    viewTabsLabel: "Khu vực ôn tập", // vn-ok: localized Vietnamese interface copy.
    overview: "Tổng quan", // vn-ok: localized Vietnamese interface copy.
    history: "Lịch sử", // vn-ok: localized Vietnamese interface copy.
    statistics: "Thống kê", // vn-ok: localized Vietnamese interface copy.
    dueTitle: "Hôm nay cần ôn", // vn-ok: localized Vietnamese interface copy.
    dueDescription: "Chọn một bộ thẻ để bắt đầu hoặc tiếp tục phiên đang dở.", // vn-ok: localized Vietnamese interface copy.
    stats: "Tiến độ ôn tập", // vn-ok: localized Vietnamese interface copy.
    streak: "kỷ lục ngày liên tiếp", // vn-ok: localized Vietnamese interface copy.
    retention: "tỷ lệ nhớ đúng", // vn-ok: localized Vietnamese interface copy.
    decks: "Bộ thẻ", // vn-ok: localized Vietnamese interface copy.
    search: "Tìm trong bộ thẻ", // vn-ok: localized Vietnamese interface copy.
    searchClear: "Xóa tìm kiếm bộ thẻ", // vn-ok: localized Vietnamese interface copy.
    found: "bộ được tìm thấy", // vn-ok: localized Vietnamese interface copy.
    layout: "Cách hiển thị bộ thẻ", // vn-ok: localized Vietnamese interface copy.
    grid: "Lưới", // vn-ok: localized Vietnamese interface copy.
    line: "Danh sách", // vn-ok: localized Vietnamese interface copy.
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
    quizDeck: "Trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
    resume: "Tiếp tục phiên", // vn-ok: localized Vietnamese interface copy.
    retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
    empty: "Khóa học này chưa có bộ flashcard.", // vn-ok: localized Vietnamese interface copy.
    historyEmpty: "Bạn chưa có phiên ôn nào trong khóa học này.", // vn-ok: localized Vietnamese interface copy.
    statsEmpty: "Sức khỏe ghi nhớ sẽ xuất hiện sau phiên ôn đầu tiên.", // vn-ok: localized Vietnamese interface copy.
    noResults: "Không có bộ thẻ nào khớp với tìm kiếm này.", // vn-ok: localized Vietnamese interface copy.
    failed: "Không thể tải flashcard.", // vn-ok: localized Vietnamese interface copy.
    historyFailed: "Không thể tải lịch sử ôn tập.", // vn-ok: localized Vietnamese interface copy.
    statsFailed: "Không thể tải sức khỏe ghi nhớ.", // vn-ok: localized Vietnamese interface copy.
    startFailed: "Không thể bắt đầu phiên ôn. Hãy thử lại.", // vn-ok: localized Vietnamese interface copy.
    modalTitle: "Chọn chế độ ôn", // vn-ok: localized Vietnamese interface copy.
    reviewAll: "Ôn tất cả", // vn-ok: localized Vietnamese interface copy.
    reviewDue: "Chỉ thẻ đến hạn", // vn-ok: localized Vietnamese interface copy.
    cancel: "Hủy", // vn-ok: localized Vietnamese interface copy.
    difficulties: { easy: "Dễ", medium: "Trung bình", hard: "Khó" }, // vn-ok: localized Vietnamese interface copy.
} : {
    title: "Flashcards",
    subtitle: "Review with spaced repetition to remember longer.",
    review: "Review",
    quiz: "Quiz",
    modeTabsLabel: "Flashcard mode",
    viewTabsLabel: "Review area",
    overview: "Overview",
    history: "History",
    statistics: "Statistics",
    dueTitle: "Due today",
    dueDescription: "Choose a deck to start or continue an unfinished session.",
    stats: "Review progress",
    streak: "longest streak",
    retention: "retention",
    decks: "Decks",
    search: "Search decks",
    searchClear: "Clear deck search",
    found: "decks found",
    layout: "Deck layout",
    grid: "Grid",
    line: "List",
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
    quizDeck: "Quiz",
    resume: "Resume session",
    retry: "Retry",
    empty: "This course has no flashcard decks yet.",
    historyEmpty: "You have no review sessions in this course yet.",
    statsEmpty: "Memory health will appear after your first review session.",
    noResults: "No decks match this search.",
    failed: "Flashcards could not be loaded.",
    historyFailed: "Review history could not be loaded.",
    statsFailed: "Memory health could not be loaded.",
    startFailed: "The review session could not be started. Try again.",
    modalTitle: "Choose review mode",
    reviewAll: "Review all",
    reviewDue: "Due cards only",
    cancel: "Cancel",
    difficulties: { easy: "Easy", medium: "Medium", hard: "Hard" },
}

/** Resolves deck, due queue, regional evidence, and resumable sessions for the review workspace. */
export const CourseFlashcardsReviewBlock = (props: CourseFlashcardsReviewBlockProps) => {
    const { displayId } = props
    const locale = useLocale()
    const copy = labels(locale)
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const decks = useQueryFlashcardDecksByCourseSwr(courseId)
    const due = useQueryMyDueFlashcardsSwr(courseId)
    const stats = useQueryMyFlashcardStatsSwr(courseId !== undefined)
    const [activeView, setActiveView] = useState<FlashcardReviewView>("overview")
    const [search, setSearch] = useState("")
    const [layout, setLayout] = useState<FlashcardReviewLayout>("grid")
    useEffect(() => {
        const saved = window.localStorage.getItem(VIEW_STORAGE_KEY)
        if (saved === "grid" || saved === "line") setLayout(saved)
    }, [])
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
    const [reviewIntent, setReviewIntent] = useState<{ readonly deckId: string } | null>(null)
    const [reviewScope, setReviewScope] = useState<"all" | "due">("all")

    const overviewState = reviewStateOf(
        course.error !== undefined || decks.error !== undefined || due.error !== undefined || stats.error !== undefined,
        course.data === undefined || decks.data === undefined || due.data === undefined || stats.data === undefined,
        course.data === null || decks.data === null || resolvedDecks.length === 0,
    )
    const historyState = reviewStateOf(
        course.error !== undefined || history.error !== undefined,
        course.data === undefined || history.data === undefined,
        course.data === null || history.data === null || (history.data?.items.length ?? 0) === 0,
    )
    const statsRowsCount = (reviewStats.data?.weakTags.length ?? 0) + (reviewStats.data?.deckRetention.length ?? 0) + (reviewStats.data?.leechFocus.length ?? 0)
    const statisticsState = reviewStateOf(
        course.error !== undefined || reviewStats.error !== undefined,
        course.data === undefined || reviewStats.data === undefined,
        course.data === null || reviewStats.data === null || statsRowsCount === 0,
    )
    const blockState = activeView === "overview" ? overviewState : activeView === "history" ? historyState : statisticsState
    const normalizedSearch = search.trim().toLocaleLowerCase(locale)
    const visibleDecks = normalizedSearch.length === 0 ? resolvedDecks : resolvedDecks.filter((deck) => (
        `${deck.title} ${deck.description}`.toLocaleLowerCase(locale).includes(normalizedSearch)
    ))
    const totalCards = resolvedDecks.reduce((total, deck) => total + deck.cards.length, 0)
    const totalMastered = resolvedDecks.reduce((total, deck) => total + (deck.masteredCount ?? 0), 0)
    const evidenceRows = activeView === "history"
        ? (history.data?.items ?? []).map((item) => ({
            id: item.id,
            title: item.deckTitle,
            description: `${item.reviewedCount}/${item.cardCount} ${copy.reviewed}`,
            fact: `${new Date(item.updatedAt).toLocaleDateString(locale)} · +${item.xpEarned} ${copy.xp}`,
        }))
        : [
            ...(reviewStats.data?.weakTags ?? []).map((item) => ({ id: `tag-${item.tag}`, title: item.tag, description: `${item.cardCount} ${copy.cards}`, fact: `${item.retention}%` })),
            ...(reviewStats.data?.deckRetention ?? []).map((item) => ({ id: `deck-${item.deckId}`, title: item.deckTitle, description: `${item.reviewCount} ${copy.reviews}`, fact: `${item.retention}%` })),
            ...(reviewStats.data?.leechFocus ?? []).map((item) => ({ id: `leech-${item.cardId}`, title: item.question, description: item.deckTitle, fact: `${item.lapseCount}×` })),
        ]
    const difficultyOf = (value: string) => copy.difficulties[value.toLocaleLowerCase() as keyof typeof copy.difficulties] ?? value
    const openSession = (sessionId: string) => router.push(`/courses/${displayId}/learn/flashcards/review/sessions/${sessionId}`)
    const startDeck = async (deckId: string, scope: "all" | "due") => {
        const deck = decks.data?.find((item) => item.id === deckId)
        if (deck === undefined) return
        const dueIds = new Set((due.data?.cards ?? []).map((card) => card.cardId))
        const cardIds = scope === "due" ? deck.cards.map((card) => card.id).filter((id) => dueIds.has(id)) : deck.cards.map((card) => card.id)
        if (cardIds.length === 0) return
        start.reset()
        try {
            const session = await start.trigger({ mode: "review", kind: "deck", deckId, cardIds, reviewMode: scope === "due" ? "due" : "full" })
            if (session !== null) openSession(session.sessionId)
        } catch { /* SWR exposes the regional mutation error beside the retained intent. */ }
    }
    const startDue = async () => {
        const dueData = due.data
        if (courseId === undefined || dueData == null || dueData.cards.length === 0) return
        start.reset()
        try {
            const session = await start.trigger({ mode: "review", kind: "due", courseId, cardIds: dueData.cards.map((card) => card.cardId) })
            if (session !== null) openSession(session.sessionId)
        } catch { /* The due card remains visible and owns retry after a failed start. */ }
    }
    const retryActiveView = () => {
        if (activeView === "history") { void Promise.all([course.mutate(), history.mutate()]); return }
        if (activeView === "stats") { void Promise.all([course.mutate(), reviewStats.mutate()]); return }
        void Promise.all([course.mutate(), decks.mutate(), due.mutate(), stats.mutate()])
    }

    return <CourseFlashcardsReviewBlockBase
        pageState={activeView}
        blockState={blockState}
        props={{
            title: copy.title, subtitle: copy.subtitle, reviewLabel: copy.review, quizLabel: copy.quiz,
            modeTabsLabel: copy.modeTabsLabel, viewTabsLabel: copy.viewTabsLabel,
            overviewLabel: copy.overview, historyLabel: copy.history, statsLabel: copy.statistics, activeView,
            dueTitle: copy.dueTitle, dueDescription: copy.dueDescription, decksTitle: copy.decks,
            evidenceTitle: activeView === "history" ? copy.historyTitle : copy.statsTitle,
            cardsLabel: copy.cards, dueLabel: copy.due, masteredLabel: copy.mastered, startLabel: copy.start,
            resumeLabel: copy.resume, retryLabel: copy.retry, emptyText: copy.empty,
            evidenceEmptyText: activeView === "history" ? copy.historyEmpty : copy.statsEmpty,
            noResultsText: copy.noResults,
            failedText: activeView === "history" ? copy.historyFailed : activeView === "stats" ? copy.statsFailed : copy.failed,
            dueCount: due.data?.dueCount ?? 0,
            statRows: [
                { label: copy.totalCards, value: totalCards.toString() },
                { label: copy.totalMastered, value: totalMastered.toString() },
                { label: copy.retention, value: `${stats.data?.retentionRate ?? 0}%` },
                { label: copy.streak, value: (stats.data?.longestStreak ?? 0).toString() },
            ],
            decks: visibleDecks.map((deck) => ({ id: deck.id, title: deck.title, description: deck.description, difficulty: difficultyOf(deck.difficulty), cardCount: deck.cards.length, dueCount: deck.dueCount ?? 0, masteredCount: deck.masteredCount ?? 0, quizEligible: deck.cards.length >= 5 })),
            quizDeckLabel: copy.quizDeck,
            evidenceRows, searchLabel: copy.search, searchClearLabel: copy.searchClear, searchValue: search, foundText: `${visibleDecks.length} ${copy.found}`,
            layoutLabel: copy.layout, gridLabel: copy.grid, lineLabel: copy.line, layout,
            resumeSessionId: dueInProgress.data?.sessionId ?? deckInProgress.data?.sessionId,
            modalOpen: reviewIntent !== null, modalTitle: copy.modalTitle,
            modalDescription: resolvedDecks.find((deck) => deck.id === reviewIntent?.deckId)?.title ?? copy.decks,
            reviewAllLabel: copy.reviewAll, reviewDueLabel: copy.reviewDue, cancelLabel: copy.cancel,
            selectedScope: reviewScope, selectedDeckId: reviewIntent?.deckId,
            startPending: start.isMutating, startErrorText: start.error === undefined ? undefined : copy.startFailed,
        }}
        on={{
            openQuiz: (deckId) => router.push(`/courses/${displayId}/learn/flashcards/quiz${deckId === undefined ? "" : `?deckId=${encodeURIComponent(deckId)}`}`), selectView: setActiveView, changeSearch: setSearch,
            changeLayout: (next) => {
                setLayout(next)
                try {
                    window.localStorage.setItem(VIEW_STORAGE_KEY, next)
                } catch {
                    // The visible choice still applies for this visit when storage is unavailable.
                }
            },
            openReview: (deckId) => { start.reset(); setReviewIntent({ deckId }); setReviewScope("all") },
            startDue: () => { void startDue() },
            selectScope: (scope) => { start.reset(); setReviewScope(scope) },
            confirmReview: () => { if (reviewIntent !== null) void startDeck(reviewIntent.deckId, reviewScope) },
            dismissModal: () => { if (!start.isMutating) { start.reset(); setReviewIntent(null) } },
            resume: openSession, retry: retryActiveView,
        }}
    />
}

/** Canon metadata for the connected page half. */
