"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryPersonalTaskAttemptFeedbacksSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptFeedbacksSwr"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import {
    PersonalProjectResultBase,
    type CoursePersonalProjectResultAttempt,
} from "./component"

/** Route identity required to resolve one personal-project grading result. */
export type PersonalProjectResultRouteProps = { readonly displayId: string; readonly taskId: string }

const COPY = {
    en: {
        fallbackTitle: "Task result", description: "Review the selected score, structured findings and every grading attempt.",
        back: "Back to task", attempt: (number: number) => `Attempt ${number}`, score: (score: number, maximum: number) => `${score}/${maximum} points`,
        passed: "Passed", needsWork: "Needs another pass", feedback: "Structured feedback", history: "Attempt history",
        historySummary: (count: number) => `${count} grading attempts, newest first`,
        selectAttempt: (number: number, score: number) => `Attempt ${number} · ${score} points`, previous: "Previous page", next: "Next page",
        nextTask: "Continue to next task", retryTask: "Return to task", pending: "Loading grading result...",
        empty: "No submission has been graded yet.", failed: "This task result could not be loaded.", partial: "The score is available, but detailed feedback could not be loaded.",
    },
    vi: {
        fallbackTitle: "Kết quả chấm bài", // vn-ok: localized Vietnamese interface copy.
        description: "Xem điểm đã chọn, phản hồi chi tiết và toàn bộ lịch sử chấm.", // vn-ok: localized Vietnamese interface copy.
        back: "Quay lại bài tập", // vn-ok: localized Vietnamese interface copy.
        attempt: (number: number) => `Lần ${number}`, // vn-ok: localized Vietnamese interface copy.
        score: (score: number, maximum: number) => `${score}/${maximum} điểm`, // vn-ok: localized Vietnamese interface copy.
        passed: "Đạt", // vn-ok: localized Vietnamese interface copy.
        needsWork: "Cần làm lại", // vn-ok: localized Vietnamese interface copy.
        feedback: "Phản hồi chi tiết", // vn-ok: localized Vietnamese interface copy.
        history: "Lịch sử chấm bài", // vn-ok: localized Vietnamese interface copy.
        historySummary: (count: number) => `${count} lần chấm, mới nhất trước`, // vn-ok: localized Vietnamese interface copy.
        selectAttempt: (number: number, score: number) => `Lần ${number} · ${score} điểm`, // vn-ok: localized Vietnamese interface copy.
        previous: "Trang trước", // vn-ok: localized Vietnamese interface copy.
        next: "Trang sau", // vn-ok: localized Vietnamese interface copy.
        nextTask: "Sang nhiệm vụ tiếp theo", // vn-ok: localized Vietnamese interface copy.
        retryTask: "Quay lại bài tập", // vn-ok: localized Vietnamese interface copy.
        pending: "Đang tải kết quả chấm...", // vn-ok: localized Vietnamese interface copy.
        empty: "Chưa có lần nộp nào được chấm.", // vn-ok: localized Vietnamese interface copy.
        failed: "Không thể tải kết quả bài tập này.", // vn-ok: localized Vietnamese interface copy.
        partial: "Đã có điểm nhưng chưa tải được phản hồi chi tiết.", // vn-ok: localized Vietnamese interface copy.
    },
} as const

/** Resolves selectable attempt history, structured feedback and the next course action. */
export const PersonalProjectResult = ({ displayId, taskId }: PersonalProjectResultRouteProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const search = useSearchParams()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const taskList = project.data?.milestones.flatMap((milestone) => milestone.tasks) ?? []
    const task = taskList.find((candidate) => candidate.id === taskId)
    const [historyOpen, setHistoryOpen] = useState(false)
    const attempts = useQueryPersonalTaskAttemptsSwr(project.data?.course.id, taskId, 0)
    const [selectedAttemptOverride, setSelectedAttemptOverride] = useState<CoursePersonalProjectResultAttempt>()

    useEffect(() => {
        if (search.get("history") === "1") setHistoryOpen(true)
    }, [search])
    const currentTaskIndex = taskList.findIndex((candidate) => candidate.id === taskId)
    const nextTask = currentTaskIndex < 0 ? undefined : taskList[currentTaskIndex + 1]
    const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" })
    const rows = (attempts.data?.data ?? []).map((attempt) => ({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        passed: attempt.passed,
        servedModel: attempt.servedModel ?? undefined,
        processedAt: attempt.processedAt === null || attempt.processedAt === undefined
            ? undefined
            : dateFormat.format(new Date(attempt.processedAt)),
    }))
    const selectedAttempt = selectedAttemptOverride ?? rows[0]
    const feedbacks = useQueryPersonalTaskAttemptFeedbacksSwr(selectedAttempt?.id)
    const failed = project.error !== undefined || attempts.error !== undefined
    const pending = project.data === undefined || attempts.data === undefined
        || (selectedAttempt !== undefined && feedbacks.data === undefined && feedbacks.error === undefined)
    const state = failed
        ? "failed"
        : pending
            ? "pending"
            : selectedAttempt === undefined
                ? "empty"
                : feedbacks.error !== undefined
                    ? "partial"
                    : "ready"
    const notice = state === "pending" ? copy.pending
        : state === "empty" ? copy.empty
            : state === "failed" ? copy.failed
                : state === "partial" ? copy.partial
                    : undefined

    return <>
        <PersonalProjectResultBase
            state={state}
            props={{
                resultState: state === "partial" ? "ready" : state,
                feedbackState: state === "partial" ? "failed" : "ready",
                title: task?.title ?? copy.fallbackTitle,
                description: copy.description,
                maximumScore: task?.maxScore ?? 0,
                selectedAttempt,
                feedbacks: (feedbacks.data ?? []).map((feedback) => ({
                    id: feedback.id,
                    message: feedback.message,
                    location: feedback.location ?? undefined,
                    suggestion: feedback.suggestion ?? undefined,
                })),
                notice,
                labels: copy,
            }}
            courseId={project.data?.course.id}
            taskId={taskId}
            historyOpen={historyOpen}
            selectedAttemptId={selectedAttempt?.id}
            on={{
                back: () => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}`),
                retryTask: () => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}`),
                nextTask: nextTask === undefined
                    ? undefined
                    : () => router.push(`/courses/${displayId}/learn/personal-project/tasks/${nextTask.id}`),
                openHistory: () => setHistoryOpen(true),
                dismissHistory: () => setHistoryOpen(false),
                selectHistory: (attempt) => {
                    setSelectedAttemptOverride(attempt)
                    setHistoryOpen(false)
                },
            }}
        />
    </>
}

/** Source-level ownership marker for the connected learning page. */
export const meta = { world: "connected", domain: "learn" } as const
