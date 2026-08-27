import { CourseMockInterviewSetupBlock } from "@/components/blocks/learn/CourseMockInterviewSetupBlock"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"

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
    <>
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
        <CourseMockInterviewSetupBlock {...props} />
    </>
)
