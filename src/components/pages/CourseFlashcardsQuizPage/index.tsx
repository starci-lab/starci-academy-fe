"use client"

import { useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryFlashcardDecksByCourseSwr, useQueryMyDueFlashcardsSwr } from "@/hooks/swr/useQueryFlashcardDecksByCourseSwr"
import { useQueryMyInProgressFlashcardSessionSwr } from "@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr"
import { useMutateStartFlashcardSessionSwr } from "@/hooks/swr/useMutateStartFlashcardSessionSwr"
import { CourseFlashcardsQuizPageBase } from "./component"

/** Route identity required by the connected flashcard quiz setup. */
export type CourseFlashcardsQuizPageProps = { readonly displayId: string }

const quizStateOf = (failed: boolean, pending: boolean, empty: boolean) => {
    if (failed) return "failed" as const
    if (pending) return "pending" as const
    return empty ? "empty" as const : "ready" as const
}

const labels = (locale: string) => locale === "vi" ? {
    title: "Flashcard",
    subtitle: "Kiểm tra nhanh kiến thức trên toàn khóa học.", // vn-ok: localized Vietnamese interface copy.
    review: "Ôn tập", // vn-ok: localized Vietnamese interface copy.
    quiz: "Trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
    configuration: "Thiết lập phiên", // vn-ok: localized Vietnamese interface copy.
    sessionName: "Tên phiên", // vn-ok: localized Vietnamese interface copy.
    sessionNamePlaceholder: "Ví dụ: Ôn hệ thống phân tán", // vn-ok: localized Vietnamese interface copy.
    scope: "Phạm vi", // vn-ok: localized Vietnamese interface copy.
    allScope: "Tất cả thẻ", // vn-ok: localized Vietnamese interface copy.
    dueScope: "Chỉ thẻ đến hạn", // vn-ok: localized Vietnamese interface copy.
    mode: "Chế độ", // vn-ok: localized Vietnamese interface copy.
    quick: "Nhanh", // vn-ok: localized Vietnamese interface copy.
    deep: "Chuyên sâu", // vn-ok: localized Vietnamese interface copy.
    level: "Cấp độ", // vn-ok: localized Vietnamese interface copy.
    all: "Tất cả", // vn-ok: localized Vietnamese interface copy.
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
    staff: "Staff",
    start: "Bắt đầu trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
    resume: "Tiếp tục phiên", // vn-ok: localized Vietnamese interface copy.
    retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
    empty: "Khóa học này chưa có thẻ để tạo trắc nghiệm.", // vn-ok: localized Vietnamese interface copy.
    failed: "Không thể tải thiết lập trắc nghiệm.", // vn-ok: localized Vietnamese interface copy.
    cards: "thẻ khả dụng", // vn-ok: localized Vietnamese interface copy.
} : {
    title: "Flashcards",
    subtitle: "Run a focused knowledge check across the course.",
    review: "Review",
    quiz: "Quiz",
    configuration: "Session setup",
    sessionName: "Session name",
    sessionNamePlaceholder: "For example: Distributed systems review",
    scope: "Scope",
    allScope: "All cards",
    dueScope: "Due cards only",
    mode: "Mode",
    quick: "Quick",
    deep: "Deep",
    level: "Level",
    all: "All levels",
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
    staff: "Staff",
    start: "Start quiz",
    resume: "Resume session",
    retry: "Retry",
    empty: "This course has no cards available for a quiz.",
    failed: "Quiz setup could not be loaded.",
    cards: "cards available",
}

const shuffle = <T,>(values: ReadonlyArray<T>): Array<T> => {
    const result = [...values]
    for (let index = result.length - 1; index > 0; index -= 1) {
        const random = globalThis.crypto.getRandomValues(new Uint32Array(1))[0]
        const swapIndex = random % (index + 1)
        ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
    }
    return result
}

/** Resolves quiz configuration, card draw, and start/resume actions. */
export const CourseFlashcardsQuizPage = ({ displayId }: CourseFlashcardsQuizPageProps) => {
    const copy = labels(useLocale())
    const router = useRouter()
    const [practiceMode, setPracticeMode] = useState<"quick" | "deep">("quick")
    const [level, setLevel] = useState<string | null>(null)
    const [scope, setScope] = useState<"all" | "due">("all")
    const [sessionName, setSessionName] = useState("")
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const decks = useQueryFlashcardDecksByCourseSwr(courseId)
    const due = useQueryMyDueFlashcardsSwr(courseId)
    const inProgress = useQueryMyInProgressFlashcardSessionSwr(courseId === undefined ? undefined : { mode: "quiz", courseId })
    const start = useMutateStartFlashcardSessionSwr()
    const cardLimit = practiceMode === "quick" ? 5 : 10
    const dueIds = useMemo(() => new Set((due.data?.cards ?? []).map((card) => card.cardId)), [due.data?.cards])
    const cardIds = useMemo(() => shuffle((decks.data ?? [])
        .flatMap((deck) => deck.cards)
        .filter((card) => level === null || card.level === level)
        .filter((card) => scope === "all" || dueIds.has(card.id))
        .map((card) => card.id))
        .slice(0, cardLimit), [cardLimit, decks.data, dueIds, level, scope])
    const failed = course.error !== undefined || decks.error !== undefined || due.error !== undefined || start.error !== undefined
    const pending = course.data === undefined || decks.data === undefined || due.data === undefined
    const state = quizStateOf(failed, pending, course.data === null || decks.data === null || cardIds.length === 0)
    const openSession = (sessionId: string) => router.push(`/courses/${displayId}/learn/flashcards/quiz/sessions/${sessionId}`)
    const startQuiz = async () => {
        if (courseId === undefined || cardIds.length === 0) return
        const session = await start.trigger({ mode: "quiz", courseId, cardIds, practiceMode, level, name: sessionName.trim() || undefined })
        if (session !== null) openSession(session.sessionId)
    }

    return (
        <CourseFlashcardsQuizPageBase
            state={state}
            props={{
                title: copy.title,
                subtitle: copy.subtitle,
                reviewLabel: copy.review,
                quizLabel: copy.quiz,
                configurationTitle: copy.configuration,
                sessionNameLabel: copy.sessionName,
                sessionNamePlaceholder: copy.sessionNamePlaceholder,
                sessionName,
                scopeLabel: copy.scope,
                allScopeLabel: copy.allScope,
                dueScopeLabel: copy.dueScope,
                selectedScope: scope,
                modeLabel: copy.mode,
                quickLabel: copy.quick,
                deepLabel: copy.deep,
                levelLabel: copy.level,
                allLevelsLabel: copy.all,
                juniorLabel: copy.junior,
                middleLabel: copy.middle,
                seniorLabel: copy.senior,
                staffLabel: copy.staff,
                startLabel: copy.start,
                resumeLabel: copy.resume,
                retryLabel: copy.retry,
                emptyText: copy.empty,
                failedText: copy.failed,
                selectedMode: practiceMode,
                selectedLevel: level,
                cardCount: cardIds.length,
                cardsLabel: copy.cards,
                resumeSessionId: inProgress.data?.sessionId,
            }}
            on={{
                openReview: () => router.push(`/courses/${displayId}/learn/flashcards/review`),
                changeSessionName: setSessionName,
                selectScope: setScope,
                selectMode: setPracticeMode,
                selectLevel: setLevel,
                start: () => { void startQuiz() },
                resume: openSession,
                retry: () => { void Promise.all([course.mutate(), decks.mutate(), due.mutate()]) },
            }}
        />
    )
}

/** Canon metadata for the connected page half. */
export const meta = { world: "connected", domain: "learn" } as const
