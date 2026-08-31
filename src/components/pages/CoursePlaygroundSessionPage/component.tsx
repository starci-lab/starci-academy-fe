import { PlaygroundSession } from "@/components/blocks/learn/PlaygroundSession"
import { PlaygroundSessionBase } from "@/components/blocks/learn/PlaygroundSession/component"
/** Route identity required by the session shell. */
export type CoursePlaygroundSessionBlockProps = import("@/components/blocks/learn/PlaygroundSession/component").PlaygroundSessionProps
/** Route-only identity passed to the page shell. */
export type CoursePlaygroundSessionPageShellProps = { readonly displayId: string; readonly slug: string }
/** Pure connected-block renderer compatibility export. */
export { PlaygroundSessionBase as CoursePlaygroundSessionPageBase }
/** Page-owned main landmark composed with the connected session block. */
export const CoursePlaygroundSessionPageShell = (props: CoursePlaygroundSessionPageShellProps) => {
    const { displayId, slug } = props
    return <PlaygroundSession displayId={displayId} slug={slug} />
}
