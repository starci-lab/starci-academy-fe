"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryGlobalLeaderboardSwr } from "@/hooks/swr/useQueryGlobalLeaderboardSwr"
import { useQueryMyCoursesSwr } from "@/hooks/swr/useQueryMyCoursesSwr"
import { LearnSpineBase } from "./component"
import type { IconName } from "@/components/leaves/Icon"

/** Course route identity required by the connected navigation spine. */
export type LearnSpineProps = { readonly displayId: string; readonly presentation?: "rail" | "drawer"; readonly onNavigate?: () => void }

type SpineRoute = { readonly id: string; readonly icon: IconName; readonly at: string; readonly requiresEnrollment?: boolean }
const GROUPS: ReadonlyArray<{ id: string; rows: ReadonlyArray<SpineRoute> }> = [
    { id: "path", rows: [{ id: "content", icon: "course", at: "/learn/content" }, { id: "personalProject", icon: "practice", at: "/learn/personal-project", requiresEnrollment: true }] },
    { id: "practice", rows: [{ id: "flashcards", icon: "review", at: "/learn/flashcards" }, { id: "mockInterview", icon: "mockInterview", at: "/learn/mock-interview", requiresEnrollment: true }, { id: "foundations", icon: "foundations", at: "/learn/foundations" }, { id: "playground", icon: "playground", at: "/learn/playground" }] },
    { id: "track", rows: [{ id: "mindMap", icon: "mindMap", at: "/learn/mind-map" }, { id: "leaderboard", icon: "league", at: "/learn/leaderboard" }, { id: "qa", icon: "community", at: "/learn/qa" }] },
]
const LEARN_RAIL_COLLAPSED_KEY = "starci.learn.sidebar.collapsed"

/** Connected owner for course navigation data, collapse state and route actions. */
export const LearnSpine = ({ displayId, presentation = "rail", onNavigate }: LearnSpineProps) => {
    const t = useTranslations("learn.shell")
    const pathname = usePathname()
    const router = useRouter()
    const base = `/courses/${displayId}`
    const course = useQueryCourseSwr({ displayId })
    const enrolledCourses = useQueryMyCoursesSwr()
    const leaderboard = useQueryGlobalLeaderboardSwr()
    const [isCollapsed, setIsCollapsed] = useState(false)
    useEffect(() => {
        if (typeof window.localStorage.getItem === "function") setIsCollapsed(window.localStorage.getItem(LEARN_RAIL_COLLAPSED_KEY) === "true")
    }, [])
    const enrolledCourse = enrolledCourses.data?.find((candidate) => candidate.globalId === course.data?.id)
    const enrollmentKnown = course.data !== undefined
    const viewerRank = leaderboard.data?.myRank
    const groups = useMemo(() => GROUPS.map((group) => ({
        id: group.id,
        label: t(`groups.${group.id}`),
        rows: group.rows.map((row) => ({
            id: row.id,
            label: t(`rows.${row.id}`),
            icon: row.icon,
            isCurrent: pathname.startsWith(`${base}${row.at}`),
            isLocked: row.requiresEnrollment === true && enrollmentKnown && course.data?.isEnrolled !== true,
            fact: row.id === "leaderboard" && viewerRank !== null && viewerRank !== undefined ? `#${viewerRank}` : undefined,
        })),
    })), [t, pathname, base, enrollmentKnown, course.data?.isEnrolled, viewerRank])
    const props = {
        lockedLabel: t("locked"), collapseLabel: t("collapse"), expandLabel: t("expand"), isCollapsed,
        home: { id: "home", label: t("rows.home"), icon: "viewGrid" as const, isCurrent: pathname === `${base}/learn` },
        groups,
        ...(enrolledCourse === undefined ? {} : { resume: { label: t("resume"), title: enrolledCourse.label, percent: enrolledCourse.completionPercent, percentText: t("progress", { percent: enrolledCourse.completionPercent }) } }),
    }
    const on = {
        openRow: (id: string) => {
            if (id === "home") { router.push(`${base}/learn`); onNavigate?.(); return }
            const row = GROUPS.flatMap((group) => group.rows).find((candidate) => candidate.id === id)
            if (row !== undefined) { router.push(`${base}${row.at}`); onNavigate?.() }
        },
        resume: () => { router.push(`${base}/learn/content`); onNavigate?.() },
        toggleCollapse: () => setIsCollapsed((current) => { const next = !current; if (typeof window.localStorage.setItem === "function") window.localStorage.setItem(LEARN_RAIL_COLLAPSED_KEY, String(next)); return next }),
    }
    return <LearnSpineBase isCollapsed={isCollapsed} presentation={presentation} props={props} on={on} />
}

export * from "./component"

/** Source-level ownership marker for the connected navigation block. */
export const meta = { world: "connected", domain: "learn" } as const
