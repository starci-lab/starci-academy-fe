"use client"

import { CourseFlashcardsQuizPageBase, type CourseFlashcardsQuizPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseFlashcardsQuizPage = (props: CourseFlashcardsQuizPageProps) => <CourseFlashcardsQuizPageBase {...props} />

/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
