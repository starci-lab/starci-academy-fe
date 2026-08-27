"use client"

import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { CourseMockInterviewResultPageBase, type CourseMockInterviewResultPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseMockInterviewResultPage = (props: CourseMockInterviewResultPageProps) => {
    const locale = useLocale()
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId: props.displayId })
    const setupPath = `/courses/${props.displayId}/learn/mock-interview`
    return (
        <CourseMockInterviewResultPageBase
            {...props}
            courseTitle={course.data?.title ?? props.displayId}
            breadcrumbLabel={locale === "vi" ? "Đường dẫn khóa học" : "Course path"} // vn-ok: localized runtime breadcrumb copy
            mockInterviewLabel={locale === "vi" ? "Phỏng vấn thử" : "Mock interview"} // vn-ok: localized runtime breadcrumb copy
            currentLabel={locale === "vi" ? "Kết quả" : "Result"} // vn-ok: localized runtime breadcrumb copy
            onCourse={() => router.push(`/courses/${props.displayId}/learn`)}
            onMockInterview={() => router.push(setupPath)}
        />
    )
}

/** Ownership metadata for the route entry. */
