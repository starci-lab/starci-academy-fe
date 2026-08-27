"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import type { PersonalProjectMilestone } from "@/modules/api/graphql/queries/types/course-personal-project"
import { PersonalProjectContentMapBase } from "./component"

const filterProjectMilestones = (
    milestones: ReadonlyArray<PersonalProjectMilestone>,
    query: string,
): ReadonlyArray<PersonalProjectMilestone> => {
    const normalized = query.trim().toLocaleLowerCase()
    if (normalized === "") return milestones

    return milestones.flatMap((milestone) => {
        if (milestone.title.toLocaleLowerCase().includes(normalized)) return [milestone]
        const tasks = milestone.tasks.filter((task) => task.title.toLocaleLowerCase().includes(normalized))
        return tasks.length === 0 ? [] : [{ ...milestone, tasks }]
    })
}

/** Own the roadmap query, local filtering and task routing for the project rail. */
/** Props for the connected personal-project content map. */
export type PersonalProjectContentMapProps = Record<never, never>
/** Own the roadmap query, local filtering and task routing for the project rail. */
export const PersonalProjectContentMap = (props: PersonalProjectContentMapProps) => {
    void props
    const { displayId } = useParams<{ readonly displayId: string }>()
    const t = useTranslations("learn.project")
    const pathname = usePathname()
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const [query, setQuery] = useState("")
    const [expandedMilestoneIds, setExpandedMilestoneIds] = useState<ReadonlySet<string>>(new Set())
    const ordered = (project.data?.milestones ?? []).slice().sort((left, right) => left.orderIndex - right.orderIndex)
    const milestones = filterProjectMilestones(ordered, query)
    const routeTaskId = pathname.match(/\/personal-project\/tasks\/([^/]+)/)?.[1]
    const currentTaskId = routeTaskId
        ?? (project.data?.currentTask?.kind === "milestoneTask" ? project.data.currentTask.id : undefined)
    const hasFailure = project.error !== undefined
    const state = project.data === undefined
        ? hasFailure ? "failed" : "pending"
        : project.data === null || milestones.length === 0
            ? "empty"
            : hasFailure ? "partial" : "ready"
    const activeMilestoneId = ordered.find((milestone) => (
        milestone.tasks.some((task) => task.id === currentTaskId)
    ))?.id

    useEffect(() => {
        if (activeMilestoneId === undefined) return
        setExpandedMilestoneIds((current) => new Set([...current, activeMilestoneId]))
    }, [activeMilestoneId])

    const onSearch = (nextQuery: string) => {
        setQuery(nextQuery)
        const matches = filterProjectMilestones(ordered, nextQuery)
        setExpandedMilestoneIds(nextQuery.trim() === ""
            ? new Set(activeMilestoneId === undefined ? [] : [activeMilestoneId])
            : new Set(matches.map((milestone) => milestone.id)))
    }

    const onToggleMilestone = (milestoneId: string, isOpen: boolean) => {
        setExpandedMilestoneIds((current) => {
            const next = new Set(current)
            if (isOpen) next.add(milestoneId)
            else next.delete(milestoneId)
            return next
        })
    }

    return (
        <PersonalProjectContentMapBase
            state={state}
            props={{
                labels: {
                    progress: t("progressLabel"),
                    searchPlaceholder: t("searchPlaceholder"),
                    searchLabel: t("searchLabel"),
                    searchClearLabel: t("searchClearLabel"),
                    failed: t("failedMessage"),
                },
                completionPercent: project.data?.progress.completionPercent,
                progressFact: project.data === undefined || project.data === null
                    ? undefined
                    : `${project.data.progress.tasksCompleted}/${project.data.progress.tasksTotal}`,
                modules: milestones.map((milestone) => {
                    const sourceMilestone = ordered.find((candidate) => candidate.id === milestone.id) ?? milestone
                    const completed = sourceMilestone.tasks.filter((task) => task.completed).length
                    const total = sourceMilestone.tasks.length
                    return {
                        id: milestone.id,
                        title: milestone.title,
                        countLabel: t("milestoneProgress", { completed, total }),
                        progressLabel: t("milestoneProgressLabel", { milestone: milestone.title }),
                        completionPercent: total === 0 ? 0 : Math.round(completed / total * 100),
                        isOpen: expandedMilestoneIds.has(milestone.id),
                        lessons: milestone.tasks.map((task) => ({
                            id: task.id,
                            title: task.title,
                            meta: task.numAttempts === 0
                                ? t("taskWorth", { maximum: task.maxScore })
                                : t("taskScore", { score: task.lastScore, maximum: task.maxScore }),
                            isComplete: task.completed,
                            isCurrent: task.id === currentTaskId,
                        })),
                    }
                }),
            }}
            on={{
                search: onSearch,
                toggleModule: onToggleMilestone,
                openLesson: (taskId) => router.push(
                    `/courses/${displayId}/learn/personal-project/tasks/${taskId}`,
                ),
            }}
        />
    )
}

export * from "./component"
