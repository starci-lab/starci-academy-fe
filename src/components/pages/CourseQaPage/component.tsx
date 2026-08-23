import { CourseQa } from "@/components/blocks/learn/CourseQa"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
/** Route identity passed to the connected QA block. */
export type CourseQaPageProps = { readonly displayId: string }
/** Q&A route shell; the connected block owns question/thread/composer state. */
export const CourseQaPageBase = ({ displayId }: CourseQaPageProps) => <Tree contract="course-qa-page" render={defineContractComponent("course-qa-page", { workspace: defineContractProjection("course-qa-workspace", () => <CourseQa displayId={displayId} />) })} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
