"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { CoursePersonalProjectPageBase } from "./component"

/** Course route identity required by the personal-project dashboard. */
export type CoursePersonalProjectPageProps = { readonly displayId: string }

const COPY = {
    en: {
        title: "Personal Project",
        description: "Build and submit your project step by step.",
        progress: "Completion progress",
        completed: "Completed",
        current: "Next task",
        notStarted: "Not started",
        empty: "This course does not have personal-project tasks yet.",
        failed: "Personal project could not be loaded.",
        retry: "Try again",
        tasksCompleted: (completed: number, total: number) => `${completed}/${total} tasks completed`,
    },
    vi: {
        title: "Đồ án cá nhân", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        description: "Hoàn thiện và nộp đồ án theo từng bước.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        progress: "Tiến độ hoàn thành", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        completed: "Đã hoàn thành", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        current: "Bài tiếp theo", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        notStarted: "Chưa bắt đầu", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        empty: "Khoá học này chưa có bài đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        failed: "Không thể tải đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        retry: "Thử lại", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        tasksCompleted: (completed: number, total: number) => `Đã hoàn thành ${completed}/${total} bài`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
    },
} as const

/** Resolves live capstone progress and ordered task destinations for one course. */
export const CoursePersonalProjectPage = ({ displayId }: CoursePersonalProjectPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const data = project.data ?? undefined
    const hasTasks = data?.milestones.some((milestone) => milestone.tasks.length > 0) === true
    const state = project.error !== undefined
        ? "failed"
        : project.data === undefined
            ? "pending"
            : hasTasks
                ? "ready"
                : "empty"
    const currentTaskId = data?.currentTask?.kind === "milestoneTask"
        ? data.currentTask.id
        : undefined
    const tasks = (data?.milestones ?? [])
        .slice()
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .flatMap((milestone) => milestone.tasks.map((task) => ({
            id: task.id,
            label: `${milestone.title} · ${task.title} · ${task.completed ? copy.completed : task.id === currentTaskId ? copy.current : copy.notStarted}`,
            isCurrent: task.id === currentTaskId,
        })))
    return (
        <CoursePersonalProjectPageBase
            state={state}
            props={{
                title: copy.title,
                description: copy.description,
                progressLabel: copy.progress,
                progressText: data === undefined
                    ? undefined
                    : copy.tasksCompleted(data.progress.tasksCompleted, data.progress.tasksTotal),
                completionPercent: data?.progress.completionPercent,
                tasks,
                notice: state === "empty" ? copy.empty : state === "failed" ? copy.failed : undefined,
                retryLabel: copy.retry,
            }}
            on={{
                openTask: (taskId) => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}`),
                retry: () => { void project.mutate() },
            }}
        />
    )
}

/** Architectural identity for the connected personal-project dashboard twin. */
export const meta = { world: "connected", domain: "learn" } as const
