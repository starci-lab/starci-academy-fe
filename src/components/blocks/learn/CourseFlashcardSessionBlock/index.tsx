"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateCompleteFlashcardSessionSwr } from "@/hooks/swr/useMutateCompleteFlashcardSessionSwr"
import { useMutateRateFlashcardSwr, useMutateSyncFlashcardSessionSwr } from "@/hooks/swr/useMutateSyncFlashcardSessionSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useQueryFlashcardSessionResultSwr } from "@/hooks/swr/useQueryFlashcardSessionResultSwr"
import { useQueryMyInProgressFlashcardSessionSwr } from "@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr"
import type {
    FlashcardQuizSelection,
    FlashcardReviewKind,
    FlashcardSessionMode,
} from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"
import { CourseFlashcardSessionBlockBase, type CourseFlashcardSessionBlockState } from "./component"

/** Route identity required to resume one persisted flashcard session. */
export type CourseFlashcardSessionBlockProps = {
    readonly displayId: string
    readonly sessionId: string
    readonly mode: FlashcardSessionMode
}

const flashcardStateOf = (
    failed: boolean,
    pending: boolean,
    expired: boolean,
    completing: boolean,
    syncing: boolean,
): CourseFlashcardSessionBlockState => {
    if (failed) return "failed"
    if (pending) return "pending"
    if (expired) return "expired"
    if (completing) return "completing"
    if (syncing) return "syncing"
    return "active"
}

const COPY = {
    en: {
        breadcrumbLabel: "Course path",
        focusMode: "Focused session",
        navigatorTitle: "Questions",
        navigatorDescription: "Open an answered card to review it. Saved grades cannot be changed.",
        quizNavigatorDescription: "Open a saved question to review your choices. Answers are graded only when you submit.",
        navigatorState: "Question states",
        answered: "Answered",
        selected: "Reviewing",
        current: "Current",
        future: "Not reached",
        readOnlyLabel: "Reviewing a saved answer",
        readOnlyText: "This card is read-only because its grade is already saved.",
        previous: "Previous",
        next: "Next",
        continueHint: "Choose a recall grade to continue.",
        reviewTitle: "Study cards",
        quizTitle: "Quick quiz",
        reviewBreadcrumb: "Review",
        quizBreadcrumb: "Quiz",
        studyBreadcrumb: "Study",
        takeQuizBreadcrumb: "Take quiz",
        progress: (current: number, total: number) => `Card ${current} of ${total}`,
        quizProgress: (current: number, total: number) => `Question ${current} of ${total}`,
        prompt: "Question",
        answer: "Answer",
        answerUnavailableLabel: "Answer unavailable",
        answerUnavailableText: "Answer content is unavailable for the current course access.",
        sessionSummary: "Session details",
        mode: "Mode",
        deck: "Deck",
        level: "Level",
        reveal: "Reveal answer",
        again: "Again",
        hard: "Hard",
        good: "Good",
        easy: "Easy",
        correct: "I got it",
        incorrect: "Needs review",
        clozeInstruction: "Fill every blank with a term from the word bank.",
        wordBank: "Word bank",
        blank: "Blank",
        hint: "Hint",
        checkAnswer: "Check answer",
        submitQuiz: "Submit quiz",
        saveNext: "Save & next",
        showSolution: "Show full answer",
        result: "blanks correct",
        rating: "How well did you remember it?",
        syncing: "Saving progress…",
        completing: "Completing session…",
        expired: "This session is no longer resumable.",
        failed: "The flashcard session could not be loaded or saved.",
        retry: "Try again",
        leave: "Leave session",
    },
    vi: {
        breadcrumbLabel: "Lộ trình khóa học", // vn-ok: localized Vietnamese interface copy.
        focusMode: "Phiên tập trung", // vn-ok: localized Vietnamese interface copy.
        navigatorTitle: "Danh sách câu", // vn-ok: localized Vietnamese interface copy.
        navigatorDescription: "Mở câu đã trả lời để xem lại. Điểm đã lưu không thể thay đổi.", // vn-ok: localized Vietnamese interface copy.
        quizNavigatorDescription: "Mở câu đã lưu để xem lại lựa chọn. Đáp án chỉ được chấm khi nộp bài.", // vn-ok: localized Vietnamese interface copy.
        navigatorState: "Trạng thái câu", // vn-ok: localized Vietnamese interface copy.
        answered: "Đã trả lời", // vn-ok: localized Vietnamese interface copy.
        selected: "Đang xem lại", // vn-ok: localized Vietnamese interface copy.
        current: "Hiện tại", // vn-ok: localized Vietnamese interface copy.
        future: "Chưa tới", // vn-ok: localized Vietnamese interface copy.
        readOnlyLabel: "Đang xem đáp án đã lưu", // vn-ok: localized Vietnamese interface copy.
        readOnlyText: "Câu này chỉ để xem lại vì điểm đã được lưu.", // vn-ok: localized Vietnamese interface copy.
        previous: "Câu trước", // vn-ok: localized Vietnamese interface copy.
        next: "Câu sau", // vn-ok: localized Vietnamese interface copy.
        continueHint: "Chọn mức độ ghi nhớ để tiếp tục.", // vn-ok: localized Vietnamese interface copy.
        reviewTitle: "Ôn tập thẻ", // vn-ok: localized Vietnamese interface copy.
        quizTitle: "Trắc nghiệm nhanh", // vn-ok: localized Vietnamese interface copy.
        reviewBreadcrumb: "Ôn", // vn-ok: localized Vietnamese interface copy.
        quizBreadcrumb: "Trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
        studyBreadcrumb: "Học", // vn-ok: localized Vietnamese interface copy.
        takeQuizBreadcrumb: "Làm bài", // vn-ok: localized Vietnamese interface copy.
        progress: (current: number, total: number) => `Thẻ ${current} / ${total}`, // vn-ok: localized Vietnamese interface copy.
        quizProgress: (current: number, total: number) => `Câu ${current} / ${total}`, // vn-ok: localized Vietnamese interface copy.
        prompt: "Câu hỏi", // vn-ok: localized Vietnamese interface copy.
        answer: "Đáp án", // vn-ok: localized Vietnamese interface copy.
        answerUnavailableLabel: "Chưa thể xem đáp án", // vn-ok: localized Vietnamese interface copy.
        answerUnavailableText: "Nội dung đáp án chưa khả dụng với quyền truy cập khóa học hiện tại.", // vn-ok: localized Vietnamese interface copy.
        sessionSummary: "Thông tin phiên", // vn-ok: localized Vietnamese interface copy.
        mode: "Chế độ", // vn-ok: localized Vietnamese interface copy.
        deck: "Bộ thẻ", // vn-ok: localized Vietnamese interface copy.
        level: "Cấp độ", // vn-ok: localized Vietnamese interface copy.
        reveal: "Hiện đáp án", // vn-ok: localized Vietnamese interface copy.
        again: "Học lại", // vn-ok: localized Vietnamese interface copy.
        hard: "Khó", // vn-ok: localized Vietnamese interface copy.
        good: "Tốt", // vn-ok: localized Vietnamese interface copy.
        easy: "Dễ", // vn-ok: localized Vietnamese interface copy.
        correct: "Tôi trả lời đúng", // vn-ok: localized Vietnamese interface copy.
        incorrect: "Cần ôn lại", // vn-ok: localized Vietnamese interface copy.
        clozeInstruction: "Điền mỗi chỗ trống bằng một thuật ngữ trong ngân hàng từ.", // vn-ok: localized Vietnamese interface copy.
        wordBank: "Ngân hàng từ", // vn-ok: localized Vietnamese interface copy.
        blank: "Ô trống", // vn-ok: localized Vietnamese interface copy.
        hint: "Gợi ý", // vn-ok: localized Vietnamese interface copy.
        checkAnswer: "Kiểm tra đáp án", // vn-ok: localized Vietnamese interface copy.
        submitQuiz: "Nộp bài", // vn-ok: localized Vietnamese interface copy.
        saveNext: "Lưu & câu tiếp", // vn-ok: localized Vietnamese interface copy.
        showSolution: "Xem đáp án đầy đủ", // vn-ok: localized Vietnamese interface copy.
        result: "blank chính xác", // vn-ok: localized Vietnamese interface copy.
        rating: "Mức độ ghi nhớ", // vn-ok: localized Vietnamese interface copy.
        syncing: "Đang lưu tiến độ…", // vn-ok: localized Vietnamese interface copy.
        completing: "Đang hoàn tất phiên…", // vn-ok: localized Vietnamese interface copy.
        expired: "Phiên này không còn có thể tiếp tục.", // vn-ok: localized Vietnamese interface copy.
        failed: "Không thể tải hoặc lưu phiên flashcard.", // vn-ok: localized Vietnamese interface copy.
        retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
        leave: "Rời phiên", // vn-ok: localized Vietnamese interface copy.
    },
} as const

/** Converts persisted Anki-style cloze markers without regexp recursion on large card bodies. */
export const parseFlashcardCloze = (value: string): { readonly text: string, readonly terms: ReadonlyArray<string> } => {
    const terms: Array<string> = []
    const parts: Array<string> = []
    let cursor = 0

    while (cursor < value.length) {
        const markerStart = value.indexOf("{{c", cursor)
        if (markerStart < 0) {
            parts.push(value.slice(cursor))
            break
        }

        const separator = value.indexOf("::", markerStart + 3)
        const markerEnd = separator < 0 ? -1 : value.indexOf("}}", separator + 2)
        const ordinal = separator < 0 ? "" : value.slice(markerStart + 3, separator)
        const validOrdinal = ordinal.length > 0 && [...ordinal].every((character) => character >= "0" && character <= "9")

        if (separator < 0 || markerEnd < 0 || !validOrdinal) {
            parts.push(value.slice(cursor, markerStart + 3))
            cursor = markerStart + 3
            continue
        }

        const term = value.slice(separator + 2, markerEnd).split("::")[0]?.trim() ?? ""
        parts.push(value.slice(cursor, markerStart), "____")
        if (term.length > 0) terms.push(term)
        cursor = markerEnd + 2
    }

    return { text: parts.join(""), terms }
}

/** Reveals valid cloze terms while preserving the surrounding authored Markdown. */
export const revealFlashcardMarkdown = (value: string): string => {
    const parts: Array<string> = []
    let cursor = 0

    while (cursor < value.length) {
        const markerStart = value.indexOf("{{c", cursor)
        if (markerStart < 0) {
            parts.push(value.slice(cursor))
            break
        }

        const separator = value.indexOf("::", markerStart + 3)
        const markerEnd = separator < 0 ? -1 : value.indexOf("}}", separator + 2)
        const ordinal = separator < 0 ? "" : value.slice(markerStart + 3, separator)
        const validOrdinal = ordinal.length > 0 && [...ordinal].every((character) => character >= "0" && character <= "9")

        if (separator < 0 || markerEnd < 0 || !validOrdinal) {
            parts.push(value.slice(cursor, markerStart + 3))
            cursor = markerStart + 3
            continue
        }

        const term = value.slice(separator + 2, markerEnd).split("::")[0]?.trim() ?? ""
        parts.push(value.slice(cursor, markerStart), term)
        cursor = markerEnd + 2
    }

    return parts.join("")
}

/** Keep Quiz focused on the sentence being answered instead of leaking the authored study explanation. */
export const quizPromptMarkdown = (value: string): string => {
    const withBlanks = value.replace(/\{\{blank:[^}]+\}\}/gu, "____")
    const sentences = withBlanks
        .split(/(?<=[.!?])\s+|\r?\n+/gu)
        .map((sentence) => sentence.trim())
        .filter((sentence) => /_{4}/u.test(sentence))

    return sentences.length === 0 ? withBlanks : sentences.join("\n\n")
}

/** Translate the transport enum before it becomes learner-facing session metadata. */
const localizedLevel = (level: string | null | undefined, isVietnamese: boolean) => {
    if (level == null) return level
    if (!isVietnamese) return level.charAt(0).toUpperCase() + level.slice(1)
    return ({
        junior: "Sơ cấp", // vn-ok: localized Vietnamese interface copy.
        middle: "Trung cấp", // vn-ok: localized Vietnamese interface copy.
        senior: "Cao cấp", // vn-ok: localized Vietnamese interface copy.
        staff: "Chuyên gia", // vn-ok: localized Vietnamese interface copy.
    } as const)[level as "junior" | "middle" | "senior" | "staff"] ?? level
}

/** Connects persisted start/resume state to per-card sync and completion transport. */
export const CourseFlashcardSessionBlock = (props: CourseFlashcardSessionBlockProps) => {
    const { displayId, sessionId, mode } = props
    const isVietnamese = useLocale() === "vi"
    const copy = isVietnamese ? COPY.vi : COPY.en
    const router = useRouter()
    const auth = useSessionRefresh()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const session = useQueryMyInProgressFlashcardSessionSwr(courseId === undefined || auth.isRestoring ? undefined : {
        mode,
        courseId,
        sessionId,
    })
    const persistedResult = useQueryFlashcardSessionResultSwr(auth.isRestoring ? undefined : mode, auth.isRestoring ? undefined : sessionId)
    const sync = useMutateSyncFlashcardSessionSwr()
    const rate = useMutateRateFlashcardSwr()
    const complete = useMutateCompleteFlashcardSessionSwr()
    const initializedSession = useRef<string | null>(null)
    const [index, setIndex] = useState(0)
    const [viewIndex, setViewIndex] = useState<number | null>(null)
    const [reviewedCount, setReviewedCount] = useState(0)
    const [gradedIndexes, setGradedIndexes] = useState<ReadonlyArray<number>>([])
    const [xpEarned, setXpEarned] = useState(0)
    const [answerVisible, setAnswerVisible] = useState(false)
    const [quizSelections, setQuizSelections] = useState<ReadonlyArray<FlashcardQuizSelection>>([])
    const [answerVersion, setAnswerVersion] = useState(0)
    const [localFailed, setLocalFailed] = useState(false)
    const [pendingRating, setPendingRating] = useState<0 | 1 | 2 | 3 | null>(null)

    useEffect(() => {
        if (session.data === undefined || session.data === null || initializedSession.current === session.data.sessionId) return
        initializedSession.current = session.data.sessionId
        setIndex(session.data.currentIndex)
        setViewIndex(null)
        setReviewedCount(session.data.reviewedCount)
        setGradedIndexes(session.data.gradedIndexes)
        setXpEarned(session.data.xpEarned)
        setAnswerVisible(false)
        setQuizSelections(session.data.answerState ?? [])
        setAnswerVersion(session.data.answerVersion ?? 0)
        setLocalFailed(false)
        setPendingRating(null)
    }, [session.data])

    const resultRoute = `/courses/${displayId}/learn/flashcards/${mode}/sessions/${sessionId}/result`
    useEffect(() => {
        if (persistedResult.data?.status === "completed" || persistedResult.data?.status === "abandoned") {
            router.replace(resultRoute)
        }
    }, [persistedResult.data?.status, resultRoute, router])

    const displayIndex = viewIndex ?? index
    const currentCard = mode === "review" ? session.data?.cards[displayIndex] : undefined
    const currentQuizItem = mode === "quiz" ? session.data?.quizItems?.[displayIndex] : undefined
    const readOnly = displayIndex !== index
    const answeredIndexes = useMemo(() => {
        if (mode === "review") return new Set(gradedIndexes)
        return new Set(Array.from({ length: index }, (_, position) => position))
    }, [gradedIndexes, index, mode])
    const itemCount = mode === "quiz" ? session.data?.quizItems?.length ?? 0 : session.data?.cards.length ?? 0
    const questions = useMemo(() => Array.from({ length: itemCount }, (_, position) => {
        const state = position === index ? "current" as const : answeredIndexes.has(position) ? "answered" as const : "future" as const
        return {
            position: position + 1,
            state,
            selected: position === displayIndex,
            disabled: state === "future",
        }
    }), [answeredIndexes, displayIndex, index, itemCount])
    const selectQuestion = (position: number) => {
        const nextIndex = position - 1
        if (nextIndex < 0 || nextIndex > index || questions[nextIndex]?.disabled !== false) return
        setViewIndex(nextIndex === index ? null : nextIndex)
    }
    const previous = () => {
        let target = displayIndex - 1
        while (target >= 0 && questions[target]?.disabled !== false) target -= 1
        if (target >= 0) setViewIndex(target === index ? null : target)
    }
    const next = () => {
        const target = questions.findIndex((question, position) => position > displayIndex && !question.disabled)
        if (target >= 0 && target <= index) setViewIndex(target === index ? null : target)
    }
    const leave = () => router.push(`/courses/${displayId}/learn/flashcards/${mode}`)
    const finishReview = async (kind: FlashcardReviewKind, count: number, xp: number) => {
        const result = await complete.trigger({ mode: "review", kind, sessionId, reviewedCount: count, xpEarned: xp })
        if (result === null) throw new Error("Flashcard review completion returned no result")
        router.push(resultRoute)
    }
    const submitReviewGrade = async (grade: 0 | 1 | 2 | 3) => {
        if (session.data === null || session.data === undefined || currentCard === undefined || readOnly) return
        setPendingRating(grade)
        try {
            const gradeResult = await rate.trigger({ cardId: currentCard.cardId, sessionId, grade })
            if (gradeResult === null) throw new Error("Flashcard grade returned no result")
            const nextCount = reviewedCount + 1
            const nextXp = xpEarned + gradeResult.xpEarned
            const nextGradedIndexes = gradedIndexes.includes(index) ? gradedIndexes : [...gradedIndexes, index]
            const kind = session.data.kind ?? "deck"
            if (index >= session.data.cards.length - 1) {
                await finishReview(kind, nextCount, nextXp)
                return
            }
            const nextIndex = index + 1
            const synced = await sync.trigger({
                mode: "review",
                kind,
                sessionId,
                currentIndex: nextIndex,
                reviewedCount: nextCount,
                gradedIndexes: nextGradedIndexes,
                xpEarned: nextXp,
            })
            if (!synced) throw new Error("Flashcard review progress was not accepted")
            setReviewedCount(nextCount)
            setXpEarned(nextXp)
            setGradedIndexes(nextGradedIndexes)
            setIndex(nextIndex)
            setViewIndex(null)
            setAnswerVisible(false)
        } catch {
            setLocalFailed(true)
        } finally {
            setPendingRating(null)
        }
    }
    const continueQuiz = async () => {
        if (session.data === null || session.data === undefined || currentQuizItem === undefined || readOnly) return
        const currentComplete = currentQuizItem.blanks.every((blank) => quizSelections.some((selection) => selection.blankId === blank.blankId))
        if (!currentComplete) return
        try {
            if (index >= (session.data.quizItems?.length ?? 0) - 1) {
                const result = await complete.trigger({ mode: "quiz", sessionId, expectedVersion: answerVersion, selections: quizSelections })
                if (result === null) throw new Error("Flashcard quiz completion returned no result")
                router.push(resultRoute)
                return
            }
            const nextIndex = index + 1
            const synced = await sync.trigger({ mode: "quiz", sessionId, currentIndex: nextIndex, expectedVersion: answerVersion, selections: quizSelections })
            if (synced === null || typeof synced === "boolean") throw new Error("Flashcard quiz progress was not accepted")
            setQuizSelections(synced.answerState)
            setAnswerVersion(synced.answerVersion)
            setIndex(synced.currentIndex)
            setViewIndex(null)
        } catch {
            setLocalFailed(true)
        }
    }

    const pending = course.data === undefined || session.data === undefined || persistedResult.data === undefined
    const transportFailed = course.error !== undefined
        || session.error !== undefined
        || persistedResult.error !== undefined
        || sync.error !== undefined
        || rate.error !== undefined
        || complete.error !== undefined
        || localFailed
    const expired = !pending && session.data === null && persistedResult.data?.status === "in_progress"
    const state = flashcardStateOf(
        transportFailed || course.data === null || (mode === "review" ? currentCard === undefined : currentQuizItem === undefined) && session.data !== undefined && session.data !== null,
        pending,
        expired || session.data === null,
        complete.isMutating,
        sync.isMutating || rate.isMutating,
    )

    return (
        <CourseFlashcardSessionBlockBase
            blockState={state}
            data={{
                mode,
                title: mode === "review" ? copy.reviewTitle : copy.quizTitle,
                currentCard: displayIndex + 1,
                progressCard: index + 1,
                totalCards: itemCount,
                progressText: mode === "quiz" ? copy.quizProgress(displayIndex + 1, itemCount) : copy.progress(displayIndex + 1, itemCount),
                focusModeLabel: copy.focusMode,
                progressLabel: mode === "quiz" ? copy.quizProgress(index + 1, itemCount) : copy.progress(index + 1, itemCount),
                readOnly,
                questions,
                breadcrumbLabel: copy.breadcrumbLabel,
                modeBreadcrumbLabel: mode === "review" ? copy.reviewBreadcrumb : copy.quizBreadcrumb,
                taskBreadcrumbLabel: mode === "review" ? copy.studyBreadcrumb : copy.takeQuizBreadcrumb,
                courseTitle: course.data?.title,
                deckTitle: currentCard?.deckTitle,
                level: localizedLevel(currentCard?.level, isVietnamese),
                prompt: currentCard?.front ?? currentQuizItem?.question,
                answer: currentCard?.back === undefined ? undefined : revealFlashcardMarkdown(currentCard.back),
                answerAvailable: currentCard?.answerAvailable === true,
                answerVisible: mode === "review" && (readOnly || answerVisible),
                cloze: mode !== "quiz" || currentQuizItem === undefined ? undefined : {
                    text: quizPromptMarkdown(currentQuizItem.clozeText),
                    blanks: currentQuizItem.blanks.map((blank) => ({ id: blank.blankId, hint: blank.hint })),
                    bank: currentQuizItem.tokens.map((token) => ({ id: token.tokenId, label: token.label })),
                    selected: quizSelections.flatMap((selection) => {
                        if (!currentQuizItem.blanks.some((blank) => blank.blankId === selection.blankId)) return []
                        const token = currentQuizItem.tokens.find((item) => item.tokenId === selection.tokenId)
                        return token === undefined ? [] : [{ ...selection, label: token.label }]
                    }),
                    isFinal: index >= itemCount - 1,
                },
                solutionVisible: false,
                revealLabel: copy.reveal,
                promptLabel: copy.prompt,
                answerLabel: copy.answer,
                answerUnavailableLabel: copy.answerUnavailableLabel,
                answerUnavailableText: copy.answerUnavailableText,
                sessionSummaryLabel: copy.sessionSummary,
                modeLabel: copy.mode,
                deckLabel: copy.deck,
                levelLabel: copy.level,
                navigatorTitle: copy.navigatorTitle,
                navigatorDescription: mode === "quiz" ? copy.quizNavigatorDescription : copy.navigatorDescription,
                navigatorStateLabel: copy.navigatorState,
                answeredLabel: copy.answered,
                selectedLabel: copy.selected,
                currentLabel: copy.current,
                futureLabel: copy.future,
                readOnlyLabel: copy.readOnlyLabel,
                readOnlyText: copy.readOnlyText,
                previousLabel: copy.previous,
                nextLabel: copy.next,
                continueHint: copy.continueHint,
                clozeInstructionLabel: copy.clozeInstruction,
                wordBankLabel: copy.wordBank,
                blankLabel: copy.blank,
                hintLabel: copy.hint,
                checkAnswerLabel: mode === "quiz" && index >= itemCount - 1 ? copy.submitQuiz : copy.saveNext,
                showSolutionLabel: copy.showSolution,
                resultLabel: copy.result,
                ratingLabel: copy.rating,
                againLabel: copy.again,
                hardLabel: copy.hard,
                goodLabel: copy.good,
                easyLabel: copy.easy,
                pendingRating,
                syncingLabel: copy.syncing,
                completingLabel: copy.completing,
                expiredText: copy.expired,
                failedText: copy.failed,
                retryLabel: copy.retry,
                leaveLabel: copy.leave,
            }}
            on={{
                reveal: () => setAnswerVisible(true),
                selectTerm: (tokenId) => {
                    if (currentQuizItem === undefined || readOnly) return
                    setQuizSelections((current) => {
                        const selected = current.find((selection) => selection.tokenId === tokenId)
                        if (selected !== undefined) return current.filter((selection) => selection.tokenId !== tokenId)
                        const blank = currentQuizItem.blanks.find((item) => !current.some((selection) => selection.blankId === item.blankId))
                        return blank === undefined ? current : [...current, { blankId: blank.blankId, tokenId }]
                    })
                },
                checkQuiz: () => { void continueQuiz() },
                showSolution: () => undefined,
                rate: (grade) => { void submitReviewGrade(grade) },
                selectQuestion,
                previous,
                next,
                openCourse: () => router.push(`/courses/${displayId}`),
                openMode: () => router.push(`/courses/${displayId}/learn/flashcards/${mode}`),
                retry: () => {
                    setLocalFailed(false)
                    void Promise.all([course.mutate(), session.mutate(), persistedResult.mutate()])
                },
                leave,
            }}
        />
    )
}

/** Canon metadata for the connected page half. */
