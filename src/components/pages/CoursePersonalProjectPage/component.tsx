import { CoursePersonalProject } from "@/components/blocks/learn/CoursePersonalProject"

/** Route identity required by the connected project block. */
export type CoursePersonalProjectPageProps = { readonly displayId: string }

/** Route shell; the connected project block owns the page data and states. */
export const CoursePersonalProjectPageBase = (props: CoursePersonalProjectPageProps) => {
    const { displayId } = props
    return <CoursePersonalProject displayId={displayId} />
}
