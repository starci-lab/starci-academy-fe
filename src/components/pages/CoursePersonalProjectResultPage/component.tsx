import { PersonalProjectResult } from "@/components/blocks/learn/PersonalProjectResult"
/** Route identity required by the result page shell. */
export type CoursePersonalProjectResultPageProps = { readonly displayId: string; readonly taskId: string }
/** Result page shell; the connected result block owns result, feedback, and history state. */
export const CoursePersonalProjectResultPageBase = (props: CoursePersonalProjectResultPageProps) => {
    const { displayId, taskId } = props
    return <PersonalProjectResult displayId={displayId} taskId={taskId} />
}
