"use client"

import { useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useQueryFlashcardDecksByCourseSwr } from "@/hooks/swr/useQueryFlashcardDecksByCourseSwr"
import { useQueryMyInProgressFlashcardSessionSwr } from "@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr"
import { useMutateStartFlashcardSessionSwr } from "@/hooks/swr/useMutateStartFlashcardSessionSwr"
import { useQueryMyFlashcardQuizHistorySwr } from "@/hooks/swr/useQueryMyFlashcardQuizHistorySwr"
import { useQueryMyFlashcardQuizStatsSwr } from "@/hooks/swr/useQueryMyFlashcardQuizStatsSwr"
import { CourseFlashcardsQuizBlockBase, type FlashcardQuizView } from "./component"

/** Route identity required by the connected flashcard quiz setup. */
export type CourseFlashcardsQuizBlockProps = { readonly displayId: string, readonly deckId?: string }

const quizStateOf = (failed: boolean, pending: boolean, empty: boolean) => {
    if (failed) return "failed" as const
    if (pending) return "pending" as const
    return empty ? "empty" as const : "ready" as const
}

const labels = (locale: string) => locale === "vi" ? {
    title: "Flashcard",
    subtitle: "Quick quiz là bài điền từ có tính điểm; kết quả được lưu theo từng phiên.", // vn-ok: localized Vietnamese interface copy.
    review: "Về Flashcard", // vn-ok: localized Vietnamese interface copy.
    quiz: "Quick quiz", // vn-ok: localized Vietnamese interface copy.
    setup: "Bắt đầu", // vn-ok: localized Vietnamese interface copy.
    history: "Lịch sử", // vn-ok: localized Vietnamese interface copy.
    statistics: "Thống kê", // vn-ok: localized Vietnamese interface copy.
    historyTitle: "Phiên trắc nghiệm gần đây", // vn-ok: localized Vietnamese interface copy.
    statsTitle: "Tiến độ & độ chính xác", // vn-ok: localized Vietnamese interface copy.
    historyEmpty: "Chưa có phiên Quick quiz nào hoàn tất. Hãy bắt đầu một phiên để lưu kết quả đầu tiên.", // vn-ok: localized Vietnamese interface copy.
    statsEmpty: "Chưa có kết quả Quick quiz để tổng hợp tiến độ và độ chính xác.", // vn-ok: localized Vietnamese interface copy.
    questionsCorrect: "câu đúng", // vn-ok: localized Vietnamese interface copy.
    coverage: "độ phủ", // vn-ok: localized Vietnamese interface copy.
    accuracy: "độ chính xác", // vn-ok: localized Vietnamese interface copy.
    concepts: "khái niệm", // vn-ok: localized Vietnamese interface copy.
    testedScope: "Phạm vi đã kiểm tra", // vn-ok: localized Vietnamese interface copy.
    configuration: "Thiết lập phiên", // vn-ok: localized Vietnamese interface copy.
    workflowTitle: "Cách Quick quiz hoạt động", // vn-ok: localized Vietnamese interface copy.
    workflowSteps: [
        "Hệ thống chọn và khóa bộ câu điền từ phù hợp cho phiên.", // vn-ok: localized Vietnamese interface copy.
        "Điền chỗ trống rồi lưu từng câu để tiến độ luôn được giữ.", // vn-ok: localized Vietnamese interface copy.
        "Nộp một lần để chấm điểm và lưu kết quả vào lịch sử, thống kê.", // vn-ok: localized Vietnamese interface copy.
    ], // vn-ok: localized Vietnamese interface copy.
    serverDraw: "Hệ thống tự chọn và khóa bộ câu hỏi điền từ phù hợp cho phiên này.", // vn-ok: localized Vietnamese interface copy.
    mode: "Chế độ", // vn-ok: localized Vietnamese interface copy.
    quick: "Nhanh", // vn-ok: localized Vietnamese interface copy.
    deep: "Chuyên sâu", // vn-ok: localized Vietnamese interface copy.
    all: "Tất cả", // vn-ok: localized Vietnamese interface copy.
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
    staff: "Staff",
    start: "Bắt đầu trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
    resume: "Tiếp tục phiên", // vn-ok: localized Vietnamese interface copy.
    retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
    empty: "Khóa học này chưa có thẻ phù hợp để tạo Quick quiz. Hãy quay lại nội dung khóa học và thử lại khi đã có bộ thẻ.", // vn-ok: localized Vietnamese interface copy.
    failed: "Không thể tải thiết lập trắc nghiệm.", // vn-ok: localized Vietnamese interface copy.
    startFailed: "Chưa thể tạo phiên Quick quiz. Các lựa chọn của bạn vẫn được giữ.", // vn-ok: localized Vietnamese interface copy.
    eligibility: "Kiểm tra điều kiện", // vn-ok: localized Vietnamese interface copy.
    eligibilityReady: "Sẵn sàng tạo bộ câu hỏi", // vn-ok: localized Vietnamese interface copy.
    eligibilityBlocked: "Chưa đủ câu phù hợp", // vn-ok: localized Vietnamese interface copy.
    activeSession: "Hãy hoàn tất phiên hiện tại trước khi tạo phiên mới", // vn-ok: localized Vietnamese interface copy.
    exit: "Về Flashcard", // vn-ok: localized Vietnamese interface copy.
    cards: "thẻ nguồn", // vn-ok: localized Vietnamese interface copy.
    requiredCards: "cần tối thiểu", // vn-ok: localized Vietnamese interface copy.
} : {
    title: "Flashcards",
    subtitle: "Quick quiz is a scored cloze task; each session keeps its own result.",
    review: "Back to Flashcards",
    quiz: "Quick quiz",
    setup: "Start",
    history: "History",
    statistics: "Statistics",
    historyTitle: "Recent quiz sessions",
    statsTitle: "Progress and accuracy",
    historyEmpty: "No Quick quiz has been completed yet. Start a session to save the first result.",
    statsEmpty: "No Quick quiz result is available yet to summarize progress and accuracy.",
    questionsCorrect: "questions correct",
    coverage: "coverage",
    accuracy: "accuracy",
    concepts: "concepts",
    testedScope: "Tested scope",
    configuration: "Session setup",
    workflowTitle: "How Quick quiz works",
    workflowSteps: [
        "The system selects and locks an eligible cloze set for the session.",
        "Fill each blank and save every question so progress is preserved.",
        "Submit once to score the session and persist history and statistics.",
    ],
    serverDraw: "The system selects and locks an eligible cloze question set for this session.",
    mode: "Mode",
    quick: "Quick",
    deep: "Deep",
    all: "All levels",
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
    staff: "Staff",
    start: "Start quiz",
    resume: "Resume session",
    retry: "Retry",
    empty: "This course has no eligible cards for a Quick quiz. Return to the course and try again after cards are available.",
    failed: "Quiz setup could not be loaded.",
    startFailed: "The Quick quiz could not be created. Your setup is still here.",
    eligibility: "Eligibility check",
    eligibilityReady: "Ready to create a question set",
    eligibilityBlocked: "Not enough eligible questions",
    activeSession: "Complete the current session before starting a new one",
    exit: "Back to Flashcards",
    cards: "source cards",
    requiredCards: "minimum required",
}

/** Resolves quiz configuration, card draw, and start/resume actions. */
export const CourseFlashcardsQuizBlock = (props: CourseFlashcardsQuizBlockProps) => {
    const { displayId, deckId } = props
    const locale = useLocale()
    const copy = labels(locale)
    const router = useRouter()
    const auth = useSessionRefresh()
    const [practiceMode, setPracticeMode] = useState<"quick" | "deep">("quick")
    const [activeView, setActiveView] = useState<FlashcardQuizView>("setup")
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const authenticatedCourseId = auth.isRestoring ? undefined : courseId
    const decks = useQueryFlashcardDecksByCourseSwr(authenticatedCourseId)
    const inProgress = useQueryMyInProgressFlashcardSessionSwr(authenticatedCourseId === undefined ? undefined : { mode: "quiz", courseId: authenticatedCourseId })
    const start = useMutateStartFlashcardSessionSwr()
    const history = useQueryMyFlashcardQuizHistorySwr(authenticatedCourseId, activeView === "history")
    const stats = useQueryMyFlashcardQuizStatsSwr(authenticatedCourseId, activeView === "stats")
    const cardLimit = practiceMode === "quick" ? 5 : 10
    const eligibleCardIds = useMemo(() => (decks.data ?? [])
        .filter((deck) => deckId === undefined || deck.id === deckId)
        .flatMap((deck) => deck.cards)
        .map((card) => card.id), [deckId, decks.data])
    const sourceCardCount = (decks.data ?? []).reduce((total, deck) => total + deck.cards.length, 0)
    const setupState = quizStateOf(
        course.error !== undefined || decks.error !== undefined || course.data === null || decks.data === null,
        course.data === undefined || decks.data === undefined,
        sourceCardCount === 0,
    )
    const historyState = quizStateOf(
        course.error !== undefined || history.error !== undefined || course.data === null || history.data === null,
        course.data === undefined || history.data === undefined,
        (history.data?.items.length ?? 0) === 0,
    )
    const statsRowsCount = (stats.data?.byTag.length ?? 0) + (stats.data?.conceptCoverage == null ? 0 : 1)
    const statisticsState = quizStateOf(
        course.error !== undefined || stats.error !== undefined || course.data === null || stats.data === null,
        course.data === undefined || stats.data === undefined,
        statsRowsCount === 0,
    )
    const blockState = activeView === "setup" ? setupState : activeView === "history" ? historyState : statisticsState
    const openSession = (sessionId: string) => router.push(`/courses/${displayId}/learn/flashcards/quiz/sessions/${sessionId}`)
    const startQuiz = async () => {
        if (courseId === undefined || eligibleCardIds.length < cardLimit) return
        start.reset()
        try {
            const session = await start.trigger({
                mode: "quiz",
                courseId,
                deckIds: deckId === undefined ? [] : [deckId],
                requestedItemCount: cardLimit,
                startRequestId: globalThis.crypto.randomUUID(),
            })
            if (session !== null) openSession(session.sessionId)
        } catch { /* The setup remains visible and owns retry. */ }
    }
    const evidenceRows = activeView === "history"
        ? (history.data?.items ?? []).map((item) => ({
            id: item.id,
            title: item.name ?? `${new Date(item.updatedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")} · ${new Date(item.updatedAt).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })}`,
            description: `${item.correctCount}/${item.cardCount} ${copy.questionsCorrect}`,
            fact: `${Math.round((item.coverage ?? 0) * 100)}% ${copy.coverage} · +${item.xpEarned} XP`,
        }))
        : [
            ...(stats.data?.conceptCoverage == null ? [] : [{
                id: "concept-coverage",
                title: copy.testedScope,
                description: `${stats.data.conceptCoverage.covered}/${stats.data.conceptCoverage.total} ${copy.concepts}`,
                fact: `${stats.data.conceptCoverage.total === 0 ? 0 : Math.round(stats.data.conceptCoverage.covered / stats.data.conceptCoverage.total * 100)}%`,
            }]),
            ...(stats.data?.byTag ?? []).map((item) => ({ id: `tag-${item.tag}`, title: item.tag, description: copy.accuracy, fact: `${Math.round(item.coverage * 100)}%` })),
        ]

    return (
        <CourseFlashcardsQuizBlockBase
            pageState={activeView}
            blockState={blockState}
            props={{
                title: copy.title,
                subtitle: copy.subtitle,
                reviewLabel: copy.review,
                quizLabel: copy.quiz,
                setupLabel: copy.setup,
                historyLabel: copy.history,
                statsLabel: copy.statistics,
                activeView,
                evidenceTitle: activeView === "history" ? copy.historyTitle : copy.statsTitle,
                evidenceRows,
                historyEmptyText: copy.historyEmpty,
                statsEmptyText: copy.statsEmpty,
                configurationTitle: copy.configuration,
                workflowTitle: copy.workflowTitle,
                workflowSteps: copy.workflowSteps,
                serverDrawDescription: copy.serverDraw,
                modeLabel: copy.mode,
                quickLabel: copy.quick,
                deepLabel: copy.deep,
                startLabel: copy.start,
                resumeLabel: copy.resume,
                retryLabel: copy.retry,
                emptyText: copy.empty,
                failedText: copy.failed,
                eligibilityTitle: copy.eligibility,
                eligibilityReadyText: copy.eligibilityReady,
                eligibilityBlockedText: copy.eligibilityBlocked,
                activeSessionText: copy.activeSession,
                exitLabel: copy.exit,
                startErrorText: start.error === undefined ? undefined : copy.startFailed,
                startPending: start.isMutating,
                selectedMode: practiceMode,
                cardCount: eligibleCardIds.length,
                requiredCardCount: cardLimit,
                cardsLabel: copy.cards,
                requiredCardsLabel: copy.requiredCards,
                resumeSessionId: inProgress.data?.sessionId,
            }}
            on={{
                openReview: () => router.push(`/courses/${displayId}/learn/flashcards/review`),
                selectView: setActiveView,
                selectMode: setPracticeMode,
                start: () => { void startQuiz() },
                resume: openSession,
                retry: () => { void Promise.all([course.mutate(), decks.mutate(), history.mutate(), stats.mutate()]) },
            }}
        />
    )
}

/** Canon metadata for the connected page half. */
