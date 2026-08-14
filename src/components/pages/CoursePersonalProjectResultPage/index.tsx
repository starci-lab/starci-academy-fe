"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryPersonalTaskAttemptFeedbacksSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptFeedbacksSwr"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import { _CoursePersonalProjectResultPage } from "./component"

/** Route identity needed to resolve one task's attempt history. */
export type CoursePersonalProjectResultPageProps = {
    readonly displayId: string
    readonly taskId: string
}

const COPY = {
    en: {
        fallbackTitle: "Task result",
        description: "Review your grading history and the latest structured feedback.",
        attempts: "Attempt history",
        feedback: "Latest feedback",
        emptyFeedback: "No detailed feedback was returned for the latest attempt.",
        pending: "Loading result...",
        empty: "No submission has been graded yet.",
        failed: "This task result could not be loaded.",
        retry: "Return to task",
        attempt: (attemptNumber: number, score: number, passed: boolean) =>
            `Attempt ${attemptNumber}: ${score} points · ${passed ? "Passed" : "Needs another pass"}`,
    },
    vi: {
        fallbackTitle: "Kết quả bài tập", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        description: "Xem lịch sử chấm điểm và phản hồi chi tiết mới nhất.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        attempts: "Lịch sử nộp bài", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        feedback: "Phản hồi mới nhất", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        emptyFeedback: "Lần nộp mới nhất chưa có phản hồi chi tiết.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        pending: "Đang tải kết quả...", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        empty: "Chưa có lần nộp nào được chấm.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        failed: "Không thể tải kết quả bài tập này.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        retry: "Quay lại bài tập", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        attempt: (attemptNumber: number, score: number, passed: boolean) =>
            `Lần ${attemptNumber}: ${score} điểm · ${passed ? "Đạt" : "Cần làm lại"}`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
    },
} as const

/** Resolves task attempts and latest feedback for the dedicated result route. */
export const CoursePersonalProjectResultPage = ({ displayId, taskId }: CoursePersonalProjectResultPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const task = project.data?.milestones
        .flatMap((milestone) => milestone.tasks)
        .find((candidate) => candidate.id === taskId)
    const attempts = useQueryPersonalTaskAttemptsSwr(project.data?.course.id, taskId)
    const latest = attempts.data?.[0]
    const feedbacks = useQueryPersonalTaskAttemptFeedbacksSwr(latest?.id)
    const failed = project.error !== undefined
        || attempts.error !== undefined
        || feedbacks.error !== undefined
        || (project.data !== undefined && (project.data === null || task === undefined))
    const pending = project.data === undefined
        || (task !== undefined && attempts.data === undefined)
        || (latest !== undefined && feedbacks.data === undefined)
    const state = failed
        ? "failed"
        : pending
            ? "pending"
            : latest === undefined
                ? "empty"
                : "ready"
    const feedbackRows = (feedbacks.data ?? []).map((feedback) => ({
        id: feedback.id,
        label: [feedback.message, feedback.location, feedback.suggestion].filter(Boolean).join(" · "),
    }))

    return (
        <_CoursePersonalProjectResultPage
            state={state}
            props={{
                title: task?.title ?? copy.fallbackTitle,
                description: copy.description,
                attemptsLabel: copy.attempts,
                feedbackLabel: copy.feedback,
                attempts: (attempts.data ?? []).map((attempt) => ({
                    id: attempt.id,
                    label: copy.attempt(attempt.attemptNumber, attempt.score, attempt.passed),
                })),
                feedbacks: feedbackRows.length === 0 && state === "ready"
                    ? [{ id: "empty-feedback", label: copy.emptyFeedback }]
                    : feedbackRows,
                notice: state === "pending"
                    ? copy.pending
                    : state === "empty"
                        ? copy.empty
                        : state === "failed"
                            ? copy.failed
                            : undefined,
                retryTaskLabel: copy.retry,
            }}
            on={{
                retryTask: () => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}`),
            }}
        />
    )
}

/** Architectural identity for the connected result page twin. */
export const meta = { world: "connected", domain: "learn" } as const
