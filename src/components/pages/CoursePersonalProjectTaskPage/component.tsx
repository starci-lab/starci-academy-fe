import { PersonalProjectTask } from "@/components/blocks/learn/PersonalProjectTask"
import {
    PersonalProjectTaskBase,
    type PersonalProjectTaskBaseProps,
    type PersonalProjectTaskLabels,
    type PersonalProjectTaskState,
} from "@/components/blocks/learn/PersonalProjectTask/component"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Route identity required by the task workspace shell. */
export type CoursePersonalProjectTaskPageProps = { readonly displayId: string; readonly taskId: string }

/** Page-owned main landmark; all task query, mutation and local state stays in the connected block. */
export const CoursePersonalProjectTaskPageBase = ({ displayId, taskId }: CoursePersonalProjectTaskPageProps) => (
    <Tree contract="course-personal-project-task-page" render={defineContractComponent("course-personal-project-task-page", {
        content: defineContractProjection("personal-project-task-content", () => <PersonalProjectTask displayId={displayId} taskId={taskId} />),
    })} />
)

/** Compatibility export for existing pure renderer tests; implementation ownership is the block. */
export { PersonalProjectTaskBase }
export type {
    PersonalProjectTaskBaseProps as CoursePersonalProjectTaskPagePropsForBase,
    PersonalProjectTaskLabels as CoursePersonalProjectTaskPageLabels,
    PersonalProjectTaskState as CoursePersonalProjectTaskPageState,
}

/** Source-level ownership marker for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
