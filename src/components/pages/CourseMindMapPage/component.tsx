import { CourseMindMapBlock } from "@/components/blocks/learn/CourseMindMap"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
/** Route identity passed to the connected graph block. */
export type CourseMindMapRouteProps = { readonly displayId: string }
/** Route shell; the connected graph block owns query, search, selection and navigation. */
export const CourseMindMapPageBase = ({ displayId }: CourseMindMapRouteProps) => <Tree contract="course-mind-map-page" render={defineContractComponent("course-mind-map-page", { workspace: defineContractProjection("course-mind-map-workspace", () => <CourseMindMapBlock displayId={displayId} />) })} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
