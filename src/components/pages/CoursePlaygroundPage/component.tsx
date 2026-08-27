import { CoursePlaygroundCatalog } from "@/components/blocks/learn/CoursePlaygroundCatalog"
import { Progress } from "@/components/leaves/Progress"
/** Route identity passed to the connected catalog block. */
export type CoursePlaygroundPageProps = { readonly displayId: string }
/** Playground route shell; catalog query and navigation belong to the connected block. */
export const CoursePlaygroundPageBase = (props: CoursePlaygroundPageProps) => {
    const { displayId } = props
    return (
        <>
            <Progress props={{ label: "Playground journey", value: 33 }} />
            <CoursePlaygroundCatalog displayId={displayId} />
        </>
    )
}
