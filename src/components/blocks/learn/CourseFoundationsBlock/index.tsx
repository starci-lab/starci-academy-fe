"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationCategoriesSwr } from "@/hooks/swr/useQueryFoundationCategoriesSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { CourseFoundationsBlockBase } from "./component"
export type { CourseFoundationsBlockProps } from "./component"
type CourseFoundationsBlockRouteProps = { readonly displayId: string }

/** Connected foundations catalog owner. */
export const CourseFoundationsBlock = ({ displayId }: CourseFoundationsBlockRouteProps) => {
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const query = useQueryFoundationCategoriesSwr({ search, pageNumber: page, limit: pageSize })
    const blockState = query.error !== undefined ? "failed" : query.data === undefined ? "pending" : (query.data?.data.length ?? 0) === 0 ? "empty" : query.isValidating ? "partial" : "ready"
    return <CourseFoundationsBlockBase state={blockState} props={{ title: t("title"), description: t("description"), empty: t("empty"), failed: t("failed"), retry: t("retry"), search: t("search"), clearSearch: t("clearSearch"), count: t("count", { count: query.data?.totalCount ?? 0 }), open: t("openCategory"), pager: t("pager"), previous: t("previousPage"), next: t("nextPage"), page, totalPages: Math.max(1, Math.ceil((query.data?.totalCount ?? 0) / pageSize)), trialMessage: course.data?.isEnrolled === false ? t("trialDescription") : undefined, trialAction: course.data?.isEnrolled === false ? t("trialAction") : undefined, categories: (query.data?.data ?? []).map((category) => ({ id: category.id, title: category.title, description: category.description, thumbnailUrl: category.thumbnailUrl })) }} on={{ openCategory: (id) => router.push(`/courses/${displayId}/learn/foundations/${id}`), search: (value) => { setPage(1); setSearch(value) }, page: setPage, enroll: () => router.push(`/courses/${displayId}`), retry: () => { void query.mutate() } }} />
}
