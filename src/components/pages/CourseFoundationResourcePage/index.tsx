"use client"

import { CourseFoundationResourcePageBase } from "./component"

/** Route identities required by the resource page composition. */
export type CourseFoundationResourcePageProps = { readonly displayId: string; readonly categoryId: string; readonly foundationId: string }

/** Compose the connected resource block for the route. */
export const CourseFoundationResourcePage = (props: CourseFoundationResourcePageProps) => <CourseFoundationResourcePageBase {...props} />
