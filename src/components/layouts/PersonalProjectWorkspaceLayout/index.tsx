"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { PersonalProjectWorkspaceLayoutBase } from "./component"

/** Course identity and routed surface accepted by the segment shell. */
export type PersonalProjectWorkspaceLayoutProps = {
    readonly displayId: string
    readonly surface: ReactNode
}

/** Resolves the persistent milestone rail and navigates between its task routes. */
export const PersonalProjectWorkspaceLayout = (input: PersonalProjectWorkspaceLayoutProps) => {
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()
    const [query, setQuery] = useState("")
    const project = useQueryCoursePersonalProjectSwr(input.displayId)
    const routeTaskId = pathname.match(/\/personal-project\/tasks\/([^/]+)/)?.[1]
    const currentTaskId = routeTaskId
        ?? (project.data?.currentTask?.kind === "milestoneTask" ? project.data.currentTask.id : undefined)
    const milestones = (project.data?.milestones ?? [])
        .slice()
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .flatMap((milestone) => {
            const currentTask = milestone.tasks.find((task) => task.id === currentTaskId)
            const destination = currentTask ?? milestone.tasks[0]
            return destination === undefined ? [] : [{
                id: destination.id,
                label: milestone.title,
                fact: `${milestone.tasks.filter((task) => task.completed).length}/${milestone.tasks.length}`,
                isCurrent: currentTask !== undefined,
            }]
        })
    const visibleMilestones = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase(locale)
        return normalized === "" ? milestones : milestones.filter((milestone) => (
            milestone.label.toLocaleLowerCase(locale).includes(normalized)
        ))
    }, [locale, milestones, query])
    const copy = locale === "vi"
        ? {
            title: "Tiến độ", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
            search: "Tìm task...", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
            searchLabel: "Tìm milestone", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
            clear: "Xóa tìm kiếm", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
            resize: "Thay đổi độ rộng mục lục dự án", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
            fact: "nhiệm vụ", // vn-ok: Vietnamese runtime copy while shared message catalogs are frozen.
        }
        : { title: "Progress", search: "Search tasks...", searchLabel: "Search milestones", clear: "Clear search", resize: "Resize project outline", fact: "tasks" }
    return (
        <PersonalProjectWorkspaceLayoutBase
            milestones={visibleMilestones}
            surface={input.surface}
            progress={{
                label: copy.title,
                value: project.data?.progress?.completionPercent,
                fact: `${project.data?.progress?.tasksCompleted ?? 0}/${project.data?.progress?.tasksTotal ?? 0} ${copy.fact}`,
            }}
            search={{ placeholder: copy.search, label: copy.searchLabel, clearLabel: copy.clear }}
            resizeLabel={copy.resize}
            onTask={(taskId) => router.push(`/courses/${input.displayId}/learn/personal-project/tasks/${taskId}`)}
            onSearch={setQuery}
            isLoading={project.data === undefined && project.error === undefined}
        />
    )
}

/** Architectural identity for the connected personal-project layout twin. */
export const meta = { world: "connected", domain: "learn" } as const
