"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryPlaygroundsSwr } from "@/hooks/swr/useQueryPlaygroundsSwr"
import { _CoursePlaygroundPage, type CoursePlaygroundPageState } from "./component"

/** Course route identity required by the connected playground catalog. */
export type CoursePlaygroundPageProps = { readonly displayId: string }

/** Resolve the course primary key, then read its live playground catalog. */
export const CoursePlaygroundPage = ({ displayId }: CoursePlaygroundPageProps) => {
    const t = useTranslations("learn.playground")
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const playgrounds = useQueryPlaygroundsSwr(course.data?.id)
    const pending = (course.data === undefined && course.error === undefined)
        || (course.data !== null && course.data !== undefined && playgrounds.data === undefined && playgrounds.error === undefined)
    const failed = course.error !== undefined || course.data === null || playgrounds.error !== undefined
    const rows = playgrounds.data ?? []
    const state: CoursePlaygroundPageState = failed ? "failed" : pending ? "pending" : rows.length === 0 ? "empty" : "ready"

    return (
        <_CoursePlaygroundPage
            state={state}
            props={{
                title: t("title"),
                description: t("description"),
                stepLabel: t("stepLabel"),
                emptyText: t("empty"),
                failedText: t("failed"),
                retryLabel: t("retry"),
                playgrounds: rows,
            }}
            on={{
                openSetup: (slug) => router.push(`/courses/${displayId}/learn/playground/${slug}`),
                retry: () => {
                    void course.mutate()
                    void playgrounds.mutate()
                },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
