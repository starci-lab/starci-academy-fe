"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationSwr } from "@/hooks/swr/useQueryFoundationSwr"
import { CourseFoundationResourcePageBase } from "./component"

/** Route identities required by the connected foundation resource reader. */
export type CourseFoundationResourcePageProps = { readonly displayId: string; readonly categoryId: string; readonly foundationId: string }

const resourceStateOf = (failed: boolean, pending: boolean, missing: boolean) => {
    if (failed) return "failed" as const
    if (pending) return "pending" as const
    if (missing) return "not-found" as const
    return "ready" as const
}

/** Resolve a route resource identity and connect its follow-on playground action. */
export const CourseFoundationResourcePage = ({ displayId, categoryId, foundationId }: CourseFoundationResourcePageProps) => {
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const query = useQueryFoundationSwr({ displayId: foundationId })
    const state = resourceStateOf(query.error !== undefined, query.data === undefined, query.data === null)
    return (
        <CourseFoundationResourcePageBase
            state={state}
            props={{
                resource: query.data,
                titleFallback: t("resourceTitleFallback"),
                notFound: t("resourceNotFound"),
                failed: t("resourceFailed"),
                retry: t("retry"),
                back: t("back"),
                openPlayground: t("openPlayground"),
            }}
            on={{
                back: () => router.push(`/courses/${displayId}/learn/foundations/${categoryId}`),
                retry: () => { void query.mutate() },
                openPlayground: () => router.push(`/courses/${displayId}/learn/playground`),
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
