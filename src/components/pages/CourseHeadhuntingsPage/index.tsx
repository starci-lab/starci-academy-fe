"use client"

import { CourseHeadhuntingsPageBase, type CourseHeadhuntingsPageProps } from "./component"

/** Connected route entry that supplies only route identity to its shell. */
export const CourseHeadhuntingsPage = (props: CourseHeadhuntingsPageProps) => (
    <CourseHeadhuntingsPageBase {...props} />
)

/** Ownership metadata for the route entry. */
