"use client"

import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryPlaygroundsSwr } from "@/hooks/swr/useQueryPlaygroundsSwr"
import { _CoursePlaygroundPage, type CoursePlaygroundPageState } from "./component"

/** Course route identity required by the connected playground catalog. */
export type CoursePlaygroundPageProps = { readonly displayId: string }

/** Resolve the course primary key, then read its live playground catalog. */
export const CoursePlaygroundPage = ({ displayId }: CoursePlaygroundPageProps) => {
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
                title: "Playground",
                description: "Practice on your own machine with each step verified live.",
                stepLabel: "guided steps",
                emptyText: "This course has no playgrounds yet.",
                failedText: "The playground catalog could not be loaded.",
                retryLabel: "Try again",
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
