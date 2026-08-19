"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationsSwr } from "@/hooks/swr/useQueryFoundationsSwr"
import { CourseFoundationCategoryPageBase } from "./component"

/** Route identities required by the connected foundation-category page. */
export type CourseFoundationCategoryPageProps = { readonly displayId: string; readonly categoryId: string }

/** Connect a category route to its server-filtered foundation resource list. */
export const CourseFoundationCategoryPage = ({ displayId, categoryId }: CourseFoundationCategoryPageProps) => {
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const [search, setSearch] = useState("")
    const query = useQueryFoundationsSwr({ categoryId, search })
    const state = query.error !== undefined ? "failed" : query.data === undefined ? "pending" : (query.data?.data.length ?? 0) === 0 ? "empty" : "ready"
    return (
        <CourseFoundationCategoryPageBase
            state={state}
            props={{
                title: t("resourcesTitle"),
                search: t("resourceSearch"),
                clearSearch: t("clearSearch"),
                empty: t("resourceEmpty"),
                failed: t("resourceFailed"),
                retry: t("retry"),
                foundations: query.data?.data ?? [],
            }}
            on={{
                search: setSearch,
                openResource: (foundationId) => router.push(`/courses/${displayId}/learn/foundations/${categoryId}/${foundationId}`),
                retry: () => { void query.mutate() },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
