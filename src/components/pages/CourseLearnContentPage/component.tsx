import { CourseLearnContentBlock } from "@/components/blocks/learn/CourseLearnContentBlock"

/** Route identity passed to the connected block. */
export type CourseLearnContentPageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string }

/** Route shell composed from the connected block. */
export const CourseLearnContentPageBase = (props: CourseLearnContentPageProps) => <CourseLearnContentBlock {...props} />

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
