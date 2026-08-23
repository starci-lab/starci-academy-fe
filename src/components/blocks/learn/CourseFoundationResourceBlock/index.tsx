"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationSwr } from "@/hooks/swr/useQueryFoundationSwr"
import { CourseFoundationResourceBlockBase, type CourseFoundationResourceBlockState } from "./component"
import type { ReactNode } from "react"

/** Route identity for the connected foundation resource block. */
export type CourseFoundationResourceBlockRouteProps = { readonly displayId: string; readonly categoryId: string; readonly foundationId: string }
const resourceStateOf = (failed: boolean, pending: boolean, missing: boolean): CourseFoundationResourceBlockState => failed ? "failed" : pending ? "pending" : missing ? "not-found" : "ready"

/** Connect resource query, localization and route actions to the pure block. */
type CourseFoundationResourceBlockConnectedProps = CourseFoundationResourceBlockRouteProps & { readonly render?: () => ReactNode }

/** Connect resource query, localization and route actions to page-owned inner slots. */
export const CourseFoundationResourceBlock = ({ displayId, categoryId, foundationId, render }: CourseFoundationResourceBlockConnectedProps) => {
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const query = useQueryFoundationSwr({ displayId: foundationId })
    const state = resourceStateOf(query.error !== undefined, query.data === undefined, query.data === null)
    return <CourseFoundationResourceBlockBase blockState={state} data={{ resource: query.data, titleFallback: t("resourceTitleFallback"), notFound: t("resourceNotFound"), failed: t("resourceFailed"), retry: t("retry"), back: t("back"), openPlayground: t("openPlayground") }} on={{ back: () => router.push(`/courses/${displayId}/learn/foundations/${categoryId}`), retry: () => { void query.mutate() }, openPlayground: () => router.push(`/courses/${displayId}/learn/playground`) }} render={render} />
}

export { CourseFoundationResourceBlockBase } from "./component"
export { CourseFoundationResourceBlockBack, CourseFoundationResourceBlockHeader, CourseFoundationResourceBlockDescription, CourseFoundationResourceBlockBody, CourseFoundationResourceBlockPractice, CourseFoundationResourceBlockNotice } from "./component"
export type { CourseFoundationResourceBlockProps } from "./component"
