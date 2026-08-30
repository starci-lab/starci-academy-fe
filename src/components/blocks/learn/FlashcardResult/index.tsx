"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFlashcardSessionResultSwr } from "@/hooks/swr/useQueryFlashcardSessionResultSwr"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"
import { FlashcardResultBase } from "./component"

/** Stable result-route identity required by the connected result page. */
export type FlashcardResultBlockProps = {
    readonly displayId: string
    readonly sessionId: string
    readonly mode: FlashcardSessionMode
}

const COPY = {
    en: {
        reviewTitle: "Review complete",
        quizTitle: "Quiz complete",
        reviewMode: "Review session",
        quizMode: "Quiz session",
        subtitle: "Your persisted session result is ready.",
        score: "Score",
        reviewed: "Cards reviewed",
        quizReviewed: "Questions answered",
        xp: "XP earned",
        duration: "Duration",
        nextDue: "Next review",
        breakdown: "Review breakdown",
        weakTopics: "Topics to revisit",
        topicCoverage: "Accuracy by topic",
        failed: "This result could not be loaded.",
        retry: "Try again",
        retrySession: "Practice again",
        back: "Back to flashcards",
        durationText: (value: number) => value < 60 ? `${value}s` : `${Math.floor(value / 60)}m ${value % 60}s`,
        again: "Again",
        hard: "Hard",
        good: "Good",
        easy: "Easy",
    },
    vi: {
        reviewTitle: "Đã hoàn tất ôn tập", // vn-ok: localized Vietnamese interface copy.
        quizTitle: "Đã hoàn tất trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
        reviewMode: "Phiên ôn tập", // vn-ok: localized Vietnamese interface copy.
        quizMode: "Phiên trắc nghiệm", // vn-ok: localized Vietnamese interface copy.
        subtitle: "Kết quả phiên đã được lưu.", // vn-ok: localized Vietnamese interface copy.
        score: "Điểm", // vn-ok: localized Vietnamese interface copy.
        reviewed: "Số thẻ đã ôn", // vn-ok: localized Vietnamese interface copy.
        quizReviewed: "Số câu đã trả lời", // vn-ok: localized Vietnamese interface copy.
        xp: "XP nhận được", // vn-ok: localized Vietnamese interface copy.
        duration: "Thời lượng", // vn-ok: localized Vietnamese interface copy.
        nextDue: "Lần ôn tiếp theo", // vn-ok: localized Vietnamese interface copy.
        breakdown: "Chi tiết ôn tập", // vn-ok: localized Vietnamese interface copy.
        weakTopics: "Chủ đề cần ôn lại", // vn-ok: localized Vietnamese interface copy.
        topicCoverage: "Độ chính xác theo chủ đề", // vn-ok: localized Vietnamese interface copy.
        failed: "Không thể tải kết quả này.", // vn-ok: localized Vietnamese interface copy.
        retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
        retrySession: "Luyện tập lại", // vn-ok: localized Vietnamese interface copy.
        back: "Quay lại flashcard", // vn-ok: localized Vietnamese interface copy.
        durationText: (value: number) => value < 60 ? `${value} giây` : `${Math.floor(value / 60)} phút ${value % 60} giây`, // vn-ok: localized Vietnamese interface copy.
        again: "Học lại", // vn-ok: localized Vietnamese interface copy.
        hard: "Khó", // vn-ok: localized Vietnamese interface copy.
        good: "Tốt", // vn-ok: localized Vietnamese interface copy.
        easy: "Dễ", // vn-ok: localized Vietnamese interface copy.
    },
} as const

/** Resolves one persisted result projection and its retry/onward destinations. */
export const FlashcardResultBlock = (props: FlashcardResultBlockProps) => {
    const { displayId, sessionId, mode } = props
    const isVietnamese = useLocale() === "vi"
    const copy = isVietnamese ? COPY.vi : COPY.en
    const router = useRouter()
    const auth = useSessionRefresh()
    const result = useQueryFlashcardSessionResultSwr(auth.isRestoring ? undefined : mode, auth.isRestoring ? undefined : sessionId)
    const state = result.error !== undefined
        ? "failed"
        : result.data === undefined
            ? "pending"
            : result.data === null
                ? "failed"
                : "ready"
    const data = result.data ?? undefined
    const gradeCounts = data?.gradeCounts
    const overviewRoute = `/courses/${displayId}/learn/flashcards/${mode}`

    return (
        <FlashcardResultBase
            blockState={state}
            data={{
                mode,
                modeText: mode === "review" ? copy.reviewMode : copy.quizMode,
                title: mode === "review" ? copy.reviewTitle : copy.quizTitle,
                subtitle: copy.subtitle,
                scoreLabel: copy.score,
                scoreText: data === undefined ? undefined : `${data.scorePercent}%`,
                scorePercent: data?.scorePercent,
                reviewedLabel: mode === "quiz" ? copy.quizReviewed : copy.reviewed,
                reviewedText: data?.reviewedCount.toString(),
                xpLabel: copy.xp,
                xpText: data === undefined ? undefined : data.xpEarned > 0 ? `+${data.xpEarned}` : "0",
                durationLabel: copy.duration,
                durationText: data?.durationSeconds == null ? "—" : copy.durationText(data.durationSeconds),
                nextDueLabel: copy.nextDue,
                nextDueText: data?.nextDueAt == null ? undefined : new Date(data.nextDueAt).toLocaleString(),
                breakdownTitle: copy.breakdown,
                gradeRows: gradeCounts === undefined ? [] : [
                    { label: copy.again, value: gradeCounts.again },
                    { label: copy.hard, value: gradeCounts.hard },
                    { label: copy.good, value: gradeCounts.good },
                    { label: copy.easy, value: gradeCounts.easy },
                ],
                weakTopicsTitle: mode === "quiz" ? copy.topicCoverage : copy.weakTopics,
                weakTopics: (data?.weakTags ?? []).map((topic) => ({
                    tag: topic.tag,
                    value: mode === "quiz" ? `${topic.value}%` : topic.value.toString(),
                    percent: mode === "quiz" ? topic.value : undefined,
                })),
                failedText: copy.failed,
                retryLabel: copy.retry,
                retrySessionLabel: copy.retrySession,
                backLabel: copy.back,
            }}
            on={{
                retryLoad: () => { void result.mutate() },
                retrySession: () => router.push(overviewRoute),
                back: () => router.push(overviewRoute),
            }}
        />
    )
}

/** Canon metadata for the connected page half. */
