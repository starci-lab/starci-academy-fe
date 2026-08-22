"use client"

import { CourseFoundationsPageBase } from "./component"

/** Route identity required by the connected foundations hub. */
export type CourseFoundationsPageProps = { readonly displayId: string }

/** Connect the foundations hub route to the localized server category catalog. */
export const CourseFoundationsPage = ({ displayId }: CourseFoundationsPageProps) => {
    return (
        <CourseFoundationsPageBase displayId={displayId} />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
