import { CoursePlaygroundCatalog } from "@/components/blocks/learn/CoursePlaygroundCatalog"
/** Route identity passed to the connected catalog block. */
export type CoursePlaygroundPageProps = { readonly displayId: string }
/** Playground route shell; catalog query and navigation belong to the connected block. */
export const CoursePlaygroundPageBase = (props: CoursePlaygroundPageProps) => {
    const { displayId } = props
    return <CoursePlaygroundCatalog displayId={displayId} />
}
