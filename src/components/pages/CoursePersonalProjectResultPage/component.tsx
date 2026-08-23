import { PersonalProjectResult } from "@/components/blocks/learn/PersonalProjectResult"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
/** Route identity required by the result page shell. */
export type CoursePersonalProjectResultPageProps = { readonly displayId: string; readonly taskId: string }
/** Result page shell; the connected result block owns result, feedback, and history state. */
export const CoursePersonalProjectResultPageBase = ({ displayId, taskId }: CoursePersonalProjectResultPageProps) => <Tree contract="course-personal-project-result-page" render={defineContractComponent("course-personal-project-result-page", { workspace: defineContractProjection("personal-project-result-workspace", () => <PersonalProjectResult displayId={displayId} taskId={taskId} />) })} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
