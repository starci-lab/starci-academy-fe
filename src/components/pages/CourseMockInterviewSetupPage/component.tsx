import { CourseMockInterviewSetupBlock } from "@/components/blocks/learn/CourseMockInterviewSetupBlock"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Route identity passed to the connected block. */
export type CourseMockInterviewSetupPageProps = { readonly displayId: string }

/** Route shell composed from the connected block. */
export const CourseMockInterviewSetupPageBase = (props: CourseMockInterviewSetupPageProps) => (
    <Tree contract="course-mock-interview-hub-page" render={defineContractComponent("course-mock-interview-hub-page", {
        content: defineContractProjection("mock-interview-hub-content", () => <CourseMockInterviewSetupBlock {...props} />),
    })} />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
