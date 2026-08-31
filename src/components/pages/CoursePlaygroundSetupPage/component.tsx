import { PlaygroundSetup } from "@/components/blocks/learn/PlaygroundSetup"
import { PlaygroundSetupBase } from "@/components/blocks/learn/PlaygroundSetup/component"
/** Route identity required by the setup shell. */
/** Route-only identity passed to the page shell. */
export type CoursePlaygroundSetupPageShellProps = { readonly displayId: string; readonly slug: string }
/** Pure connected-block renderer compatibility export. */
export { PlaygroundSetupBase as CoursePlaygroundSetupPageBase }
/** Page-owned main landmark composed with the connected setup block. */
export const CoursePlaygroundSetupPageShell = (props: CoursePlaygroundSetupPageShellProps) => {
    const { displayId, slug } = props
    return <PlaygroundSetup displayId={displayId} slug={slug} />
}
