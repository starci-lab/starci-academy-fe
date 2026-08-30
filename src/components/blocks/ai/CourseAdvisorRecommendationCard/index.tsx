"use client"

import { useLocale, useTranslations } from "next-intl"
import { useQueryCourseSwr } from "@/hooks"
import type { CourseAdvisorRecommendation } from "@/modules/ai/course-advisor-response"
import { CourseAdvisorRecommendationCardBase } from "./component"

/** Connected owner input before platform course facts are hydrated. */
export type CourseAdvisorRecommendationCardProps = { readonly recommendation: CourseAdvisorRecommendation }

/** Hydrate platform-owned identity and enrollment state before drawing the recommendation CTA. */
export const CourseAdvisorRecommendationCard = (props: CourseAdvisorRecommendationCardProps) => {
    const recommendation = props.recommendation
    const t = useTranslations("globalAi.recommendation")
    const locale = useLocale()
    const query = useQueryCourseSwr({ displayId: recommendation.courseDisplayId })
    const enrolled = query.data?.isEnrolled === true
    const localePrefix = locale.toLowerCase().startsWith("vi") ? "vi" : "en"
    const href = enrolled
        ? `/${localePrefix}/courses/${recommendation.courseDisplayId}/learn/content`
        : `/${localePrefix}/courses/${recommendation.courseDisplayId}`
    const actionLabel = enrolled ? t("continueCourse") : t("openCourse")
    return (
        <CourseAdvisorRecommendationCardBase
            props={{
                ...recommendation,
                title: query.data?.title,
                isEnrolled: query.data?.isEnrolled,
                labels: {
                    aiAssessment: t("aiAssessment"),
                    whyFit: t("whyFit"),
                    confidence: t(`confidence.${recommendation.confidence}`),
                    fitGap: t("fitGap"),
                    courseAction: t("courseAction"),
                    enrolled: t("enrolled"),
                    available: t("available"),
                    openCourse: t("openCourse"),
                    continueCourse: t("continueCourse"),
                },
            }}
            isLoading={query.isLoading}
            action={{ href, label: actionLabel }}
        />
    )
}

export * from "./component"
