"use client"
import { useTranslations } from "next-intl"
import { CourseLearnChallengeResultPageBase, type CourseLearnChallengeResultPageProps } from "./component"
/** Render the challenge result route shell. */
export const CourseLearnChallengeResultPage = (input: CourseLearnChallengeResultPageProps) => {
    const t = useTranslations("learn.content")
    return <CourseLearnChallengeResultPageBase {...input} resizeLabel={t("resizeRail")} />
}
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
