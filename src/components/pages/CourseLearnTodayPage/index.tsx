"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMyCoursesSwr } from "@/hooks/swr/useQueryMyCoursesSwr"
import { useQueryMyLearnedLessonsSwr } from "@/hooks/swr/useQueryMyLearnedLessonsSwr"
import { useQueryMyInProgressChallengesSwr } from "@/hooks/swr/useQueryMyInProgressChallengesSwr"
import { useQueryFlashcardDecksByCourseSwr } from "@/hooks/swr/useQueryFlashcardDecksByCourseSwr"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryMyInProgressMockInterviewSessionSwr } from "@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr"
import { useQueryResolveRouteSwr } from "@/hooks/swr/useQueryResolveRouteSwr"
import { useLearnMobileView } from "@/components/layouts/LearnShellLayout"
import { _CourseLearnTodayPage, type CourseLearnTodayItem } from "./component"

/** Route identity required by the connected Today page. */
export type CourseLearnTodayPageProps = { readonly displayId: string }

/** Rank live learning facts into the approved Today composition. */
export const CourseLearnTodayPage = ({ displayId }: CourseLearnTodayPageProps) => {
    const t = useTranslations("learn.today")
    const router = useRouter()
    const mobile = useLearnMobileView()
    const course = useQueryCourseSwr({ displayId })
    const myCourses = useQueryMyCoursesSwr()
    const lessons = useQueryMyLearnedLessonsSwr()
    const challenges = useQueryMyInProgressChallengesSwr()
    const decks = useQueryFlashcardDecksByCourseSwr(course.data?.id)
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const interview = useQueryMyInProgressMockInterviewSessionSwr(course.data?.id)
    const route = useQueryResolveRouteSwr()
    const base = "/courses/" + displayId + "/learn"

    const enrolledCourse = myCourses.data?.find((candidate) => candidate.globalId === course.data?.id)
    const activeInterview = interview.data !== null
        && interview.data !== undefined
        && Date.parse(interview.data.deadlineAt) > Date.now()
        ? interview.data
        : undefined

    const primary: CourseLearnTodayItem = activeInterview !== undefined
        ? {
            id: "interview-resume",
            title: activeInterview.promptTitle,
            kind: t("kinds.interview"),
            actionLabel: t("resume"),
        }
        : challenges.data?.[0] !== undefined
            ? {
                id: "resolve:" + challenges.data[0].globalId,
                title: challenges.data[0].label,
                kind: t("kinds.challenge"),
                actionLabel: t("resume"),
            }
            : lessons.data?.[0] !== undefined
                ? {
                    id: "resolve:" + lessons.data[0].globalId,
                    title: lessons.data[0].label,
                    kind: t("kinds.lesson"),
                    actionLabel: t("resume"),
                }
                : {
                    id: "modules",
                    title: course.data?.title ?? t("modules"),
                    kind: t("kinds.course"),
                    actionLabel: t("open"),
                }

    const dueCount = decks.data?.reduce((total, deck) => total + (deck.dueCount ?? 0), 0) ?? 0
    const secondary: Array<CourseLearnTodayItem> = []
    if (dueCount > 0) {
        secondary.push({
            id: "flashcards",
            title: t("dueTitle", { count: dueCount }),
            kind: t("kinds.flashcards"),
            actionLabel: t("review"),
        })
    }
    if (project.data?.currentTask !== null && project.data?.currentTask !== undefined) {
        secondary.push({
            id: "project:" + project.data.currentTask.id,
            title: t("projectTitle"),
            kind: t("kinds.project"),
            actionLabel: t("continue"),
        })
    }
    if (activeInterview === undefined) {
        secondary.push({
            id: "interview-setup",
            title: t("interviewTitle"),
            kind: t("kinds.interview"),
            actionLabel: t("prepare"),
        })
    }

    const pending = course.data === undefined || myCourses.data === undefined
    const failed = (course.error !== undefined && course.data === undefined)
        || (myCourses.error !== undefined && myCourses.data === undefined)
    const state = failed ? "failed" as const
        : pending ? "pending" as const
            : course.data === null ? "empty" as const
                : "ready" as const
    const view = mobile.view === "course" || mobile.view === "progress" ? mobile.view : "today"

    const open = async (id: string) => {
        if (id.startsWith("resolve:")) {
            const result = await route.trigger({ globalId: id.slice("resolve:".length) })
            const path = result.data?.resolveRoute?.data?.path
            if (path !== null && path !== undefined) router.push(path)
            return
        }
        if (id === "interview-resume" && activeInterview !== undefined) {
            router.push(base + "/mock-interview/interview/" + activeInterview.sessionId)
            return
        }
        if (id.startsWith("project:")) {
            router.push(base + "/personal-project/tasks/" + id.slice("project:".length))
            return
        }
        const paths: Record<string, string> = {
            modules: base + "/content",
            flashcards: base + "/flashcards/review",
            "interview-setup": base + "/mock-interview",
        }
        const path = paths[id]
        if (path !== undefined) router.push(path)
    }

    return (
        <_CourseLearnTodayPage
            state={state}
            mobileView={view}
            props={{
                title: t("title"),
                subtitle: t("subtitle", { course: course.data?.title ?? "" }),
                primaryLabel: t("primaryLabel"),
                secondaryLabel: t("secondaryLabel"),
                courseLabel: t("courseLabel"),
                progressLabel: t("progressLabel"),
                progressFact: t("progressFact", { percent: enrolledCourse?.completionPercent ?? 0 }),
                progressValue: enrolledCourse?.completionPercent,
                primary,
                secondary,
                course: {
                    id: "modules",
                    title: course.data?.title ?? t("modules"),
                    kind: t("kinds.course"),
                    actionLabel: t("open"),
                },
                emptyMessage: t("empty"),
                failedMessage: t("failed"),
                retryLabel: t("retry"),
            }}
            on={{
                open: (id) => { void open(id) },
                retry: () => {
                    void Promise.all([
                        course.mutate(),
                        myCourses.mutate(),
                        lessons.mutate(),
                        challenges.mutate(),
                    ])
                },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
