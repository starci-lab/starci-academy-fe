"use client"

import { useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { CourseMockInterviewSetupPageBase, type CourseMockInterviewSetupPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseMockInterviewSetupPage = (props: CourseMockInterviewSetupPageProps) => {
    const locale = useLocale()
    const destination = useSearchParams().get("tab")
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId: props.displayId })
    const pendingCourseTitle = props.displayId
        .split("-")
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(" ")
    // The route slug remains useful identity when the course request fails. Humanising it keeps the
    // recovery state course-grounded without leaking a raw implementation identifier into the UI.
    const recoveryCourseTitle = locale === "vi" ? "Khóa học đang mở" : "Current course" // vn-ok: localized recovery identity
    const courseTitle = course.data?.title
        ?? ((course.error !== undefined || course.data === null) ? recoveryCourseTitle : pendingCourseTitle)
    return (
        <CourseMockInterviewSetupPageBase
            {...props}
            courseTitle={courseTitle}
            breadcrumbLabel={locale === "vi" ? "Đường dẫn khóa học" : "Course path"} // vn-ok: localized runtime breadcrumb copy
            mockInterviewLabel={locale === "vi" ? "Phỏng vấn thử" : "Mock interview"} // vn-ok: localized runtime breadcrumb copy
            currentLabel={destination === "history"
                ? (locale === "vi" ? "Lịch sử" : "History") // vn-ok: localized runtime breadcrumb copy
                : destination === "stats"
                    ? (locale === "vi" ? "Thống kê" : "Statistics") // vn-ok: localized runtime breadcrumb copy
                    : (locale === "vi" ? "Chuẩn bị" : "Setup")} // vn-ok: localized runtime breadcrumb copy
            onCourse={() => router.push(`/courses/${props.displayId}/learn`)}
        />
    )
}

/** Ownership metadata for the route entry. */
