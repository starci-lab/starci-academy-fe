import { CourseMockInterviewSessionBlock } from "@/components/blocks/learn/CourseMockInterviewSessionBlock"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Route identity passed to the connected block. */
export type CourseMockInterviewSessionPageProps = { readonly displayId: string; readonly sessionId: string }

/** Route shell composed from the connected block. */
export const CourseMockInterviewSessionPageBase = (props: CourseMockInterviewSessionPageProps) => (
    <Tree
        contract="course-mock-interview-session-page"
        render={defineContractComponent("course-mock-interview-session-page", {
            content: defineContractProjection("mock-interview-session-content", () => (
                <CourseMockInterviewSessionBlock {...props} />
            )),
        })}
    />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
