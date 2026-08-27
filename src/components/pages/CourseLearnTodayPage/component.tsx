import { CourseLearnTodayBlock } from "@/components/blocks/learn/CourseLearnTodayBlock"

/** Route identity passed to the connected block. */
export type CourseLearnTodayPageProps = { readonly displayId: string }

/** Route shell composed from the connected block. */
export const CourseLearnTodayPageBase = (props: CourseLearnTodayPageProps) => <CourseLearnTodayBlock {...props} />

/** Ownership metadata for the route shell. */
