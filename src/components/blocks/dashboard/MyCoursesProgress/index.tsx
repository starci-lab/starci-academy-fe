"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useQueryMyCoursesSwr, useQueryResolveRouteSwr } from "@/hooks"
import type { MyCourseRow } from "@/modules/api/graphql/queries/types/my-courses"
import type { CourseProgressRowData } from "@/components/composites/CourseProgressRow"
import { _MyCoursesProgress } from "./component"

const percent = (completed: number, total: number) => total <= 0 ? 0 : Math.min(100, Math.max(0, Math.round((completed / total) * 100)))
const overall = (value: number) => Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0

/** The four already-translated dimension names a progress row is labelled with. */
type CourseProgressLabels = {
    readonly content: string
    readonly challenge: string
    readonly milestone: string
    readonly trial: string
}

/** Resolve one full dashboard course payload into its pure row. */
const toRow = (course: MyCourseRow, labels: CourseProgressLabels): CourseProgressRowData => {
    const contentCompleted = course.contentCompleted ?? 0
    const contentTotal = course.contentTotal ?? 0
    const challengeCompleted = course.challengeCompleted ?? 0
    const challengeTotal = course.challengeTotal ?? 0
    const milestoneCompleted = course.completed ?? 0
    const milestoneTotal = course.total ?? 0
    const completion = overall(course.completionPercent)
    return {
        id: course.globalId,
        title: course.label,
        percent: completion,
        percentLabel: `${completion}%`,
        isTrial: course.isEnrolled === false,
        trialLabel: labels.trial,
        dimensions: [
            { id: "content", label: labels.content, completed: contentCompleted, total: contentTotal, percent: percent(contentCompleted, contentTotal), tone: "accent" },
            { id: "challenge", label: labels.challenge, completed: challengeCompleted, total: challengeTotal, percent: percent(challengeCompleted, challengeTotal), tone: "success" },
            { id: "milestone", label: labels.milestone, completed: milestoneCompleted, total: milestoneTotal, percent: percent(milestoneCompleted, milestoneTotal), tone: "warning" },
        ],
    }
}

/** Fetch full course progress and own on-demand route resolution. */
export const MyCoursesProgress = () => {
    const t = useTranslations("courses")
    const locale = useLocale()
    const router = useRouter()
    const query = useQueryMyCoursesSwr()
    const route = useQueryResolveRouteSwr()
    const [pendingId, setPendingId] = useState<string>()
    const retry = () => { void query.mutate() }
    const rows = (query.data ?? []).map((course) => ({
        ...toRow(course, { content: t("progress.content"), challenge: t("progress.challenge"), milestone: t("progress.milestone"), trial: t("trial") }),
        isPending: pendingId === course.globalId,
    }))
    const props = { label: t("heading"), rows, emptyMessage: t("empty"), errorMessage: t("failed"), retryLabel: t("retry") }
    if (query.error !== undefined && query.data === undefined) return <_MyCoursesProgress state="failed" props={props} on={{ retry }} />
    if (query.data === undefined) return <_MyCoursesProgress state="pending" props={props} />
    if (rows.length === 0) return <_MyCoursesProgress state="empty" props={props} on={{ retry }} />
    const on = Object.fromEntries(rows.map((row) => [`open:${row.id}`, async () => {
        setPendingId(row.id)
        try {
            const result = await route.trigger({ globalId: row.id })
            const path = result.data?.resolveRoute?.data?.path
            if (path !== null && path !== undefined) router.push(path.startsWith(`/${locale}/`) ? path : `/${locale}${path}`)
        } finally { setPendingId(undefined) }
    }]))
    return <_MyCoursesProgress state="ready" props={props} on={on} />
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "courses" } as const
