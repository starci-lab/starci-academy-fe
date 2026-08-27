"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseOutlineSwr } from "@/hooks/swr/useQueryCourseOutlineSwr"
import { filterCourseOutlineModules } from "@/modules/learn/course-outline"
import { CourseContentMapBase } from "./component"

/** Route identity and optional active lesson for the connected course map. */
export type CourseContentMapProps = {
    readonly displayId: string
    readonly currentLessonId?: string
}

/** Load, filter and route one viewer-specific course map. */
export const CourseContentMap = (props: CourseContentMapProps) => {
    const { displayId, currentLessonId } = props
    const t = useTranslations("learn")
    const router = useRouter()
    const outline = useQueryCourseOutlineSwr(displayId)
    const [isMounted, setIsMounted] = useState(false)
    const [query, setQuery] = useState("")
    const [expandedModuleIds, setExpandedModuleIds] = useState<ReadonlySet<string>>(new Set())
    // SWR can already contain a browser-only cached outline while SSR necessarily
    // renders the pending map. Keep the first client render on the same pending
    // pending shape, then adopt live data after hydration; otherwise HeroUI's empty
    // ListBox template is reconciled against populated rows and React replaces
    // the entire course-map tree.
    const hydratedOutline = isMounted ? outline.data : undefined
    const modules = hydratedOutline === undefined || hydratedOutline === null
        ? []
        : filterCourseOutlineModules(hydratedOutline.modules, query)
    const lessonRoutes = new Map(
        modules.flatMap((module) => module.lessons.map((lesson) => [lesson.id, {
            moduleId: module.id,
            lessonId: lesson.id,
        }] as const)),
    )
    const hasFailure = isMounted && outline.error !== undefined
    const state = hydratedOutline === undefined
        ? hasFailure ? "failed" : "pending"
        : hydratedOutline === null || modules.length === 0
            ? "empty"
            : hasFailure ? "partial" : "ready"
    const activeModuleId = hydratedOutline?.modules.find((module) => (
        module.lessons.some((lesson) => lesson.id === currentLessonId)
    ))?.id

    useEffect(() => setIsMounted(true), [])

    useEffect(() => {
        if (activeModuleId === undefined) return
        setExpandedModuleIds((current) => new Set([...current, activeModuleId]))
    }, [activeModuleId])

    const onSearch = (nextQuery: string) => {
        setQuery(nextQuery)
        if (outline.data === undefined || outline.data === null) return
        const matches = filterCourseOutlineModules(outline.data.modules, nextQuery)
        setExpandedModuleIds(nextQuery.trim() === ""
            ? new Set(activeModuleId === undefined ? [] : [activeModuleId])
            : new Set(matches.map((module) => module.id)))
    }

    const onToggleModule = (moduleId: string, isOpen: boolean) => {
        setExpandedModuleIds((current) => {
            const next = new Set(current)
            if (isOpen) next.add(moduleId)
            else next.delete(moduleId)
            return next
        })
    }

    return (
        <CourseContentMapBase
            state={state}
            props={{
                labels: {
                    progress: t("today.progressLabel"),
                    searchPlaceholder: t("content.searchPlaceholder"),
                    searchLabel: t("content.searchLabel"),
                    searchClearLabel: t("content.searchClearLabel"),
                    failed: t("content.failedMessage"),
                },
                completionPercent: hydratedOutline?.progress.completionPercent,
                progressFact: hydratedOutline === undefined || hydratedOutline === null
                    ? undefined
                    : `${hydratedOutline.progress.lessonsRead}/${hydratedOutline.progress.lessonsTotal}`,
                modules: modules.map((module) => {
                    const sourceModule = hydratedOutline?.modules.find((candidate) => candidate.id === module.id) ?? module
                    const completed = sourceModule.lessons.filter((lesson) => lesson.isRead).length
                    const total = sourceModule.lessons.length
                    return {
                        id: module.id,
                        title: module.title,
                        countLabel: t("content.moduleProgress", { completed, total }),
                        progressLabel: t("content.moduleProgressLabel", { module: module.title }),
                        completionPercent: total === 0 ? 0 : Math.round(completed / total * 100),
                        isOpen: expandedModuleIds.has(module.id),
                        lessons: module.lessons.map((lesson) => ({
                            id: lesson.id,
                            title: lesson.title,
                            meta: t("content.minutes", { minutes: lesson.minutesRead }),
                            isComplete: lesson.isRead,
                            isCurrent: lesson.id === currentLessonId,
                        })),
                    }
                }),
            }}
            on={{
                search: onSearch,
                toggleModule: onToggleModule,
                openLesson: (lessonId) => {
                    const route = lessonRoutes.get(lessonId)
                    if (route === undefined) return
                    router.push(`/courses/${displayId}/learn/content/modules/${route.moduleId}/contents/${route.lessonId}`)
                },
            }}
        />
    )
}

export * from "./component"
