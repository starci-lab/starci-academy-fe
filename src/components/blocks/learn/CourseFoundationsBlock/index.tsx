"use client"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationCategoriesSwr } from "@/hooks/swr/useQueryFoundationCategoriesSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { CourseFoundationsBlockBase, type FoundationCategoryLayout } from "./component"
export type { CourseFoundationsBlockProps as CourseFoundationsProps } from "./component"
type CourseFoundationsBlockRoute = { readonly displayId: string }
/** Route props for the connected foundations catalog. */
export type CourseFoundationsBlockProps = CourseFoundationsBlockRoute
const VIEW_STORAGE_KEY = "starci.foundations.view"

/** Connected foundations catalog owner. */
export const CourseFoundationsBlock = (props: CourseFoundationsBlockProps) => {
    const { displayId } = props
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [layout, setLayout] = useState<FoundationCategoryLayout>("grid")
    const pageSize = 10
    const query = useQueryFoundationCategoriesSwr({ search, pageNumber: page, limit: pageSize })

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(VIEW_STORAGE_KEY)
            if (saved === "grid" || saved === "line") setLayout(saved)
        } catch {
            // Storage is an enhancement; the catalog remains usable when the browser declines it.
        }
    }, [])

    const changeLayout = (next: FoundationCategoryLayout) => {
        setLayout(next)
        try {
            window.localStorage.setItem(VIEW_STORAGE_KEY, next)
        } catch {
            // Keep the selected layout for this visit even when persistence is unavailable.
        }
    }
    const blockState = query.error !== undefined || query.data === null
        ? "failed"
        : query.data === undefined
            ? "pending"
            : query.data.data.length === 0
                ? "empty"
                : query.isValidating
                    ? "partial"
                    : "ready"
    return <CourseFoundationsBlockBase state={blockState} props={{ title: t("title"), description: t("description"), empty: search.trim() === "" ? t("empty") : t("filteredEmpty"), failed: t("failed"), retry: t("retry"), search: t("search"), clearSearch: t("clearSearch"), count: t("count", { count: query.data?.totalCount ?? 0 }), open: t("openCategory"), pager: t("pager"), previous: t("previousPage"), next: t("nextPage"), resultsTitle: t("resultsTitle"), resultsDescription: t("resultsDescription"), layoutLabel: t("layoutLabel"), gridLabel: t("gridLabel"), lineLabel: t("lineLabel"), activeGrid: t("activeGrid"), activeLine: t("activeLine"), layout, page, totalPages: Math.max(1, Math.ceil((query.data?.totalCount ?? 0) / pageSize)), trialMessage: course.data?.isEnrolled === false ? t("trialDescription") : undefined, trialAction: course.data?.isEnrolled === false ? t("trialAction") : undefined, categories: (query.data?.data ?? []).map((category) => ({ id: category.id, title: category.title, description: category.description, thumbnailUrl: category.thumbnailUrl })) }} on={{ openCategory: (id) => router.push(`/courses/${displayId}/learn/foundations/${id}`), search: (value) => { setPage(1); setSearch(value) }, changeLayout, page: setPage, enroll: () => router.push(`/courses/${displayId}`), retry: () => { void query.mutate() } }} />
}
