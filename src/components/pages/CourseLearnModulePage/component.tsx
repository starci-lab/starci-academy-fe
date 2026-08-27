import { CourseLearnModuleBlock } from "@/components/blocks/learn/CourseLearnModuleBlock"

/** Route identity passed to the connected block. */
export type CourseLearnModulePageProps = { readonly displayId: string; readonly moduleId: string }

/** Route shell composed from the connected block. */
export const CourseLearnModulePageBase = (props: CourseLearnModulePageProps) => <CourseLearnModuleBlock {...props} />

/** Ownership metadata for the route shell. */
