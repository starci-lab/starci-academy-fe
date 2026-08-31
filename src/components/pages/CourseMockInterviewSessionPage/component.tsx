import { CourseMockInterviewSessionBlock } from "@/components/blocks/learn/CourseMockInterviewSessionBlock"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { mockInterviewSessionBodyClassName, mockInterviewSessionBreadcrumbClassName, mockInterviewSessionPageClassName } from "./classNames"

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
    <div className={mockInterviewSessionPageClassName}>
        <div className={mockInterviewSessionBreadcrumbClassName}><Breadcrumbs
            props={{
                label: props.breadcrumbLabel ?? "Course path",
                showFullTrail: false,
                backLabel: props.mockInterviewLabel ?? "Mock interview",
                steps: [
                    { id: "course", label: props.courseTitle ?? props.displayId },
                    { id: "mock-interview", label: props.mockInterviewLabel ?? "Mock interview" },
                    { id: "session", label: props.currentLabel ?? "Interview" },
                ],
            }}
            on={{ course: props.onCourse, "mock-interview": props.onMockInterview }}
        /></div>
        <div className={mockInterviewSessionBodyClassName}><CourseMockInterviewSessionBlock {...props} /></div>
    </div>
)
