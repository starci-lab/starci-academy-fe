"use client"
import { useTranslations } from "next-intl"
import { CourseLearnChallengeResultPageBase, type CourseLearnChallengeResultPageProps } from "./component"
/** Render the challenge result route shell. */
export const CourseLearnChallengeResultPage = (props: CourseLearnChallengeResultPageProps) => {
    const t = useTranslations("learn.content")
    return <CourseLearnChallengeResultPageBase {...props} resizeLabel={t("resizeRail")} />
}
export * from "./component"
