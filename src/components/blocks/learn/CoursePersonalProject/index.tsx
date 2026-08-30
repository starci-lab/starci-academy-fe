"use client"

import { useLocale } from "next-intl"
import { useState } from "react"
import { getPathname, useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryPersonalProjectRepositorySwr } from "@/hooks/swr/useQueryPersonalProjectRepositorySwr"
import type { PersonalProjectMilestone, PersonalProjectTask } from "@/modules/api/graphql/queries/types/course-personal-project"
import { CoursePersonalProjectBase, type CoursePersonalProjectRepositoryState, type CoursePersonalProjectState } from "./component"

/** Route identity required by the connected project dashboard. */
export type CoursePersonalProjectProps = { readonly displayId: string }

const COPY = {
    en: {
        title: "Personal Project",
        breadcrumb: "Course path",
        description: "See the next decision, the whole delivery path, and the evidence your project has accumulated.",
        nextTask: "Next task",
        continue: (title: string) => `Continue: ${title}`,
        allComplete: "You've completed every task in your personal project.",
        roadmap: "Project roadmap",
        roadmapSearch: "Search stages",
        roadmapSearchClear: "Clear roadmap search",
        roadmapEmpty: "No project stages match this search.",
        roadmapCount: (visible: number, total: number) => visible === total ? `${total} stages` : `${visible} results across ${total} stages`,
        progress: "Whole-project progress",
        completed: "Completed",
        active: "In progress",
        upcoming: "Upcoming",
        empty: "This course does not have personal-project tasks yet.",
        failed: "Personal project could not be loaded.",
        retry: "Try again",
        tasks: "Tasks",
        submissions: "Submissions",
        average: "Average score",
        repository: "Repository",
        repositoryConnected: "Connected to the project repository",
        repositoryEmpty: "No repository has been connected yet.",
        repositoryFailed: "Repository status could not be loaded. The project roadmap is still available.",
        branch: "Branch",
        openRepository: "Open repository",
        milestoneProgress: (completed: number, total: number) => `${completed}/${total}`,
        taskEvidence: (attempts: number, score: number, maximum: number) => attempts === 0 ? `Worth ${maximum} points` : `${score}/${maximum} · ${attempts} ${attempts === 1 ? "submission" : "submissions"}`,
    },
    vi: {
        title: "Đồ án cá nhân", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        breadcrumb: "Lộ trình khóa học", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        description: "Nắm bài cần làm tiếp, toàn bộ lộ trình và bằng chứng tiến độ của đồ án trong một màn hình.", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        nextTask: "Bài cần làm tiếp", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        continue: (title: string) => `Tiếp tục: ${title}`, // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        allComplete: "Bạn đã hoàn thành toàn bộ bài trong đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        roadmap: "Lộ trình đồ án", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        roadmapSearch: "Tìm chặng", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        roadmapSearchClear: "Xóa tìm kiếm lộ trình", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        roadmapEmpty: "Không có chặng nào khớp tìm kiếm.", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        roadmapCount: (visible: number, total: number) => visible === total ? `${total} chặng` : `${visible} kết quả trong ${total} chặng`, // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        progress: "Tiến độ toàn dự án", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        completed: "Đã hoàn thành", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        active: "Đang thực hiện", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        upcoming: "Sắp tới", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        empty: "Khoá học này chưa có bài đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        failed: "Không thể tải đồ án cá nhân.", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        retry: "Thử lại", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        tasks: "Bài đã hoàn thành", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        submissions: "Lượt nộp", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        average: "Điểm trung bình", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        repository: "Repository",
        repositoryConnected: "Đã kết nối repository của đồ án", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        repositoryEmpty: "Đồ án chưa kết nối repository.", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        repositoryFailed: "Không thể tải trạng thái repository. Lộ trình đồ án vẫn dùng được.", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        branch: "Nhánh", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        openRepository: "Mở repository", // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
        milestoneProgress: (completed: number, total: number) => `${completed}/${total}`,
        taskEvidence: (attempts: number, score: number, maximum: number) => attempts === 0 ? `Tối đa ${maximum} điểm` : `${score}/${maximum} · ${attempts} lượt nộp`, // vn-ok: Vietnamese runtime copy while shared catalogs are frozen.
    },
} as const

type ProjectCopy = (typeof COPY)[keyof typeof COPY]
type ProjectProgress = { readonly tasksCompleted: number; readonly tasksTotal: number; readonly completionPercent: number }

const averageScore = (tasks: ReadonlyArray<PersonalProjectTask>) => {
    const scored = tasks.filter((task) => task.numAttempts > 0)
    if (scored.length === 0) return "—"
    const score = Math.round(scored.reduce((sum, task) => sum + task.lastScore, 0) / scored.length)
    const maximum = Math.round(scored.reduce((sum, task) => sum + task.maxScore, 0) / scored.length)
    return `${score}/${maximum}`
}

const milestoneRowsOf = (
    milestones: ReadonlyArray<PersonalProjectMilestone>,
    currentTaskId: string | undefined,
    copy: ProjectCopy,
    locale: string,
    displayId: string,
) => milestones.map((milestone) => {
    const completed = milestone.tasks.filter((task) => task.completed).length
    const isComplete = milestone.tasks.length > 0 && completed === milestone.tasks.length
    const currentTask = milestone.tasks.find((task) => task.id === currentTaskId)
    const targetTaskId = currentTask?.id ?? (isComplete ? milestone.tasks.at(0)?.id : undefined)
    return {
        id: milestone.id,
        title: milestone.title,
        status: isComplete ? copy.completed : currentTask === undefined ? copy.upcoming : copy.active,
        progress: copy.milestoneProgress(completed, milestone.tasks.length),
        completionPercent: milestone.tasks.length === 0 ? 0 : Math.round(completed / milestone.tasks.length * 100),
        href: targetTaskId === undefined ? undefined : getPathname({ locale, href: `/courses/${displayId}/learn/personal-project/tasks/${targetTaskId}` }),
        tone: isComplete ? "success" as const : currentTask === undefined ? "neutral" as const : "accent" as const,
    }
})

const completionFactsOf = (progress: ProjectProgress | undefined, attempts: number, allTasks: ReadonlyArray<PersonalProjectTask>, copy: ProjectCopy) => [
    { label: copy.tasks, value: progress === undefined ? "" : `${progress.tasksCompleted}/${progress.tasksTotal}` },
    { label: copy.submissions, value: progress === undefined ? "" : String(attempts) },
    { label: copy.average, value: progress === undefined ? "" : averageScore(allTasks) },
]

/** Resolve live project authority and compose its ancillary repository evidence. */
export const CoursePersonalProject = (props: CoursePersonalProjectProps) => {
    const { displayId } = props
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const [roadmapQuery, setRoadmapQuery] = useState("")
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const data = project.data ?? undefined
    const repository = useQueryPersonalProjectRepositorySwr(data?.course.id)
    const milestones = (data?.milestones ?? []).slice().sort((left, right) => left.orderIndex - right.orderIndex)
    const allTasks = milestones.flatMap((milestone) => milestone.tasks)
    const currentTaskId = data?.currentTask?.kind === "milestoneTask" ? data.currentTask.id : undefined
    const currentTask = allTasks.find((task) => task.id === currentTaskId)
    const currentMilestone = milestones.find((milestone) => milestone.tasks.some((task) => task.id === currentTaskId))
    const pageState: CoursePersonalProjectState = project.error !== undefined ? "failed" : project.data === undefined ? "pending" : allTasks.length === 0 ? "empty" : "ready"
    const repositoryState: CoursePersonalProjectRepositoryState = data?.course.id === undefined || repository.data === undefined
        ? repository.error === undefined ? "pending" : "failed"
        : repository.error === undefined ? "ready" : "failed"
    const attempts = allTasks.reduce((sum, task) => sum + task.numAttempts, 0)
    const completionPercent = data?.progress.completionPercent
    const normalizedRoadmapQuery = roadmapQuery.trim().toLocaleLowerCase(locale)
    const roadmapRows = milestoneRowsOf(milestones, currentTaskId, copy, locale, displayId)
    const visibleRoadmapRows = normalizedRoadmapQuery === ""
        ? roadmapRows
        : roadmapRows.filter((milestone) => `${milestone.title} ${milestone.status}`.toLocaleLowerCase(locale).includes(normalizedRoadmapQuery))

    return <CoursePersonalProjectBase
        state={pageState}
        data={{
            breadcrumbLabel: copy.breadcrumb,
            courseTitle: data?.course.title,
            title: copy.title,
            description: copy.description,
            nextTaskLabel: copy.nextTask,
            nextTask: currentTask === undefined || currentMilestone === undefined ? undefined : {
                id: currentTask.id,
                milestone: currentMilestone.title,
                title: currentTask.title,
                evidence: copy.taskEvidence(currentTask.numAttempts, currentTask.lastScore, currentTask.maxScore),
                href: getPathname({ locale, href: `/courses/${displayId}/learn/personal-project/tasks/${currentTask.id}` }),
            },
            continueLabel: currentTask === undefined ? copy.title : copy.continue(currentTask.title),
            allCompleteLabel: copy.allComplete,
            roadmapLabel: copy.roadmap,
            roadmapSearchLabel: copy.roadmapSearch,
            roadmapSearchClearLabel: copy.roadmapSearchClear,
            roadmapCountLabel: copy.roadmapCount(visibleRoadmapRows.length, roadmapRows.length),
            roadmapEmptyLabel: copy.roadmapEmpty,
            milestones: visibleRoadmapRows,
            completionLabel: copy.progress,
            completionPercent,
            completionPercentLabel: completionPercent === undefined ? "" : `${completionPercent}%`,
            completionFacts: completionFactsOf(data?.progress, attempts, allTasks, copy),
            repository: {
                state: repositoryState,
                label: copy.repository,
                connectedLabel: copy.repositoryConnected,
                emptyLabel: copy.repositoryEmpty,
                failedLabel: copy.repositoryFailed,
                branchLabel: copy.branch,
                branch: repository.data?.branch ?? undefined,
                url: repository.data?.githubUrl ?? undefined,
                openLabel: copy.openRepository,
                retryLabel: copy.retry,
            },
            notice: pageState === "empty" ? copy.empty : pageState === "failed" ? copy.failed : undefined,
            retryLabel: copy.retry,
        }}
        on={{
            openCourse: () => router.push(`/courses/${displayId}/learn`),
            retry: () => { void project.mutate() },
            retryRepository: () => { void repository.mutate() },
            searchRoadmap: setRoadmapQuery,
        }}
    />
}

export { CoursePersonalProjectBase } from "./component"
