"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import {
    useQueryMyCoursesSwr,
    useQueryMyInProgressChallengesSwr,
    useQueryMyLearnedLessonsSwr,
} from "@/hooks"
import { queryResolveRoute } from "@/modules/api/graphql/queries/query-resolve-route"
import type { MyResumeRefRow } from "@/modules/api/graphql/queries/types/my-resume"
import { _ContinueLearning, type ResumeItem } from "./component"

const MAX_ITEMS = 4
const MAX_CHALLENGES = 1

/** Resolve the learner's latest work into the frameless resume-card section. */
export const ContinueLearning = () => {
    const t = useTranslations("dashboard")
    const locale = useLocale()
    const router = useRouter()
    const lessons = useQueryMyLearnedLessonsSwr()
    const challenges = useQueryMyInProgressChallengesSwr()
    const courses = useQueryMyCoursesSwr()
    const label = t("continueLearning.heading")

    const onResume = (id: string) => {
        void (async () => {
            const answer = await queryResolveRoute({ request: { globalId: id } })
            const path = answer.data?.resolveRoute?.data?.path
            if (path === undefined || path === null) return
            router.push(`/${locale}${path}`)
        })()
    }

    const onBrowse = () => {
        router.push("/courses")
    }

    const notice = { label, actionLabel: t("continueLearning.browse") }

    if (lessons.error !== undefined || challenges.error !== undefined) {
        return (
            <_ContinueLearning
                state="failed"
                props={{ ...notice, message: t("continueLearning.failed") }}
                on={{ act: onBrowse }}
            />
        )
    }

    if (lessons.data === undefined || challenges.data === undefined) {
        return <_ContinueLearning state="pending" props={{ label }} />
    }

    const toItem = (kind: "lesson" | "challenge") => (row: MyResumeRefRow): ResumeItem => ({
        id: row.globalId,
        title: row.label,
        kindLabel: t(`continueLearning.kind.${kind}`),
        icon: kind === "lesson" ? "course" : "practice",
    })

    const merged = [
        ...lessons.data.map(toItem("lesson")),
        ...challenges.data.slice(0, MAX_CHALLENGES).map(toItem("challenge")),
    ]
    const seen = new Set<string>()
    const items: Array<ResumeItem> = []
    for (const item of merged) {
        if (seen.has(item.id) || items.length === MAX_ITEMS) continue
        seen.add(item.id)
        items.push(item)
    }

    if (items.length > 0) {
        return (
            <_ContinueLearning
                state="ready"
                props={{ label, items, resumeLabel: t("continueLearning.resume") }}
                on={{ resume: onResume }}
            />
        )
    }

    const hasNoCourses = courses.data !== undefined && courses.data !== null && courses.data.length === 0
    return (
        <_ContinueLearning
            state={hasNoCourses ? "onboarding" : "empty"}
            props={{
                ...notice,
                message: hasNoCourses ? t("continueLearning.onboarding") : t("continueLearning.empty"),
            }}
            on={{ act: onBrowse }}
        />
    )
}

/** Source-level world marker for the connected dashboard block. */
export const meta = { world: "connected", domain: "dashboard" } as const
