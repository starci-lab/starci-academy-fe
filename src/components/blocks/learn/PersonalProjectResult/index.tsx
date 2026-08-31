"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryPersonalTaskAttemptFeedbacksSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptFeedbacksSwr"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import { useQueryJobStatusSwr } from "@/hooks/swr/useQueryJobStatusSwr"
import {
    PersonalProjectResultBase,
    type CoursePersonalProjectResultAttempt,
} from "./component"

/** Route identity required to resolve one personal-project grading result. */
export type PersonalProjectResultProps = { readonly displayId: string; readonly taskId: string }

const COPY = {
    en: {
        fallbackTitle: "Task result", description: "Review the selected score, structured findings and every grading attempt.",
        failureDescription: "This submission was not graded because StarCi could not access the selected source.",
        back: "Back to task", attempt: (number: number) => `Attempt ${number}`, score: (score: number, maximum: number) => `${score}/${maximum} points`,
        passed: "Passed", needsWork: "Needs another pass", feedback: "Structured feedback", history: "Attempt history",
        actions: "Result actions",
        historySummary: (count: number) => `${count} grading attempts, newest first`,
        selectAttempt: (number: number, score: number) => `Attempt ${number} · ${score} points`, previous: "Previous page", next: "Next page",
        nextTask: "Continue to next task", retryTask: "Edit settings and resubmit", reviewStatus: "Review status", refresh: "Refresh result", pending: "Loading grading result...",
        queued: "Review accepted and waiting for a grading worker.", processing: "StarCi is reviewing the selected repository, branch, language and model. This page refreshes automatically.",
        reviewFailed: "The review could not read the selected repository or branch. Return to the task, check access and settings, then submit again.",
        empty: "No submission has been graded yet.", failed: "This task result could not be loaded.", partial: "The score is available, but detailed feedback could not be loaded.",
    },
    vi: {
        fallbackTitle: "Kết quả chấm bài", // vn-ok: localized Vietnamese interface copy.
        description: "Xem điểm đã chọn, phản hồi chi tiết và toàn bộ lịch sử chấm.", // vn-ok: localized Vietnamese interface copy.
        failureDescription: "Bài chưa được chấm vì StarCi không thể truy cập nguồn đã chọn.", // vn-ok: localized Vietnamese interface copy.
        back: "Quay lại bài tập", // vn-ok: localized Vietnamese interface copy.
        attempt: (number: number) => `Lần ${number}`, // vn-ok: localized Vietnamese interface copy.
        score: (score: number, maximum: number) => `${score}/${maximum} điểm`, // vn-ok: localized Vietnamese interface copy.
        passed: "Đạt", // vn-ok: localized Vietnamese interface copy.
        needsWork: "Cần làm lại", // vn-ok: localized Vietnamese interface copy.
        feedback: "Phản hồi chi tiết", // vn-ok: localized Vietnamese interface copy.
        history: "Lịch sử chấm bài", // vn-ok: localized Vietnamese interface copy.
        actions: "Thao tác kết quả", // vn-ok: localized Vietnamese interface copy.
        historySummary: (count: number) => `${count} lần chấm, mới nhất trước`, // vn-ok: localized Vietnamese interface copy.
        selectAttempt: (number: number, score: number) => `Lần ${number} · ${score} điểm`, // vn-ok: localized Vietnamese interface copy.
        previous: "Trang trước", // vn-ok: localized Vietnamese interface copy.
        next: "Trang sau", // vn-ok: localized Vietnamese interface copy.
        nextTask: "Sang nhiệm vụ tiếp theo", // vn-ok: localized Vietnamese interface copy.
        retryTask: "Sửa cấu hình và chấm lại", // vn-ok: localized Vietnamese interface copy.
        reviewStatus: "Trạng thái chấm bài", // vn-ok: localized Vietnamese interface copy.
        refresh: "Làm mới kết quả", // vn-ok: localized Vietnamese interface copy.
        pending: "Đang tải kết quả chấm...", // vn-ok: localized Vietnamese interface copy.
        queued: "Đã nhận bài và đang chờ worker chấm.", // vn-ok: localized Vietnamese interface copy.
        processing: "StarCi đang đọc đúng repository, branch, ngôn ngữ và mô hình đã chọn. Trang sẽ tự làm mới.", // vn-ok: localized Vietnamese interface copy.
        reviewFailed: "Không thể đọc repository hoặc branch đã chọn. Hãy quay lại bài tập, kiểm tra URL, quyền truy cập và branch rồi gửi lại.", // vn-ok: localized Vietnamese interface copy.
        empty: "Chưa có lần nộp nào được chấm.", // vn-ok: localized Vietnamese interface copy.
        failed: "Không thể tải kết quả bài tập này.", // vn-ok: localized Vietnamese interface copy.
        partial: "Đã có điểm nhưng chưa tải được phản hồi chi tiết.", // vn-ok: localized Vietnamese interface copy.
    },
} as const

/** Resolves selectable attempt history, structured feedback and the next course action. */
export const PersonalProjectResult = (props: PersonalProjectResultProps) => {
    const { displayId, taskId } = props
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
    const [pollCount, setPollCount] = useState(0)

    useEffect(() => {
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
    }, [taskId])
    useEffect(() => {
        if (search.get("history") === "1") setHistoryOpen(true)
    }, [search])
    const currentTaskIndex = taskList.findIndex((candidate) => candidate.id === taskId)
    const nextTask = currentTaskIndex < 0 ? undefined : taskList[currentTaskIndex + 1]
    const localePrefix = locale === "vi" ? "/vi" : "/en"
    const taskHref = `${localePrefix}/courses/${displayId}/learn/personal-project/tasks/${taskId}`
    const nextTaskHref = nextTask === undefined
        ? undefined
        : `${localePrefix}/courses/${displayId}/learn/personal-project/tasks/${nextTask.id}`
    const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" })
    const rows = (attempts.data?.data ?? []).map((attempt) => ({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        passed: attempt.passed,
        servedModel: attempt.servedModel ?? undefined,
        servedProvider: attempt.servedProvider ?? undefined,
        processedAt: attempt.processedAt === null || attempt.processedAt === undefined
            ? undefined
            : dateFormat.format(new Date(attempt.processedAt)),
    }))
    const requestedAttemptId = search.get("attempt")
    const queuedJobId = search.get("job")
    const job = useQueryJobStatusSwr(queuedJobId ?? undefined)
    const requestedAttempt = rows.find((attempt) => attempt.id === requestedAttemptId)
    const selectedAttempt = selectedAttemptOverride ?? requestedAttempt ?? rows[0]
    const feedbacks = useQueryPersonalTaskAttemptFeedbacksSwr(selectedAttempt?.id)
    useEffect(() => {
        if (queuedJobId === null || rows.length > 0 || attempts.error !== undefined || job.data?.status === "failed") return
        let active = true
        const timer = window.setInterval(() => {
            void attempts.mutate().finally(() => {
                if (active) setPollCount((count) => count + 1)
            })
        }, 2000)
        return () => {
            active = false
            window.clearInterval(timer)
        }
    }, [attempts.error, attempts.mutate, job.data?.status, queuedJobId, rows.length])
    useEffect(() => {
        if (job.data?.status !== "completed" || rows.length > 0) return
        void attempts.mutate()
    }, [attempts.mutate, job.data?.status, rows.length])
    const reviewFailed = selectedAttempt === undefined && job.data?.status === "failed"
    const failed = project.error !== undefined || attempts.error !== undefined || job.error !== undefined
    const pending = project.data === undefined || attempts.data === undefined
        || (selectedAttempt !== undefined && feedbacks.data === undefined && feedbacks.error === undefined)
    const state = failed
        ? "failed"
        : pending
            ? "pending"
            : selectedAttempt === undefined
                ? queuedJobId === null ? "empty"
                    : reviewFailed ? "failed"
                        : job.data?.status === "queued" ? "queued"
                            : job.data?.status === "processing" || job.data?.status === "completed" || pollCount > 0 ? "processing"
                                : "queued"
                : feedbacks.error !== undefined
                    ? "partial"
                    : "ready"
    const notice = state === "pending" ? copy.pending
        : state === "queued" ? copy.queued
            : state === "processing" ? copy.processing
                : state === "empty" ? copy.empty
                    : state === "failed" ? reviewFailed ? copy.reviewFailed : copy.failed
                        : state === "partial" ? copy.partial
                            : undefined

    return <>
        <PersonalProjectResultBase
            state={state}
            props={{
                resultState: state === "partial" ? "ready" : state,
                feedbackState: state === "partial" ? "failed" : "ready",
                title: task?.title ?? copy.fallbackTitle,
                description: reviewFailed ? copy.failureDescription : copy.description,
                maximumScore: task?.maxScore ?? 0,
                selectedAttempt,
                feedbacks: (feedbacks.data ?? []).map((feedback) => ({
                    id: feedback.id,
                    message: feedback.message,
                    location: feedback.location ?? undefined,
                    suggestion: feedback.suggestion ?? undefined,
                })),
                notice,
                backHref: taskHref,
                retryTaskHref: taskHref,
                nextTaskHref,
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
                refresh: () => { void attempts.mutate() },
                openHistory: () => setHistoryOpen(true),
                dismissHistory: () => setHistoryOpen(false),
                selectHistory: (attempt) => {
                    setSelectedAttemptOverride(attempt)
                    setHistoryOpen(false)
                    router.replace(`/courses/${displayId}/learn/personal-project/tasks/${taskId}/result?attempt=${encodeURIComponent(attempt.id)}`)
                },
            }}
        />
    </>
}
