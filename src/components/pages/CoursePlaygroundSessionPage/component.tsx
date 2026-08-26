import { PlaygroundSession } from "@/components/blocks/learn/PlaygroundSession"
import { Tree } from "@/components/branches/Tree"
import { Progress } from "@/components/leaves/Progress"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { PlaygroundSessionBase } from "@/components/blocks/learn/PlaygroundSession/component"
/** Route identity required by the session shell. */
export type CoursePlaygroundSessionPageProps = import("@/components/blocks/learn/PlaygroundSession/component").PlaygroundSessionBaseProps
/** Route-only identity passed to the page shell. */
export type CoursePlaygroundSessionRouteProps = { readonly displayId: string; readonly slug: string }
/** Pure connected-block renderer compatibility export. */
export { PlaygroundSessionBase as CoursePlaygroundSessionPageBase }
/** Page-owned main landmark composed with the connected session block. */
export const CoursePlaygroundSessionPageShell = ({ displayId, slug }: CoursePlaygroundSessionRouteProps) => <Tree contract="course-playground-session-page" render={defineContractComponent("course-playground-session-page", {
    journey: defineLeafComponent("progress", {}, () => <Progress props={{ label: "Playground journey", value: 100 }} />),
    content: defineContractProjection("course-playground-session-workspace", () => <PlaygroundSession displayId={displayId} slug={slug} />),
})} />
/** Source-level ownership marker for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
