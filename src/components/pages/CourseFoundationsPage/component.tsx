import { CourseFoundationsBlock } from "@/components/blocks/learn/CourseFoundationsBlock"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Route identity passed to the connected foundations block. */
export type CourseFoundationsPageProps = { readonly displayId: string }

/** Route shell composed from the connected foundations block. */
export const CourseFoundationsPageBase = ({ displayId }: CourseFoundationsPageProps) => (
    <Tree
        contract="course-foundations-page"
        render={defineContractComponent("course-foundations-page", {
            workspace: defineContractProjection("course-foundations-workspace", () => (
                <CourseFoundationsBlock displayId={displayId} />
            )),
        })}
    />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
