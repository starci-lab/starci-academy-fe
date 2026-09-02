"use client"

import { useTranslations } from "next-intl"
import { CourseLearnContentHomeBlockBase } from "./component"
import { useQueryCourseOutlineSwr } from "@/hooks/swr/useQueryCourseOutlineSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useRouter } from "@/i18n/navigation"
import { resolveCourseOutlineTarget } from "@/modules/learn/course-outline"
import type {
    CourseOutline,
    CourseOutlineLesson,
    CourseOutlineModule,
} from "@/modules/api/graphql/queries/types/course-outline"

/** Course identity required by the connected content-home page. */
export interface CourseLearnContentHomeBlockProps { readonly displayId: string }

type LessonStatusLabels = {
    readonly premium: string
    readonly read: string
    readonly unread: string
}

const homeStateOf = (outlinePending: boolean, outlineFailed: boolean, isEmpty: boolean, hasPartialData: boolean) => {
    if (outlinePending) return outlineFailed ? "failed" as const : "pending" as const
    if (isEmpty) return outlineFailed ? "failed" as const : "empty" as const
    return hasPartialData ? "partial" as const : "ready" as const
}

const contentCompletionPercent = (outline: CourseOutline): number => {
    const lessons = outline.progress.lessonsTotal === 0
        ? 1
        : outline.progress.lessonsRead / outline.progress.lessonsTotal
    const challenges = outline.progress.challengesTotal === 0
        ? 1
        : outline.progress.challengesCompleted / outline.progress.challengesTotal
    return Math.round(((lessons + challenges) / 2) * 100)
}

const targetTitle = (outline: CourseOutline): string | undefined => {
    const target = outline.nextContentTask
    if (target === null) return undefined
    for (const module of outline.modules) {
        for (const lesson of module.lessons) {
            if (target.kind === "lesson" && lesson.id === target.id) return lesson.title
            const challenge = lesson.challenges.find((candidate) => candidate.id === target.id)
            if (target.kind === "challenge" && challenge !== undefined) return challenge.title
        }
    }
    return undefined
}

const currentModule = (outline: CourseOutline): CourseOutlineModule | undefined => {
    const target = resolveCourseOutlineTarget(outline, outline.nextContentTask)
    if (target !== null) return outline.modules.find((module) => module.id === target.moduleId)
    return outline.modules.find((module) => module.lessons.some((lesson) => !lesson.isRead)) ?? outline.modules[0]
}

const lessonStatus = (
    lesson: CourseOutlineLesson,
    labels: LessonStatusLabels,
): string => {
    if (lesson.isPremium) return labels.premium
    if (lesson.isRead) return labels.read
    return labels.unread
}

/** Where one lesson lives. Stated once, so the anchor and the press cannot disagree. */
const lessonPath = (displayId: string, moduleId: string, lessonId: string): string =>
    `/courses/${displayId}/learn/content/modules/${moduleId}/contents/${lessonId}`

/** Load course identity and viewer outline, then seat the map beside the legacy overview hierarchy. */
export const CourseLearnContentHomeBlock = (props: CourseLearnContentHomeBlockProps) => {
    const { displayId } = props
    const t = useTranslations("learn.contentHome")
    const contentText = useTranslations("learn.content")
    const router = useRouter()
    const course = useQueryCourseSwr({ displayId })
    const outline = useQueryCourseOutlineSwr(displayId)
    const data = outline.data ?? undefined
    const module = data === undefined ? undefined : currentModule(data)
    const target = data === undefined ? null : resolveCourseOutlineTarget(data, data.nextContentTask)
    const hasFailure = course.error !== undefined || outline.error !== undefined
    const state = homeStateOf(
        outline.data === undefined,
        outline.error !== undefined,
        outline.data === null || outline.data?.modules.length === 0,
        hasFailure || course.data == null,
    )
    const courseTitle = data?.course.title ?? course.data?.title ?? t("title")
    const courseData = course.data ?? undefined
    const totalMinutes = courseData?.modules?.flatMap((item) => item.contents ?? [])
        .reduce((total, lesson) => total + lesson.minutesRead, 0) ?? 0
    const metaFacts = courseData === undefined
        ? []
        : [
            t("moduleCount", { count: courseData.modules?.length ?? 0 }),
            t("studyHours", { hours: Math.max(1, Math.ceil(totalMinutes / 60)) }),
            t("learnerCount", { count: courseData.enrollmentCount }),
        ]
    const retry = () => { void Promise.all([course.mutate(), outline.mutate()]) }
    const resume = () => {
        if (target === null) return
        const base = `/courses/${displayId}/learn/content/modules/${target.moduleId}/contents/${target.lessonId}`
        router.push(target.challengeId === undefined ? base : `${base}/challenges/${target.challengeId}`)
    }

    return (
        <CourseLearnContentHomeBlockBase
            displayId={displayId}
            currentLessonId={target?.lessonId}
            resizeLabel={contentText("resizeRail")}
            blockState={state}
            props={{
                title: courseTitle,
                description: courseData?.description,
                breadcrumbLabel: t("breadcrumbLabel"),
                trail: [
                    { id: "course", label: t("breadcrumbCourse") },
                    { id: "current", label: courseTitle },
                ],
                metaFacts,
                gateMessages: courseData?.isEnrolled === false ? [t("trialNotice")] : [],
                resumeEyebrow: t("resumeEyebrow"),
                resumeTarget: data === undefined
                    ? t("resumeFallback")
                    : targetTitle(data) ?? t("resumeComplete"),
                resumeAction: target === null ? undefined : t("resumeAction"),
                progressLabel: t("progressLabel"),
                completionPercent: data === undefined ? undefined : contentCompletionPercent(data),
                progressFact: data === undefined
                    ? ""
                    : t("progressFact", data.progress),
                currentModule: module === undefined ? undefined : {
                    title: t("currentModule", { module: module.title }),
                    lessons: module.lessons.map((lesson) => ({
                        id: lesson.id,
                        moduleId: module.id,
                        title: lesson.title,
                        fact: t("lessonFact", {
                            minutes: lesson.minutesRead,
                            status: lessonStatus(lesson, {
                                premium: t("lessonPremium"),
                                read: t("lessonRead"),
                                unread: t("lessonUnread"),
                            }),
                        }),
                        isCurrent: lesson.id === target?.lessonId,
                        href: lessonPath(displayId, module.id, lesson.id),
                    })),
                },
                emptyMessage: t("empty"),
                failedMessage: t("failed"),
                retryLabel: t("retry"),
            }}
            on={{
                course: () => router.push(`/courses/${displayId}`),
                resume,
                lesson: (moduleId, lessonId) => router.push(lessonPath(displayId, moduleId, lessonId)),
                retry,
            }}
        />
    )
}

/** Connected ownership metadata for the course content-home route. */
