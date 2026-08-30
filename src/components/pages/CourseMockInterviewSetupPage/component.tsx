import { CourseMockInterviewSetupBlock } from "@/components/blocks/learn/CourseMockInterviewSetupBlock"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { mockInterviewBreadcrumbClassName, mockInterviewCompactBreadcrumbClassName, mockInterviewFullBreadcrumbClassName, mockInterviewPageClassName } from "./classNames"

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
    <div className={mockInterviewPageClassName}>
        <div className={mockInterviewBreadcrumbClassName}>
            <div className={mockInterviewCompactBreadcrumbClassName}><Breadcrumbs
                props={{
                    label: props.breadcrumbLabel ?? "Course path",
                    backLabel: props.courseTitle ?? props.displayId,
                    steps: [
                        { id: "course", label: props.courseTitle ?? props.displayId },
                        { id: "mock-interview", label: props.mockInterviewLabel ?? "Mock interview" },
                        { id: "setup", label: props.currentLabel ?? "Setup" },
                    ],
                }}
                on={{ course: props.onCourse }}
            /></div>
            <div className={mockInterviewFullBreadcrumbClassName}><Breadcrumbs
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
            /></div>
        </div>
        <CourseMockInterviewSetupBlock {...props} />
    </div>
)
