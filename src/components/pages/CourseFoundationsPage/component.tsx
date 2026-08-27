import { CourseFoundationsBlock } from "@/components/blocks/learn/CourseFoundationsBlock"

/** Route identity passed to the connected foundations block. */
export type CourseFoundationsPageProps = { readonly displayId: string }

/** Route shell composed from the connected foundations block. */
export const CourseFoundationsPageBase = (props: CourseFoundationsPageProps) => {
    const { displayId } = props
    return <CourseFoundationsBlock displayId={displayId} />
}
