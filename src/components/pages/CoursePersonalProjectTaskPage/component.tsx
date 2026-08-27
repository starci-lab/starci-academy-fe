import { PersonalProjectTask } from "@/components/blocks/learn/PersonalProjectTask"

/** Route identity required by the task workspace shell. */
export type CoursePersonalProjectTaskPageProps = { readonly displayId: string; readonly taskId: string }

/** Page-owned main landmark; all task query, mutation and local state stays in the connected block. */
export const CoursePersonalProjectTaskPageBase = (props: CoursePersonalProjectTaskPageProps) => {
    const { displayId, taskId } = props
    return (
        <PersonalProjectTask displayId={displayId} taskId={taskId} />
    )
}
