import { CourseMockInterviewSetupBlock } from "@/components/blocks/learn/CourseMockInterviewSetupBlock"
import { Tree } from "@/components/branches/Tree"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Route identity passed to the connected block. */
export type CourseMockInterviewSetupPageProps = {
    readonly displayId: string
    readonly courseTitle?: string
    readonly breadcrumbLabel?: string
    readonly mockInterviewLabel?: string
    readonly currentLabel?: string
    readonly onCourse?: () => void
}

/** Route shell composed from the connected block. */
export const CourseMockInterviewSetupPageBase = (props: CourseMockInterviewSetupPageProps) => (
    <Tree contract="course-mock-interview-hub-page" render={defineContractComponent("course-mock-interview-hub-page", {
        breadcrumb: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    label: props.breadcrumbLabel ?? "Course path",
                    showFullTrail: true,
                    steps: [
                        { id: "course", label: props.courseTitle ?? props.displayId },
                        { id: "mock-interview", label: props.mockInterviewLabel ?? "Mock interview" },
                        { id: "setup", label: props.currentLabel ?? "Setup" },
                    ],
                }}
                on={{ course: props.onCourse }}
            />
        )),
        content: defineContractProjection("mock-interview-hub-content", () => <CourseMockInterviewSetupBlock {...props} />),
    })} />
)

/** Ownership metadata for the route shell. */
export const meta = { world: "pure", domain: "learn" } as const
