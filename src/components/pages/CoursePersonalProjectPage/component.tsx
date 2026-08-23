import { CoursePersonalProject } from "@/components/blocks/learn/CoursePersonalProject"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Route identity required by the connected project block. */
export type CoursePersonalProjectPageProps = { readonly displayId: string }

/** Route shell; the connected project block owns the page contract's data and states. */
export const CoursePersonalProjectPageBase = ({ displayId }: CoursePersonalProjectPageProps) => <Tree contract="course-personal-project-page" render={defineContractComponent("course-personal-project-page", {
    content: defineContractProjection("course-personal-project-block", () => <CoursePersonalProject displayId={displayId} />),
})} />

/** Source-level ownership marker for the pure route shell. */
export const meta = { world: "pure", domain: "learn" } as const
