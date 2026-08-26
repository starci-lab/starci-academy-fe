import { PlaygroundSetup } from "@/components/blocks/learn/PlaygroundSetup"
import { Tree } from "@/components/branches/Tree"
import { Progress } from "@/components/leaves/Progress"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { PlaygroundSetupBase } from "@/components/blocks/learn/PlaygroundSetup/component"
/** Route identity required by the setup shell. */
export type CoursePlaygroundSetupPageProps = import("@/components/blocks/learn/PlaygroundSetup/component").PlaygroundSetupBaseProps
/** Route-only identity passed to the page shell. */
export type CoursePlaygroundSetupRouteProps = { readonly displayId: string; readonly slug: string }
/** Pure connected-block renderer compatibility export. */
export { PlaygroundSetupBase as CoursePlaygroundSetupPageBase }
/** Page-owned main landmark composed with the connected setup block. */
export const CoursePlaygroundSetupPageShell = ({ displayId, slug }: CoursePlaygroundSetupRouteProps) => <Tree contract="course-playground-setup-page" render={defineContractComponent("course-playground-setup-page", {
    journey: defineLeafComponent("progress", {}, () => <Progress props={{ label: "Playground journey", value: 66 }} />),
    content: defineContractProjection("course-playground-setup-workspace", () => <PlaygroundSetup displayId={displayId} slug={slug} />),
})} />
/** Source-level ownership marker for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
