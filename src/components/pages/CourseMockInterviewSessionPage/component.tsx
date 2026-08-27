import { CourseMockInterviewSessionBlock } from "@/components/blocks/learn/CourseMockInterviewSessionBlock"
import { Tree } from "@/components/branches/Tree"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Route identity passed to the connected block. */
export type CourseMockInterviewSessionPageProps = {
    readonly displayId: string
    readonly sessionId: string
    readonly courseTitle?: string
    readonly breadcrumbLabel?: string
    readonly mockInterviewLabel?: string
    readonly currentLabel?: string
    readonly onCourse?: () => void
    readonly onMockInterview?: () => void
}

/** Route shell composed from the connected block. */
export const CourseMockInterviewSessionPageBase = (props: CourseMockInterviewSessionPageProps) => (
    <Tree
        contract="course-mock-interview-session-page"
        render={defineContractComponent("course-mock-interview-session-page", {
            breadcrumb: defineLeafComponent("breadcrumbs", {}, () => (
                <Breadcrumbs
                    props={{
                        label: props.breadcrumbLabel ?? "Course path",
                        showFullTrail: true,
                        steps: [
                            { id: "course", label: props.courseTitle ?? props.displayId },
                            { id: "mock-interview", label: props.mockInterviewLabel ?? "Mock interview" },
                            { id: "session", label: props.currentLabel ?? "Interview" },
                        ],
                    }}
                    on={{ course: props.onCourse, "mock-interview": props.onMockInterview }}
                />
            )),
            content: defineContractProjection("mock-interview-session-content", () => (
                <CourseMockInterviewSessionBlock {...props} />
            )),
        })}
    />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
