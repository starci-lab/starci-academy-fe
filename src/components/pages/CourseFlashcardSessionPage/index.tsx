"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateCompleteFlashcardSessionSwr } from "@/hooks/swr/useMutateCompleteFlashcardSessionSwr"
import { useMutateRateFlashcardSwr, useMutateSyncFlashcardSessionSwr } from "@/hooks/swr/useMutateSyncFlashcardSessionSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryFlashcardSessionResultSwr } from "@/hooks/swr/useQueryFlashcardSessionResultSwr"
import { useQueryMyInProgressFlashcardSessionSwr } from "@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr"
import type {
    FlashcardQuizAnswer,
    FlashcardReviewKind,
    FlashcardSessionMode,
} from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"
import { CourseFlashcardSessionPageBase, type CourseFlashcardSessionState } from "./component"

/** Route identity required to resume one persisted flashcard session. */
export type CourseFlashcardSessionPageProps = {
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
): CourseFlashcardSessionState => {
    if (failed) return "failed"
    if (pending) return "pending"
    if (expired) return "expired"
    if (completing) return "completing"
    if (syncing) return "syncing"
    return "active"
}

const COPY = {
    en: {
        reviewTitle: "Study cards",
        quizTitle: "Quick quiz",
        progress: (current: number, total: number) => `Card ${current} of ${total}`,
        reveal: "Reveal answer",
        again: "Again",
        hard: "Hard",
        good: "Good",
        easy: "Easy",
        correct: "I got it",
        incorrect: "Needs review",
        syncing: "Saving progress…",
        completing: "Completing session…",
        expired: "This session is no longer resumable.",
        failed: "The flashcard session could not be loaded or saved.",
        retry: "Try again",
        leave: "Leave session",
    },
    vi: {
        reviewTitle: "Ôn tập thẻ", // vn-ok: localized Vietnamese interface copy.
        quizTitle: "Trắc nghiệm nhanh", // vn-ok: localized Vietnamese interface copy.
        progress: (current: number, total: number) => `Thẻ ${current} / ${total}`, // vn-ok: localized Vietnamese interface copy.
        reveal: "Hiện đáp án", // vn-ok: localized Vietnamese interface copy.
        again: "Học lại", // vn-ok: localized Vietnamese interface copy.
        hard: "Khó", // vn-ok: localized Vietnamese interface copy.
        good: "Tốt", // vn-ok: localized Vietnamese interface copy.
        easy: "Dễ", // vn-ok: localized Vietnamese interface copy.
        correct: "Tôi trả lời đúng", // vn-ok: localized Vietnamese interface copy.
        incorrect: "Cần ôn lại", // vn-ok: localized Vietnamese interface copy.
        syncing: "Đang lưu tiến độ…", // vn-ok: localized Vietnamese interface copy.
        completing: "Đang hoàn tất phiên…", // vn-ok: localized Vietnamese interface copy.
        expired: "Phiên này không còn có thể tiếp tục.", // vn-ok: localized Vietnamese interface copy.
        failed: "Không thể tải hoặc lưu phiên flashcard.", // vn-ok: localized Vietnamese interface copy.
        retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
        leave: "Rời phiên", // vn-ok: localized Vietnamese interface copy.
    },
} as const

const clozePattern = /\{\{c\d+::([^}]+)}}/g

const buildQuizPrompt = (front: string): { readonly prompt: string; readonly blankCount: number } => {
    const matches = Array.from(front.matchAll(clozePattern))
    return {
        prompt: matches.length === 0 ? front : front.replace(clozePattern, "____"),
        blankCount: Math.max(matches.length, 1),
    }
}

/** Connects persisted start/resume state to per-card sync and completion transport. */
export const CourseFlashcardSessionPage = ({ displayId, sessionId, mode }: CourseFlashcardSessionPageProps) => {
    const copy = useLocale() === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.id
    const session = useQueryMyInProgressFlashcardSessionSwr(courseId === undefined ? undefined : {
        mode,
        courseId,
        sessionId,
    })
    const persistedResult = useQueryFlashcardSessionResultSwr(mode, sessionId)
    const sync = useMutateSyncFlashcardSessionSwr()
    const rate = useMutateRateFlashcardSwr()
    const complete = useMutateCompleteFlashcardSessionSwr()
    const initializedSession = useRef<string | null>(null)
    const [index, setIndex] = useState(0)
    const [reviewedCount, setReviewedCount] = useState(0)
    const [gradedIndexes, setGradedIndexes] = useState<ReadonlyArray<number>>([])
    const [answers, setAnswers] = useState<ReadonlyArray<FlashcardQuizAnswer>>([])
    const [xpEarned, setXpEarned] = useState(0)
    const [answerVisible, setAnswerVisible] = useState(false)
    const [localFailed, setLocalFailed] = useState(false)

    useEffect(() => {
        if (session.data === undefined || session.data === null || initializedSession.current === session.data.sessionId) return
        initializedSession.current = session.data.sessionId
        setIndex(session.data.currentIndex)
        setReviewedCount(session.data.reviewedCount)
        setGradedIndexes(session.data.gradedIndexes)
        setAnswers(session.data.results)
        setXpEarned(session.data.xpEarned)
        setAnswerVisible(false)
        setLocalFailed(false)
    }, [session.data])

    const resultRoute = `/courses/${displayId}/learn/flashcards/${mode}/sessions/${sessionId}/result`
    useEffect(() => {
        if (persistedResult.data?.status === "completed" || persistedResult.data?.status === "abandoned") {
            router.replace(resultRoute)
        }
    }, [persistedResult.data?.status, resultRoute, router])

    const currentCard = session.data?.cards[index]
    const quizPrompt = useMemo(() => buildQuizPrompt(currentCard?.front ?? ""), [currentCard?.front])
    const leave = () => router.push(`/courses/${displayId}/learn/flashcards/${mode}`)
    const finishReview = async (kind: FlashcardReviewKind, count: number, xp: number) => {
        const result = await complete.trigger({ mode: "review", kind, sessionId, reviewedCount: count, xpEarned: xp })
        if (result === null) throw new Error("Flashcard review completion returned no result")
        router.push(resultRoute)
    }
    const submitReviewGrade = async (grade: 0 | 1 | 2 | 3) => {
        if (session.data === null || session.data === undefined || currentCard === undefined) return
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
            setAnswerVisible(false)
        } catch {
            setLocalFailed(true)
        }
    }
    const submitQuizAnswer = async (correct: boolean) => {
        if (session.data === null || session.data === undefined || currentCard === undefined || courseId === undefined) return
        const nextAnswers = [
            ...answers.filter((answer) => answer.cardId !== currentCard.cardId),
            {
                cardId: currentCard.cardId,
                correctBlanks: correct ? quizPrompt.blankCount : 0,
                totalBlanks: quizPrompt.blankCount,
            },
        ]
        try {
            const gradeResult = await rate.trigger({
                cardId: currentCard.cardId,
                sessionId,
                grade: correct ? 2 : 0,
            })
            if (gradeResult === null) throw new Error("Flashcard quiz grade returned no result")
            if (index >= session.data.cards.length - 1) {
                const result = await complete.trigger({ mode: "quiz", sessionId, courseId, answers: nextAnswers })
                if (result === null) throw new Error("Flashcard quiz completion returned no result")
                router.push(resultRoute)
                return
            }
            const nextIndex = index + 1
            const synced = await sync.trigger({ mode: "quiz", sessionId, currentIndex: nextIndex, results: nextAnswers })
            if (!synced) throw new Error("Flashcard quiz progress was not accepted")
            setAnswers(nextAnswers)
            setIndex(nextIndex)
            setAnswerVisible(false)
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
        transportFailed || course.data === null || currentCard === undefined && session.data !== undefined && session.data !== null,
        pending,
        expired || session.data === null,
        complete.isMutating,
        sync.isMutating || rate.isMutating,
    )

    return (
        <CourseFlashcardSessionPageBase
            state={state}
            data={{
                mode,
                title: mode === "review" ? copy.reviewTitle : copy.quizTitle,
                progressText: copy.progress(index + 1, session.data?.cards.length ?? 0),
                deckTitle: currentCard?.deckTitle,
                level: currentCard?.level,
                prompt: mode === "quiz" ? quizPrompt.prompt : currentCard?.front,
                answer: currentCard?.back,
                answerVisible,
                revealLabel: copy.reveal,
                againLabel: copy.again,
                hardLabel: copy.hard,
                goodLabel: copy.good,
                easyLabel: copy.easy,
                correctLabel: copy.correct,
                incorrectLabel: copy.incorrect,
                syncingLabel: copy.syncing,
                completingLabel: copy.completing,
                expiredText: copy.expired,
                failedText: copy.failed,
                retryLabel: copy.retry,
                leaveLabel: copy.leave,
            }}
            on={{
                reveal: () => setAnswerVisible(true),
                rate: (grade) => { void submitReviewGrade(grade) },
                answerQuiz: (correct) => { void submitQuizAnswer(correct) },
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
export const meta = { world: "connected", domain: "learn" } as const
