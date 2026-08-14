"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSubmitPersonalTaskAttemptSwr } from "@/hooks/swr/useMutateSubmitPersonalTaskAttemptSwr"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import { _CoursePersonalProjectTaskPage } from "./component"

/** Route identity needed to resolve and submit one personal-project task. */
export type CoursePersonalProjectTaskPageProps = {
    readonly displayId: string
    readonly taskId: string
}

const COPY = {
    en: {
        fallbackTitle: "Personal project task",
        fallbackDescription: "Complete this task to advance your personal project.",
        score: (maxScore: number) => `Up to ${maxScore} points`,
        submit: "Submit for review",
        retry: "Try again",
        loadFailed: "This personal-project task could not be loaded.",
        submitFailed: "The task could not be submitted. Try again.",
    },
    vi: {
        fallbackTitle: "Bài tập đồ án cá nhân", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        fallbackDescription: "Hoàn thành bài này để tiếp tục đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        score: (maxScore: number) => `Tối đa ${maxScore} điểm`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        submit: "Nộp để đánh giá", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        retry: "Thử lại", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        loadFailed: "Không thể tải bài tập đồ án cá nhân này.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        submitFailed: "Không thể nộp bài. Hãy thử lại.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
    },
} as const

/** Resolves the task, executes its real review mutation and opens the result route. */
export const CoursePersonalProjectTaskPage = ({ displayId, taskId }: CoursePersonalProjectTaskPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const task = project.data?.milestones
        .flatMap((milestone) => milestone.tasks)
        .find((candidate) => candidate.id === taskId)
    const attempts = useQueryPersonalTaskAttemptsSwr(project.data?.course.id, taskId)
    const submission = useMutateSubmitPersonalTaskAttemptSwr()
    const failedToLoad = project.error !== undefined
        || (project.data !== undefined && (project.data === null || task === undefined))
    const state = submission.error !== undefined
        ? "failed"
        : submission.isMutating
            ? "submitting"
            : failedToLoad
                ? "failed"
                : project.data === undefined
                    ? "pending"
                    : "ready"

    const submit = async () => {
        const courseId = project.data?.course.id
        if (courseId === undefined) return
        try {
            await submission.trigger({ courseId, taskId })
            await Promise.all([project.mutate(), attempts.mutate()])
            router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}/result`)
        } catch {
            // The mutation hook keeps the backend failure as its public error state.
        }
    }

    return (
        <_CoursePersonalProjectTaskPage
            state={state}
            props={{
                title: task?.title ?? copy.fallbackTitle,
                description: task?.type ?? copy.fallbackDescription,
                scoreLabel: task === undefined ? undefined : copy.score(task.maxScore),
                notice: submission.error === undefined ? copy.loadFailed : copy.submitFailed,
                submitLabel: copy.submit,
                retryLabel: copy.retry,
            }}
            on={{
                submit: () => { void submit() },
                retry: submission.error === undefined
                    ? () => { void project.mutate() }
                    : () => { void submit() },
            }}
        />
    )
}

/** Architectural identity for the connected task page twin. */
export const meta = { world: "connected", domain: "learn" } as const
