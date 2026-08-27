"use client"
import { useTranslations } from "next-intl"
import { CourseLearnChallengePageBase, type CourseLearnChallengePageProps } from "./component"
/** Connected challenge route entry. */
export const CourseLearnChallengePage = (props: CourseLearnChallengePageProps) => {
    const t = useTranslations("learn.content")
    return <CourseLearnChallengePageBase {...props} resizeLabel={t("resizeRail")} />
}
/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
