"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import type { PersonalProjectMilestone, PersonalProjectTask } from "@/modules/api/graphql/queries/types/course-personal-project"
import { CoursePersonalProjectBase, type CoursePersonalProjectState } from "./component"

/** Route identity required by the connected project dashboard. */
export type CoursePersonalProjectProps = { readonly displayId: string }
const COPY = {
    en: { title: "Personal Project", breadcrumb: "Course path", next: "Next task", continue: "Continue", allComplete: "You've completed every task in your personal project", progress: "Completion progress", completed: "Completed", active: "Next task", locked: "Locked", notStarted: "Not started", empty: "This course does not have personal-project tasks yet.", failed: "Personal project could not be loaded.", retry: "Try again", openTask: "Continue", tasksCompleted: (completed: number, total: number) => `${completed}/${total} tasks completed`, submissions: (count: number) => `${count} submissions`, average: (score: string) => `Average score ${score}` },
    vi: { title: "Đồ án cá nhân", breadcrumb: "Lộ trình khóa học", next: "Bài tiếp theo", continue: "Tiếp tục", allComplete: "Bạn đã hoàn thành toàn bộ bài trong đồ án cá nhân", progress: "Tiến độ hoàn thành", completed: "Đã hoàn thành", active: "Bài tiếp theo", locked: "Đã khóa", notStarted: "Chưa bắt đầu", empty: "Khoá học này chưa có bài đồ án cá nhân.", failed: "Không thể tải đồ án cá nhân.", retry: "Thử lại", openTask: "Tiếp tục", tasksCompleted: (completed: number, total: number) => `Đã hoàn thành ${completed}/${total} bài`, submissions: (count: number) => `${count} lượt nộp`, average: (score: string) => `Điểm trung bình ${score}` }, // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
} as const
type ProjectCopy = (typeof COPY)[keyof typeof COPY]
type ProjectProgress = { readonly tasksCompleted: number; readonly tasksTotal: number }

const findCurrentMilestone = (milestones: ReadonlyArray<PersonalProjectMilestone>, currentTaskId: string | undefined) => milestones.find((milestone) => milestone.tasks.some((task) => task.id === currentTaskId)) ?? milestones.find((milestone) => milestone.tasks.some((task) => !task.completed)) ?? milestones.at(-1)
const averageScore = (tasks: ReadonlyArray<PersonalProjectTask>) => { const scored = tasks.filter((task) => task.numAttempts > 0); if (scored.length === 0) return "—"; const score = Math.round(scored.reduce((sum, task) => sum + task.lastScore, 0) / scored.length); const maximum = Math.round(scored.reduce((sum, task) => sum + task.maxScore, 0) / scored.length); return `${score}/${maximum}` }
const taskStatusOf = (task: PersonalProjectTask, index: number, currentIndex: number, currentTaskId: string | undefined, copy: ProjectCopy) => task.completed ? copy.completed : task.id === currentTaskId ? copy.active : currentIndex >= 0 && index > currentIndex ? copy.locked : copy.notStarted
const completionFactsOf = (progress: ProjectProgress | undefined, copy: ProjectCopy, attempts: number, allTasks: ReadonlyArray<PersonalProjectTask>) => progress === undefined ? ["", "", ""] : [copy.tasksCompleted(progress.tasksCompleted, progress.tasksTotal), copy.submissions(attempts), copy.average(averageScore(allTasks))]

/** Resolve live capstone progress, current milestone and task actions. */
export const CoursePersonalProject = ({ displayId }: CoursePersonalProjectProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const data = project.data ?? undefined
    const milestones = (data?.milestones ?? []).slice().sort((left, right) => left.orderIndex - right.orderIndex)
    const allTasks = milestones.flatMap((milestone) => milestone.tasks)
    const currentTaskId = data?.currentTask?.kind === "milestoneTask" ? data.currentTask.id : undefined
    const currentMilestone = findCurrentMilestone(milestones, currentTaskId)
    const currentTask = allTasks.find((task) => task.id === currentTaskId)
    const pageState: CoursePersonalProjectState = project.error !== undefined ? "failed" : project.data === undefined ? "pending" : allTasks.length === 0 ? "empty" : "ready"
    const tasks = (currentMilestone?.tasks ?? []).map((task, index, milestoneTasks) => ({ id: task.id, position: index + 1, title: task.title, status: taskStatusOf(task, index, milestoneTasks.findIndex((candidate) => candidate.id === currentTaskId), currentTaskId, copy), actionLabel: copy.openTask, isCurrent: task.id === currentTaskId }))
    const attempts = allTasks.reduce((sum, task) => sum + task.numAttempts, 0)
    return <CoursePersonalProjectBase
        state={pageState}
        data={{ breadcrumbLabel: copy.breadcrumb, courseTitle: data?.course.title, title: copy.title, nextTask: currentTask === undefined || currentMilestone === undefined ? undefined : { id: currentTask.id, position: `${copy.next} · ${currentMilestone.title}`, title: currentTask.title }, continueLabel: copy.continue, allCompleteLabel: copy.allComplete, completionLabel: copy.progress, completionPercent: data?.progress.completionPercent, completionFacts: completionFactsOf(data?.progress, copy, attempts, allTasks), milestoneTitle: currentMilestone?.title, tasks, notice: pageState === "empty" ? copy.empty : pageState === "failed" ? copy.failed : undefined, retryLabel: copy.retry }}
        on={{ openCourse: () => router.push(`/courses/${displayId}/learn`), openTask: (taskId) => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}`), retry: () => { void project.mutate() } }}
    />
}

export { CoursePersonalProjectBase } from "./component"
/** Source-level ownership marker for the connected project block. */
export const meta = { world: "connected", domain: "learn" } as const
