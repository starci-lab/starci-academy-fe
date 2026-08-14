"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationsSwr } from "@/hooks/swr/useQueryFoundationsSwr"
import { _CourseFoundationCategoryPage } from "./component"

/** Route identities required by the connected foundation-category page. */
export type CourseFoundationCategoryPageProps = { readonly displayId: string; readonly categoryId: string }

/** Connect a category route to its server-filtered foundation resource list. */
export const CourseFoundationCategoryPage = ({ displayId, categoryId }: CourseFoundationCategoryPageProps) => {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const query = useQueryFoundationsSwr({ categoryId, search })
    const state = query.error !== undefined ? "failed" : query.data === undefined ? "pending" : (query.data?.data.length ?? 0) === 0 ? "empty" : "ready"
    return (
        <_CourseFoundationCategoryPage
            state={state}
            props={{
                title: "Foundation resources",
                search: "Search foundation resources",
                empty: "No matching foundation resources were found.",
                failed: "These foundation resources could not be loaded.",
                retry: "Try again",
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
