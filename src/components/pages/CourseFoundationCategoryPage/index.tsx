"use client"

import { useTranslations } from "next-intl"
import { CourseFoundationCategoryPageBase } from "./component"

/** Route identities required by the category page composition. */
export type CourseFoundationCategoryPageProps = { readonly displayId: string; readonly categoryId: string }

/** Compose the connected category block for the route. */
export const CourseFoundationCategoryPage = (props: CourseFoundationCategoryPageProps) => {
    const t = useTranslations("learn.foundations")
    return <CourseFoundationCategoryPageBase {...props} title={t("resourcesTitle")} />
}
