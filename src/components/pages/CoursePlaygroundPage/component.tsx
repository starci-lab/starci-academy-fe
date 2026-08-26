import { CoursePlaygroundCatalog } from "@/components/blocks/learn/CoursePlaygroundCatalog"
import { Tree } from "@/components/branches/Tree"
import { Progress } from "@/components/leaves/Progress"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
/** Route identity passed to the connected catalog block. */
export type CoursePlaygroundPageProps = { readonly displayId: string }
/** Playground route shell; catalog query and navigation belong to the connected block. */
export const CoursePlaygroundPageBase = ({ displayId }: CoursePlaygroundPageProps) => <Tree contract="course-playground-page" render={defineContractComponent("course-playground-page", {
    journey: defineLeafComponent("progress", {}, () => <Progress props={{ label: "Playground journey", value: 33 }} />),
    catalog: defineContractProjection("course-playground-catalog", () => <CoursePlaygroundCatalog displayId={displayId} />),
})} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
