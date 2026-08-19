"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationSwr } from "@/hooks/swr/useQueryFoundationSwr"
import { CourseFoundationResourcePageBase } from "./component"

/** Route identities required by the connected foundation resource reader. */
export type CourseFoundationResourcePageProps = { readonly displayId: string; readonly categoryId: string; readonly foundationId: string }

/** Resolve a route resource identity and connect its follow-on playground action. */
export const CourseFoundationResourcePage = ({ displayId, categoryId, foundationId }: CourseFoundationResourcePageProps) => {
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const query = useQueryFoundationSwr({ displayId: foundationId })
    const state = query.error !== undefined ? "failed" : query.data === undefined ? "pending" : query.data === null ? "not-found" : "ready"
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
