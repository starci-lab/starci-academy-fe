"use client"

import { useLocale, useTranslations } from "next-intl"
import { withoutLocale } from "@/modules/utils/localised-path"
import { useRouter } from "@/i18n/navigation"
import {
    useQueryMyCoursesSwr,
    useQueryMyInProgressChallengesSwr,
    useQueryMyLearnedLessonsSwr,
} from "@/hooks"
import { queryResolveRoute } from "@/modules/api/graphql/queries/query-resolve-route"
import type { MyResumeRefRow } from "@/modules/api/graphql/queries/types/my-resume"
import { ContinueLearningBase, type ResumeItem } from "./component"

const MAX_ITEMS = 3
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
            router.push(withoutLocale(path, locale))
        })()
    }

    const onBrowse = () => {
        router.push("/courses")
    }

    const notice = { label, actionLabel: t("continueLearning.browse") }

    if (lessons.error !== undefined || challenges.error !== undefined) {
        return (
            <ContinueLearningBase
                state="failed"
                props={{ ...notice, message: t("continueLearning.failed") }}
                on={{ act: onBrowse }}
            />
        )
    }

    if (lessons.data === undefined || challenges.data === undefined) {
        return <ContinueLearningBase state="pending" props={{ label }} />
    }

    // The API calls this entity a lesson; StarCi Academy calls it content in every reader-facing
    // surface. Translate that vocabulary here before resolved copy crosses into the pure half.
    const toItem = (kind: "content" | "challenge") => (row: MyResumeRefRow): ResumeItem => ({
        id: row.globalId,
        title: row.label,
        kindLabel: t(`continueLearning.kind.${kind}`),
    })

    const merged = [
        ...lessons.data.map(toItem("content")),
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
            <ContinueLearningBase
                state="ready"
                props={{ label, items, resumeLabel: t("continueLearning.resume") }}
                on={{ resume: onResume }}
            />
        )
    }

    if (courses.data === undefined && courses.error === undefined) {
        return <ContinueLearningBase state="pending" props={{ label }} />
    }

    const hasNoCourses = courses.data !== undefined && courses.data !== null && courses.data.length === 0
    return (
        <ContinueLearningBase
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
