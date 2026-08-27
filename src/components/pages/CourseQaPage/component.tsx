import { CourseQa } from "@/components/blocks/learn/CourseQa"
/** Route identity passed to the connected QA block. */
export type CourseQaPageProps = { readonly displayId: string }
/** Q&A route shell; the connected block owns question/thread/composer state. */
export const CourseQaPageBase = (props: CourseQaPageProps) => {
    const { displayId } = props
    return <CourseQa displayId={displayId} />
}
