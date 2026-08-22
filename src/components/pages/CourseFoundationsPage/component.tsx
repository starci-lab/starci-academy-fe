import { CourseFoundationsBlock } from "@/components/blocks/learn/CourseFoundationsBlock"

/** Route identity passed to the connected foundations block. */
export type CourseFoundationsPageProps = { readonly displayId: string }

/** Route shell composed from the connected foundations block. */
export const CourseFoundationsPageBase = ({ displayId }: CourseFoundationsPageProps) => <CourseFoundationsBlock displayId={displayId} />

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
