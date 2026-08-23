import { CourseLearnContentHomeBlock } from "@/components/blocks/learn/CourseLearnContentHomeBlock"

/** Route identity passed to the connected block. */
export type CourseLearnContentHomePageProps = { readonly displayId: string }

/** Route shell composed from the connected block. */
export const CourseLearnContentHomePageBase = (props: CourseLearnContentHomePageProps) => <CourseLearnContentHomeBlock {...props} />

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
