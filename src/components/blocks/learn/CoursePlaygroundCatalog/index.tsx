"use client"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryPlaygroundsSwr } from "@/hooks/swr/useQueryPlaygroundsSwr"
import { CoursePlaygroundCatalogBase, type CoursePlaygroundPageState } from "./component"
/** Course route identity required by the connected playground catalog. */
export type CoursePlaygroundCatalogProps = { readonly displayId: string }
const playgroundStateOf = (failed: boolean, pending: boolean, empty: boolean): CoursePlaygroundPageState => failed ? "failed" : pending ? "pending" : empty ? "empty" : "ready"
/** Resolve the course primary key, then read its live playground catalog. */
export const CoursePlaygroundCatalog = (props: CoursePlaygroundCatalogProps) => {
    const displayId = props.displayId
    const t = useTranslations("learn.playground"); const router = useRouter(); const course = useQueryCourseSwr({ displayId }); const playgrounds = useQueryPlaygroundsSwr(course.data?.id)
    const pending = (course.data === undefined && course.error === undefined) || (course.data !== null && course.data !== undefined && playgrounds.data === undefined && playgrounds.error === undefined)
    const failed = course.error !== undefined || course.data === null || playgrounds.error !== undefined; const rows = playgrounds.data ?? []
    return <CoursePlaygroundCatalogBase state={playgroundStateOf(failed, pending, rows.length === 0)} props={{ title: t("title"), description: t("description"), stepLabel: t("stepLabel"), emptyText: t("empty"), failedText: t("failed"), retryLabel: t("retry"), playgrounds: rows }} on={{ openSetup: (slug) => router.push(`/courses/${displayId}/learn/playground/${slug}`), retry: () => { void course.mutate(); void playgrounds.mutate() } }} />
}
