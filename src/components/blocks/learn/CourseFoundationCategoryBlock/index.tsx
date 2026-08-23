"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationsSwr } from "@/hooks/swr/useQueryFoundationsSwr"
import { CourseFoundationCategoryBlockBase, type CourseFoundationCategoryBlockState } from "./component"
import type { ReactNode } from "react"

/** Route identity for a connected foundation category block. */
export type CourseFoundationCategoryBlockRouteProps = { readonly displayId: string; readonly categoryId: string }
const categoryStateOf = (failed: boolean, pending: boolean, empty: boolean): CourseFoundationCategoryBlockState => failed ? "failed" : pending ? "pending" : empty ? "empty" : "ready"

/** Connect category query, local search and navigation actions to the pure block. */
type CourseFoundationCategoryBlockConnectedProps = CourseFoundationCategoryBlockRouteProps & { readonly render?: () => ReactNode }

/** Connect the category query and route actions, then provide them to page-owned inner slots. */
export const CourseFoundationCategoryBlock = ({ displayId, categoryId, render }: CourseFoundationCategoryBlockConnectedProps) => {
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const [search, setSearch] = useState("")
    const query = useQueryFoundationsSwr({ categoryId, search })
    const state = categoryStateOf(query.error !== undefined, query.data === undefined, (query.data?.data.length ?? 0) === 0)
    return <CourseFoundationCategoryBlockBase
        blockState={state}
        data={{ search: t("resourceSearch"), clearSearch: t("clearSearch"), empty: t("resourceEmpty"), failed: t("resourceFailed"), retry: t("retry"), foundations: query.data?.data ?? [] }}
        on={{ search: setSearch, openResource: (foundationId) => router.push(`/courses/${displayId}/learn/foundations/${categoryId}/${foundationId}`), retry: () => { void query.mutate() } }}
        render={render}
    />
}

export { CourseFoundationCategoryBlockBase } from "./component"
export { CourseFoundationCategoryBlockSearch, CourseFoundationCategoryBlockResults } from "./component"
export type { CourseFoundationCategoryBlockProps } from "./component"
