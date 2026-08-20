"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import type { PersonalProjectMilestone, PersonalProjectTask } from "@/modules/api/graphql/queries/types/course-personal-project"
import { CoursePersonalProjectPageBase } from "./component"

/** Course route identity required by the personal-project dashboard. */
export type CoursePersonalProjectPageProps = { readonly displayId: string }

const COPY = {
    en: {
        title: "Personal Project",
        breadcrumb: "Course path",
        next: "Next task",
        continue: "Continue",
        allComplete: "You've completed every task in your personal project",
        progress: "Completion progress",
        completed: "Completed",
        active: "Next task",
        locked: "Locked",
        notStarted: "Not started",
        empty: "This course does not have personal-project tasks yet.",
        failed: "Personal project could not be loaded.",
        retry: "Try again",
        tasksCompleted: (completed: number, total: number) => `${completed}/${total} tasks completed`,
        submissions: (count: number) => `${count} submissions`,
        average: (score: string) => `Average score ${score}`,
    },
    vi: {
        title: "Đồ án cá nhân", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        breadcrumb: "Lộ trình khóa học", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        next: "Bài tiếp theo", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        continue: "Tiếp tục", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        allComplete: "Bạn đã hoàn thành toàn bộ bài trong đồ án cá nhân", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        progress: "Tiến độ hoàn thành", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        completed: "Đã hoàn thành", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        active: "Bài tiếp theo", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        locked: "Đã khóa", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        notStarted: "Chưa bắt đầu", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        empty: "Khoá học này chưa có bài đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        failed: "Không thể tải đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        retry: "Thử lại", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        tasksCompleted: (completed: number, total: number) => `Đã hoàn thành ${completed}/${total} bài`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        submissions: (count: number) => `${count} lượt nộp`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        average: (score: string) => `Điểm trung bình ${score}`, // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
    },
} as const
type ProjectCopy = {
    readonly completed: string
    readonly active: string
    readonly locked: string
    readonly notStarted: string
    readonly empty: string
    readonly failed: string
    readonly tasksCompleted: (completed: number, total: number) => string
    readonly submissions: (count: number) => string
    readonly average: (score: string) => string
}
type ProjectProgress = { readonly tasksCompleted: number; readonly tasksTotal: number }

const findCurrentMilestone = (
    milestones: ReadonlyArray<PersonalProjectMilestone>,
    currentTaskId: string | undefined,
) => milestones.find((milestone) => milestone.tasks.some((task) => task.id === currentTaskId))
    ?? milestones.find((milestone) => milestone.tasks.some((task) => !task.completed))
    ?? milestones.at(-1)

const averageScore = (tasks: ReadonlyArray<PersonalProjectTask>) => {
    const scored = tasks.filter((task) => task.numAttempts > 0)
    if (scored.length === 0) return "—"
    const score = Math.round(scored.reduce((sum, task) => sum + task.lastScore, 0) / scored.length)
    const maximum = Math.round(scored.reduce((sum, task) => sum + task.maxScore, 0) / scored.length)
    return `${score}/${maximum}`
}

const projectStateOf = (failed: boolean, pending: boolean, hasTasks: boolean) => {
    if (failed) return "failed" as const
    if (pending) return "pending" as const
    return hasTasks ? "ready" as const : "empty" as const
}

const taskStatusOf = (task: PersonalProjectTask, index: number, currentIndex: number, currentTaskId: string | undefined, copy: ProjectCopy) => {
    if (task.completed) return copy.completed
    if (task.id === currentTaskId) return copy.active
    if (currentIndex >= 0 && index > currentIndex) return copy.locked
    return copy.notStarted
}

const completionFactsOf = (progress: ProjectProgress | undefined, copy: ProjectCopy, attempts: number, allTasks: ReadonlyArray<PersonalProjectTask>) => {
    if (progress === undefined) return ["", "", ""]
    return [
        copy.tasksCompleted(progress.tasksCompleted, progress.tasksTotal),
        copy.submissions(attempts),
        copy.average(averageScore(allTasks)),
    ]
}

const projectNoticeOf = (state: "failed" | "pending" | "ready" | "empty", copy: ProjectCopy) => {
    if (state === "empty") return copy.empty
    if (state === "failed") return copy.failed
    return undefined
}

/** Resolves live capstone progress into the accepted legacy dashboard hierarchy. */
export const CoursePersonalProjectPage = ({ displayId }: CoursePersonalProjectPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const data = project.data ?? undefined
    const milestones = (data?.milestones ?? []).slice().sort((left, right) => left.orderIndex - right.orderIndex)
    const allTasks = milestones.flatMap((milestone) => milestone.tasks)
    const hasTasks = allTasks.length > 0
    const state = projectStateOf(project.error !== undefined, project.data === undefined, hasTasks)
    const currentTaskId = data?.currentTask?.kind === "milestoneTask" ? data.currentTask.id : undefined
    const currentMilestone = findCurrentMilestone(milestones, currentTaskId)
    const currentTask = allTasks.find((task) => task.id === currentTaskId)
    const tasks = (currentMilestone?.tasks ?? []).map((task, index, milestoneTasks) => {
        const currentIndex = milestoneTasks.findIndex((candidate) => candidate.id === currentTaskId)
        const status = taskStatusOf(task, index, currentIndex, currentTaskId, copy)
        return {
            id: task.id,
            label: `${index + 1}. ${task.title} · ${status}`,
            isCurrent: task.id === currentTaskId,
        }
    })
    const attempts = allTasks.reduce((sum, task) => sum + task.numAttempts, 0)
    const completionFacts = completionFactsOf(data?.progress, copy, attempts, allTasks)
    return (
        <CoursePersonalProjectPageBase
            state={state}
            props={{
                breadcrumbLabel: copy.breadcrumb,
                courseTitle: data?.course.title,
                title: copy.title,
                nextTask: currentTask === undefined || currentMilestone === undefined
                    ? undefined
                    : {
                        id: currentTask.id,
                        position: `${copy.next} · ${currentMilestone.title}`,
                        title: currentTask.title,
                    },
                continueLabel: copy.continue,
                allCompleteLabel: copy.allComplete,
                completionLabel: copy.progress,
                completionPercent: data?.progress.completionPercent,
                completionFacts,
                milestoneTitle: currentMilestone?.title,
                tasks,
                notice: projectNoticeOf(state, copy),
                retryLabel: copy.retry,
            }}
            on={{
                openCourse: () => router.push(`/courses/${displayId}/learn`),
                openTask: (taskId) => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}`),
                retry: () => { void project.mutate() },
            }}
        />
    )
}

/** Architectural identity for the connected personal-project dashboard twin. */
export const meta = { world: "connected", domain: "learn" } as const
