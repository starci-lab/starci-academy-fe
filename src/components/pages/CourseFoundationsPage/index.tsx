"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationCategoriesSwr } from "@/hooks/swr/useQueryFoundationCategoriesSwr"
import { _CourseFoundationsPage } from "./component"

/** Route identity required by the connected foundations hub. */
export type CourseFoundationsPageProps = { readonly displayId: string }

/** Connect the foundations hub route to the localized server category catalog. */
export const CourseFoundationsPage = ({ displayId }: CourseFoundationsPageProps) => {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const query = useQueryFoundationCategoriesSwr({ search })
    const state = query.error !== undefined
        ? "failed"
        : query.data === undefined
            ? "pending"
            : (query.data?.data.length ?? 0) === 0 ? "empty" : "ready"
    return (
        <_CourseFoundationsPage
            state={state}
            props={{
                title: "Foundations",
                description: "Build durable concepts before applying them in the playground.",
                empty: "No foundation categories are available yet.",
                failed: "The foundation catalog could not be loaded.",
                retry: "Try again",
                search: "Search foundation categories",
                categories: query.data?.data ?? [],
            }}
            on={{
                openCategory: (categoryId) => router.push(`/courses/${displayId}/learn/foundations/${categoryId}`),
                search: setSearch,
                retry: () => { void query.mutate() },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
