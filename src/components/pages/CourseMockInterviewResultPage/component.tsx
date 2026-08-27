import { CourseMockInterviewResultBlock } from "@/components/blocks/learn/CourseMockInterviewResultBlock"
import { Tree } from "@/components/branches/Tree"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Route identity passed to the connected block. */
export type CourseMockInterviewResultPageProps = {
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
export const CourseMockInterviewResultPageBase = (props: CourseMockInterviewResultPageProps) => (
    <Tree contract="course-mock-interview-result-route-page" render={defineContractComponent("course-mock-interview-result-route-page", {
        breadcrumb: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    label: props.breadcrumbLabel ?? "Course path",
                    showFullTrail: true,
                    steps: [
                        { id: "course", label: props.courseTitle ?? props.displayId },
                        { id: "mock-interview", label: props.mockInterviewLabel ?? "Mock interview" },
                        { id: "result", label: props.currentLabel ?? "Result" },
                    ],
                }}
                on={{ course: props.onCourse, "mock-interview": props.onMockInterview }}
            />
        )),
        content: defineContractProjection("course-mock-interview-result-page", () => <CourseMockInterviewResultBlock {...props} />),
    })} />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
