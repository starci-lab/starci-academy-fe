"use client"

import { CourseFlashcardSessionPageBase, type CourseFlashcardSessionPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseFlashcardSessionPage = (props: CourseFlashcardSessionPageProps) => <CourseFlashcardSessionPageBase {...props} />

/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
