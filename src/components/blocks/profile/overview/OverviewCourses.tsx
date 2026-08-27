"use client"

import { useTranslations } from "next-intl"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { number, text } from "./shared"

type Course = {
  readonly globalId: string;
  readonly label: string;
  readonly contentCompleted: number;
  readonly contentTotal: number;
  readonly challengeCompleted: number;
  readonly challengeTotal: number;
  readonly completed: number;
  readonly total: number;
};

/** Joined course rows retain content/challenge qualifiers instead of flattening them into generic activity. */
/** Props for the connected courses overview block. */
export type OverviewCoursesProps = Record<never, never>
/** Load and render courses in the profile overview. */
export const OverviewCourses = (props: OverviewCoursesProps) => {
    void props
    const t = useTranslations("profile")
    const request = useOverviewEvidence<ReadonlyArray<Course>>("courses")
    const resting: ReadonlyArray<Course> = Array.from(
        { length: 2 },
        (_, index) => ({
            globalId: `resting-${index}`,
            label: "",
            contentCompleted: 0,
            contentTotal: 0,
            challengeCompleted: 0,
            challengeTotal: 0,
            completed: 0,
            total: 0,
        }),
    )
    const courses = request.isLoading ? resting : (request.data ?? [])
    const message = request.error
        ? t("evidence.error")
        : t("evidence.courses.empty")
    return (
        <SurfaceCard props={{ label: t("evidence.courses.label") }}>
            {(courses.length > 0
                ? courses
                : [{ ...resting[0], globalId: "state", label: message }]
            ).map((course) => (
                <EvidenceRow
                    key={course.globalId}
                    isLoading={request.isLoading}
                    props={{
                        title: text(course.label),
                        subtitle:
              request.isLoading || course.globalId === "state"
                  ? undefined
                  : `${number(course.contentCompleted)}/${number(course.contentTotal)} content · ${number(course.challengeCompleted)}/${number(course.challengeTotal)} challenges`,
                        fact:
              request.isLoading || course.globalId === "state"
                  ? undefined
                  : `${number(course.completed)}/${number(course.total)}`,
                    }}
                />
            ))}
        </SurfaceCard>
    )
}
