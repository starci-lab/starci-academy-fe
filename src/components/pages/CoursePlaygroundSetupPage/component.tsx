import { PlaygroundSetup } from "@/components/blocks/learn/PlaygroundSetup"
import { Progress } from "@/components/leaves/Progress"
import { PlaygroundSetupBase } from "@/components/blocks/learn/PlaygroundSetup/component"
/** Route identity required by the setup shell. */
/** Route-only identity passed to the page shell. */
export type CoursePlaygroundSetupPageProps = { readonly displayId: string; readonly slug: string }
/** Pure connected-block renderer compatibility export. */
export { PlaygroundSetupBase as CoursePlaygroundSetupPageBase }
/** Page-owned main landmark composed with the connected setup block. */
export const CoursePlaygroundSetupPageShell = (props: CoursePlaygroundSetupPageProps) => {
    const { displayId, slug } = props
    return (
        <>
            <Progress props={{ label: "Playground journey", value: 66 }} />
            <PlaygroundSetup displayId={displayId} slug={slug} />
        </>
    )
}
