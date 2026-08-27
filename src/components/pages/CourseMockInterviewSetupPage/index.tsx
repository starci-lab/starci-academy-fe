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
    return (
        <CourseMockInterviewSetupPageBase
            {...props}
            courseTitle={course.data?.title ?? props.displayId}
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
export const meta = { world: "connected", domain: "learn" } as const
