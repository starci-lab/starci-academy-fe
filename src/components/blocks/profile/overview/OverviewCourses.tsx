"use client"

import { useLocale, useTranslations } from "next-intl"
import { getPathname } from "@/i18n/navigation"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { SurfaceListCard } from "@starci/grammar/common"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Badge } from "@starci/grammar/common"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { clamp, number, text } from "./shared"
import {
    profileCourseHeadingClassName,
    profileCourseIdentityClassName,
    profileCoursePressableClassName,
    profileCourseQualifierClassName,
    profileCourseRowClassName,
    profileEvidenceListClassName,
    overviewCourseCoverClassName,
} from "./classNames"

type Course = {
  readonly globalId: string;
  readonly path: string;
  readonly label: string;
  readonly thumbnailUrl?: string | null;
  readonly contentCompleted: number;
  readonly contentTotal: number;
  readonly challengeCompleted: number;
  readonly challengeTotal: number;
  readonly completed: number;
  readonly total: number;
  readonly completionPercent: number;
  readonly isEnrolled: boolean;
};

/** Joined course rows retain content/challenge qualifiers instead of flattening them into generic activity. */
/** Props for the connected courses overview block. */
export type OverviewCoursesProps = Record<never, never>
/** Load and render courses in the profile overview. */
export const OverviewCourses = (props: OverviewCoursesProps) => {
    void props
    const t = useTranslations("profile")
    const courseT = useTranslations("courses")
    const locale = useLocale()
    const request = useOverviewEvidence<ReadonlyArray<Course>>("courses")
    const resting: ReadonlyArray<Course> = Array.from(
        { length: 2 },
        (_, index) => ({
            globalId: `resting-${index}`,
            path: "",
            label: "",
            thumbnailUrl: null,
            contentCompleted: 0,
            contentTotal: 0,
            challengeCompleted: 0,
            challengeTotal: 0,
            completed: 0,
            total: 0,
            completionPercent: 0,
            isEnrolled: true,
        }),
    )
    const courses = request.isLoading ? resting : (request.data ?? [])
    const message = request.error
        ? t("evidence.error")
        : t("evidence.courses.empty")
    const hasCourses = courses.length > 0
    return (
        <SurfaceListCard label={t("evidence.courses.label")} isLoading={request.isLoading}>
            <div className={profileEvidenceListClassName}>
                {(hasCourses
                    ? courses
                    : [{ ...resting[0], globalId: "state", label: message }]
                ).map((course) => course.globalId === "state" ? (
                    <EvidenceRow key={course.globalId} props={{ title: text(course.label) }} />
                ) : (
                    <div className={profileCoursePressableClassName} key={course.globalId}>
                        <PressableSurface
                            href={request.isLoading ? undefined : getPathname({ locale, href: course.path })}
                            label={text(course.label) ?? courseT("heading")}
                            disabled={request.isLoading}
                            hover="label"
                        >
                            <div className={profileCourseRowClassName}>
                                <IconTile source={iconSourceFor("course", "leading")} artwork={course.thumbnailUrl ? <img src={course.thumbnailUrl} alt="" className={overviewCourseCoverClassName} /> : undefined} tone={"accent"} size={"md"} isSkeleton={request.isLoading} />
                                <div className={profileCourseIdentityClassName}>
                                    <div className={profileCourseHeadingClassName}>
                                        <Text size={"sm"} weight={"semibold"} isSkeleton={request.isLoading}>{text(course.label)}</Text>
                                        {request.isLoading ? null : <Badge>{`${clamp(course.completionPercent)}%`}</Badge>}
                                    </div>
                                    {request.isLoading ? null : <div className={profileCourseQualifierClassName}><Text size={"xs"} tone={"muted"}>{`${courseT("progress.content")} ${number(course.contentCompleted)}/${number(course.contentTotal)} · ${courseT("progress.challenge")} ${number(course.challengeCompleted)}/${number(course.challengeTotal)}`}</Text></div>}
                                    <Progress label={courseT("catalog.progressAria", { title: text(course.label) ?? "" })} value={clamp(course.completionPercent)} isSkeleton={request.isLoading} />
                                </div>
                            </div>
                        </PressableSurface>
                    </div>
                ))}
            </div>
        </SurfaceListCard>
    )
}
