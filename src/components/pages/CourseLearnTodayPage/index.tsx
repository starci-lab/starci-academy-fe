"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMyCoursesSwr } from "@/hooks/swr/useQueryMyCoursesSwr"
import { useQueryMyLearnedLessonsSwr } from "@/hooks/swr/useQueryMyLearnedLessonsSwr"
import { useQueryMyInProgressChallengesSwr } from "@/hooks/swr/useQueryMyInProgressChallengesSwr"
import { useQueryFlashcardDecksByCourseSwr } from "@/hooks/swr/useQueryFlashcardDecksByCourseSwr"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryMyInProgressMockInterviewSessionSwr } from "@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr"
import { useQueryCourseLeaderboardSwr } from "@/hooks/swr/useQueryCourseLeaderboardSwr"
import { useQueryMyWeeklyStatsSwr } from "@/hooks/swr/useQueryMyWeeklyStatsSwr"
import { useQueryResolveRouteSwr } from "@/hooks/swr/useQueryResolveRouteSwr"
import { useLearnMobileView } from "@/components/layouts/LearnShellLayout"
import type { CourseLearningSignal } from "@/components/blocks/learn/CourseLearningSignals"
import type { CourseNextAction } from "@/components/blocks/learn/CourseNextActions"
import { _CourseLearnTodayPage, type CourseLearnTodayItem } from "./component"

/** Route identity required by the connected course dashboard. */
export type CourseLearnTodayPageProps = { readonly displayId: string }

/** Rank live learning facts into the accepted course-dashboard composition. */
export const CourseLearnTodayPage = ({ displayId }: CourseLearnTodayPageProps) => {
    const t = useTranslations("learn.today")
    const router = useRouter()
    const mobile = useLearnMobileView()
    const [selectedSignalId, setSelectedSignalId] = useState("review")
    const course = useQueryCourseSwr({ displayId })
    const myCourses = useQueryMyCoursesSwr()
    const lessons = useQueryMyLearnedLessonsSwr()
    const challenges = useQueryMyInProgressChallengesSwr()
    const decks = useQueryFlashcardDecksByCourseSwr(course.data?.id)
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const interview = useQueryMyInProgressMockInterviewSessionSwr(course.data?.id)
    const leaderboard = useQueryCourseLeaderboardSwr(course.data?.id)
    const weekly = useQueryMyWeeklyStatsSwr()
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
    const auxiliaryPending = lessons.data === undefined
        || challenges.data === undefined
        || decks.data === undefined
        || project.data === undefined
        || interview.data === undefined
    const auxiliaryFailed = lessons.error !== undefined
        || challenges.error !== undefined
        || decks.error !== undefined
        || project.error !== undefined
        || interview.error !== undefined
    const signalPending = state === "pending" || decks.data === undefined || weekly.data === undefined || leaderboard.data === undefined
    const signalFailed = decks.error !== undefined || weekly.error !== undefined || leaderboard.error !== undefined
    const rank = leaderboard.data?.myRank?.rank
    const streak = weekly.data?.streak ?? 0

    const signalRows: ReadonlyArray<Omit<CourseLearningSignal, "isSelected"> & { readonly caption: string; readonly destination: string }> = [
        {
            id: "review",
            label: t("signals.review"),
            fact: t("signals.reviewFact", { count: dueCount }),
            actionLabel: t("viewSignal"),
            caption: t("signals.reviewCaption", { count: dueCount }),
            destination: "flashcards",
        },
        {
            id: "continuity",
            label: t("signals.continuity"),
            fact: t("signals.continuityFact", { days: streak }),
            actionLabel: t("viewSignal"),
            caption: t("signals.continuityCaption", { days: streak }),
            destination: "modules",
        },
        {
            id: "standing",
            label: t("signals.standing"),
            fact: rank === null || rank === undefined ? t("signals.unranked") : t("signals.standingFact", { rank }),
            actionLabel: t("viewSignal"),
            caption: rank === null || rank === undefined ? t("signals.unrankedCaption") : t("signals.standingCaption", { rank }),
            destination: "leaderboard",
        },
    ]
    const selectedSignal = signalRows.find((signal) => signal.id === selectedSignalId) ?? signalRows[0]
    const signals: ReadonlyArray<CourseLearningSignal> = signalRows.map((signal) => ({
        id: signal.id,
        label: signal.label,
        fact: signal.fact,
        actionLabel: signal.actionLabel,
        isSelected: signal.id === selectedSignal?.id,
    }))
    const nextActions: ReadonlyArray<CourseNextAction> = [primary, ...secondary]

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
            leaderboard: base + "/leaderboard",
        }
        const path = paths[id]
        if (path !== undefined) router.push(path)
    }

    const retry = () => {
        void Promise.all([
            course.mutate(),
            myCourses.mutate(),
            lessons.mutate(),
            challenges.mutate(),
            decks.mutate(),
            project.mutate(),
            interview.mutate(),
            leaderboard.mutate(),
            weekly.mutate(),
        ])
    }

    const progressState = state !== "ready"
        ? state
        : weekly.data === undefined || leaderboard.data === undefined || weekly.error !== undefined || leaderboard.error !== undefined
            ? "partial" as const
            : "ready" as const
    const nextState = state !== "ready"
        ? state
        : auxiliaryPending ? "pending" as const
            : auxiliaryFailed ? "partial" as const
                : "ready" as const
    const signalsState = state !== "ready"
        ? state
        : signalPending ? "pending" as const
            : signalFailed ? "partial" as const
                : "ready" as const

    return (
        <_CourseLearnTodayPage
            state={state}
            mobileView={view}
            props={{
                title: t("title"),
                subtitle: t("subtitle", { course: course.data?.title ?? t("modules") }),
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
                dashboard: {
                    progress: progressState === "pending"
                        ? { state: "pending", props: { label: t("progressSection"), completionLabel: t("progressLabel") } }
                        : progressState === "failed"
                            ? { state: "failed", props: { label: t("progressSection"), completionLabel: t("progressLabel"), message: t("progressFailed"), retryLabel: t("retry") } }
                            : progressState === "empty"
                                ? { state: "empty", props: { label: t("progressSection"), completionLabel: t("progressLabel"), message: t("empty") } }
                                : {
                                    state: progressState,
                                    props: {
                                        label: t("progressSection"),
                                        completionLabel: t("progressLabel"),
                                        completionFact: t("progressFact", { percent: enrolledCourse?.completionPercent ?? 0 }),
                                        completionValue: enrolledCourse?.completionPercent ?? 0,
                                        continuityLabel: t("signals.continuity"),
                                        continuityFact: t("signals.continuityFact", { days: streak }),
                                        standingLabel: t("signals.standing"),
                                        standingFact: rank === null || rank === undefined ? t("signals.unranked") : t("signals.standingFact", { rank }),
                                    },
                                },
                    nextActions: nextState === "pending"
                        ? { state: "pending", props: { label: t("nextActionsLabel") } }
                        : nextState === "failed"
                            ? { state: "failed", props: { label: t("nextActionsLabel"), message: t("actionsFailed"), retryLabel: t("retry") } }
                            : nextState === "empty"
                                ? { state: "empty", props: { label: t("nextActionsLabel"), message: t("empty") } }
                                : { state: nextState, props: { label: t("nextActionsLabel"), actions: nextActions } },
                    signals: signalsState === "pending"
                        ? { state: "pending", props: { label: t("signalsLabel") } }
                        : signalsState === "failed"
                            ? { state: "failed", props: { label: t("signalsLabel"), message: t("signalsFailed"), retryLabel: t("retry") } }
                            : signalsState === "empty"
                                ? { state: "empty", props: { label: t("signalsLabel"), message: t("signalsEmpty") } }
                                : { state: signalsState, props: { label: t("signalsLabel"), signals } },
                    signalDetail: signalsState === "pending"
                        ? { state: "pending", props: { label: t("signalDetailLabel") } }
                        : signalsState === "failed"
                            ? { state: "failed", props: { label: t("signalDetailLabel"), message: t("signalsFailed"), retryLabel: t("retry") } }
                            : selectedSignal === undefined
                                ? { state: "empty", props: { label: t("signalDetailLabel"), message: t("signalsEmpty") } }
                                : {
                                    state: "ready",
                                    props: {
                                        label: t("signalDetailLabel"),
                                        title: selectedSignal.label,
                                        fact: selectedSignal.fact,
                                        caption: selectedSignal.caption,
                                        actionLabel: t("signals.open"),
                                    },
                                },
                },
                emptyMessage: t("empty"),
                failedMessage: t("failed"),
                retryLabel: t("retry"),
            }}
            on={{
                open: (id) => { void open(id) },
                selectSignal: setSelectedSignalId,
                openSignal: () => {
                    if (selectedSignal !== undefined) void open(selectedSignal.destination)
                },
                retry,
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
