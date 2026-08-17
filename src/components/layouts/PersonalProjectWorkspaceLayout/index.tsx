"use client"

import type { ReactNode } from "react"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { _PersonalProjectWorkspaceLayout } from "./component"

/** Course identity and routed surface accepted by the segment shell. */
export type PersonalProjectWorkspaceLayoutProps = {
    readonly displayId: string
    readonly surface: ReactNode
}

/** Resolves the persistent milestone rail and navigates between its task routes. */
export const PersonalProjectWorkspaceLayout = (input: PersonalProjectWorkspaceLayoutProps) => {
    const pathname = usePathname()
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(input.displayId)
    const routeTaskId = pathname.match(/\/personal-project\/tasks\/([^/]+)/)?.[1]
    const currentTaskId = routeTaskId
        ?? (project.data?.currentTask?.kind === "milestoneTask" ? project.data.currentTask.id : undefined)
    const milestones = (project.data?.milestones ?? [])
        .slice()
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .flatMap((milestone) => milestone.tasks.map((task) => ({
            id: task.id,
            label: `${milestone.title} · ${task.title}`,
            isCurrent: task.id === currentTaskId,
        })))
    return (
        <_PersonalProjectWorkspaceLayout
            milestones={milestones}
            surface={input.surface}
            onTask={(taskId) => router.push(`/courses/${input.displayId}/learn/personal-project/tasks/${taskId}`)}
            isLoading={project.data === undefined && project.error === undefined}
        />
    )
}

/** Architectural identity for the connected personal-project layout twin. */
export const meta = { world: "connected", domain: "learn" } as const
