"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryFoundationSwr } from "@/hooks/swr/useQueryFoundationSwr"
import { CourseFoundationResourceBlockBase, type CourseFoundationResourceBlockState } from "./component"
import type { ReactNode } from "react"

/** Route identity for the connected foundation resource block. */
export type CourseFoundationResourceBlockProps = { readonly displayId: string; readonly categoryId: string; readonly foundationId: string; readonly render?: () => ReactNode }
const resourceStateOf = (failed: boolean, pending: boolean, missing: boolean): CourseFoundationResourceBlockState => failed ? "failed" : pending ? "pending" : missing ? "not-found" : "ready"

/** Connect resource query, localization and route actions to the pure block. */

/** Connect resource query, localization and route actions to page-owned inner slots. */
export const CourseFoundationResourceBlock = (props: CourseFoundationResourceBlockProps) => {
    const t = useTranslations("learn.foundations")
    const router = useRouter()
    const query = useQueryFoundationSwr({ displayId: props.foundationId })
    const state = resourceStateOf(query.error !== undefined, query.data === undefined, query.data === null)
    return <CourseFoundationResourceBlockBase blockState={state} data={{ resource: query.data, titleFallback: t("resourceTitleFallback"), notFound: t("resourceNotFound"), failed: t("resourceFailed"), retry: t("retry"), back: t("back"), openPlayground: t("openPlayground") }} on={{ back: () => router.push(`/courses/${props.displayId}/learn/foundations/${props.categoryId}`), retry: () => { void query.mutate() }, openPlayground: () => router.push(`/courses/${props.displayId}/learn/playground`) }} render={props.render} />
}

export { CourseFoundationResourceBlockBase } from "./component"
export { CourseFoundationResourceBlockBack, CourseFoundationResourceBlockHeader, CourseFoundationResourceBlockDescription, CourseFoundationResourceBlockBody, CourseFoundationResourceBlockPractice, CourseFoundationResourceBlockNotice } from "./component"
