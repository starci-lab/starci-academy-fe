import { CoursesCatalogBlock } from "@/components/blocks/courses/CoursesCatalogBlock"

/** Route has no identity; the connected catalog owns workspace state. */
export type CoursesCatalogPageProps = Record<never, never>

/** Canonical route shell composed from the connected catalog block. */
export const CoursesCatalogPageBase = () => <CoursesCatalogBlock />

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "courses" } as const
