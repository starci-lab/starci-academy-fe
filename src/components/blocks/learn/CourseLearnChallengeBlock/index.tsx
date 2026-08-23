"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSubmitContentChallengeSwr } from "@/hooks/swr/useMutateSubmitContentChallengeSwr"
import { useQueryContentChallengeProgressSwr } from "@/hooks/swr/useQueryContentChallengeProgressSwr"
import { useQueryContentSwr } from "@/hooks/swr/useQueryContentSwr"
import { useQueryCourseOutlineSwr } from "@/hooks/swr/useQueryCourseOutlineSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { filterCourseOutlineModules } from "@/modules/learn/course-outline"
import {
    CourseLearnChallengeBlockBase,
    type CourseLearnChallengeBlockState,
} from "./component"

/** Route identity required to resolve one challenge inside a lesson. */
export type CourseLearnChallengeBlockProps = {
    readonly displayId: string
    readonly moduleId: string
    readonly contentId: string
    readonly challengeId: string
}

/** Resolves a challenge, submits one authored deliverable and opens its polling result route. */
export const CourseLearnChallengeBlock = (input: CourseLearnChallengeBlockProps) => {
    const contentText = useTranslations("learn.content")
    const contentHomeText = useTranslations("learn.contentHome")
    const router = useRouter()
    const content = useQueryContentSwr({ id: input.contentId })
    const course = useQueryCourseSwr({ displayId: input.displayId })
    const courseOutline = useQueryCourseOutlineSwr(input.displayId)
    const progress = useQueryContentChallengeProgressSwr(course.data?.id)
    const submission = useMutateSubmitContentChallengeSwr()
    const [urls, setUrls] = useState<Readonly<Record<string, string>>>({})
    const [contentSearch, setContentSearch] = useState("")
    const [expandedModuleIds, setExpandedModuleIds] = useState<ReadonlySet<string>>(new Set([input.moduleId]))
    const [isCourseMapOpen, setIsCourseMapOpen] = useState(false)
    const [expandedRequirementIds, setExpandedRequirementIds] = useState<ReadonlyArray<string>>([])
    const [activeSubmissionId, setActiveSubmissionId] = useState<string>()
    const [failedSubmissionId, setFailedSubmissionId] = useState<string>()
    const [submitError, setSubmitError] = useState<string>()
    const challenges = useMemo(
        () => [...(content.data?.challenges ?? [])].sort((first, second) => first.orderIndex - second.orderIndex),
        [content.data?.challenges],
    )
    const challenge = challenges.find((candidate) => (
        candidate.id === input.challengeId || candidate.displayId === input.challengeId
    ))
    const challengeSubmissions = challenge?.submissions ?? []
    const challengeProgress = progress.data?.find((candidate) => candidate.id === challenge?.id)

    useEffect(() => {
        setExpandedRequirementIds(challengeSubmissions[0] === undefined ? [] : [challengeSubmissions[0].id])
    }, [challenge?.id])

    const pending = content.data === undefined
        || course.data === undefined
        || (course.data !== null && progress.data === undefined)
    const loadFailed = content.error !== undefined
        || course.error !== undefined
        || progress.error !== undefined
        || (content.data !== undefined && (content.data === null || challenge === undefined))
        || (course.data !== undefined && course.data === null)
        || (challenge !== undefined && challengeSubmissions.length === 0)
    const blockState: CourseLearnChallengeBlockState = pending
        ? "pending"
        : activeSubmissionId !== undefined
            ? "submitting"
            : loadFailed || submitError !== undefined
                ? "failed"
                : challengeProgress?.completed === true
                    ? "passed"
                    : "ready"
    const resultPath = (submissionId: string) => (
        `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`
        + `/challenges/${input.challengeId}/result?submission=${encodeURIComponent(submissionId)}`
    )
    const lessonPath = `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`

    const submit = async (submissionId: string) => {
        const courseId = course.data?.id
        const githubUrl = urls[submissionId]?.trim()
        if (courseId === undefined || githubUrl === undefined || githubUrl.length === 0) return
        setSubmitError(undefined)
        setFailedSubmissionId(undefined)
        setActiveSubmissionId(submissionId)
        try {
            await submission.trigger({
                courseId,
                request: { challengeSubmissionId: submissionId, githubUrl },
            })
            router.push(resultPath(submissionId))
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : contentText("failedMessage"))
            setFailedSubmissionId(submissionId)
        } finally {
            setActiveSubmissionId(undefined)
        }
    }

    const filteredModules = useMemo(
        () => filterCourseOutlineModules(courseOutline.data?.modules ?? [], contentSearch),
        [contentSearch, courseOutline.data?.modules],
    )

    useEffect(() => {
        setExpandedModuleIds((current) => new Set([...current, input.moduleId]))
    }, [input.moduleId])

    const onSearchCourseMap = (query: string) => {
        setContentSearch(query)
        const matches = filterCourseOutlineModules(courseOutline.data?.modules ?? [], query)
        setExpandedModuleIds(query.trim() === ""
            ? new Set([input.moduleId])
            : new Set(matches.map((courseModule) => courseModule.id)))
    }

    const onToggleCourseMapModule = (moduleId: string, isOpen: boolean) => {
        setExpandedModuleIds((current) => {
            const next = new Set(current)
            if (isOpen) next.add(moduleId)
            else next.delete(moduleId)
            return next
        })
    }
    const courseMapRoutes = useMemo(() => {
        const entries = (courseOutline.data?.modules ?? []).flatMap((courseModule) => (
            courseModule.lessons.flatMap((lesson): ReadonlyArray<readonly [string, string]> => [
                [
                    `lesson:${lesson.id}`,
                    `/courses/${input.displayId}/learn/content/modules/${courseModule.id}/contents/${lesson.id}`,
                ],
                ...lesson.challenges.map((candidate): readonly [string, string] => [
                    `challenge:${candidate.id}`,
                    `/courses/${input.displayId}/learn/content/modules/${courseModule.id}/contents/${lesson.id}/challenges/${candidate.id}`,
                ]),
            ])
        ))
        return new Map(entries)
    }, [courseOutline.data?.modules, input.displayId])
    const courseMapState = courseOutline.data === undefined
        ? courseOutline.error === undefined ? "pending" : "failed"
        : courseOutline.data === null || filteredModules.length === 0
            ? "empty"
            : courseOutline.error === undefined ? "ready" : "partial"
    const maximumScore = challengeProgress?.maxScore ?? challenge?.score ?? 0
    const earnedScore = challengeProgress?.lastScore ?? 0
    const isPassed = blockState === "passed"

    return (
        <CourseLearnChallengeBlockBase
            blockState={blockState}
            props={{
                title: challenge?.title ?? contentText("failedMessage"),
                description: challenge?.description ?? "",
                difficultyLabel: challenge === undefined
                    ? ""
                    : contentText(`challengeDifficulty.${challenge.difficulty}`),
                statusLabel: isPassed
                    ? contentText("challengePassed")
                    : contentText("challengeNotSubmitted"),
                hint: challenge?.hint ?? undefined,
                earnedScore,
                maximumScore,
                expandedRequirementIds,
                activeSubmissionId,
                failedSubmissionId,
                notice: submitError ?? contentText("failedMessage"),
                isCourseMapOpen,
                courseMap: {
                    state: courseMapState,
                    props: {
                        labels: {
                            progress: contentHomeText("progressLabel"),
                            searchPlaceholder: contentText("searchPlaceholder"),
                            searchLabel: contentText("searchLabel"),
                            searchClearLabel: contentText("searchClearLabel"),
                            failed: contentText("failedMessage"),
                        },
                        completionPercent: courseOutline.data?.progress.completionPercent,
                        progressFact: courseOutline.data === null || courseOutline.data === undefined
                            ? undefined
                            : `${courseOutline.data.progress.lessonsRead}/${courseOutline.data.progress.lessonsTotal}`,
                        modules: filteredModules.map((courseModule) => {
                            const lessons = courseModule.lessons.flatMap((lesson) => [
                                {
                                    id: `lesson:${lesson.id}`,
                                    title: lesson.title,
                                    meta: contentText("minutes", { minutes: lesson.minutesRead }),
                                    isComplete: lesson.isRead,
                                    isCurrent: false,
                                },
                                ...lesson.challenges.map((candidate) => ({
                                    id: `challenge:${candidate.id}`,
                                    title: candidate.title,
                                    meta: contentText("challengePoints", { score: candidate.maxScore }),
                                    isComplete: candidate.completed,
                                    isCurrent: candidate.id === challenge?.id,
                                })),
                            ])
                            const completed = lessons.filter((lesson) => lesson.isComplete).length
                            return {
                                id: courseModule.id,
                                title: courseModule.title,
                                countLabel: contentText("moduleProgress", { completed, total: lessons.length }),
                                progressLabel: contentText("moduleProgressLabel", { module: courseModule.title }),
                                completionPercent: lessons.length === 0 ? 0 : Math.round(completed / lessons.length * 100),
                                isOpen: expandedModuleIds.has(courseModule.id),
                                lessons,
                            }
                        }),
                    },
                },
                deliverables: [...challengeSubmissions]
                    .sort((first, second) => first.sortIndex - second.sortIndex)
                    .map((deliverable) => ({
                        id: deliverable.id,
                        title: deliverable.title,
                        description: deliverable.description ?? undefined,
                        score: deliverable.score,
                        url: urls[deliverable.id] ?? "",
                    })),
                labels: {
                    backToLesson: contentText("challengeBackToLesson"),
                    openCourseMap: contentText("challengeCourseMap"),
                    closeCourseMap: contentText("challengeCloseCourseMap"),
                    brief: contentText("challengeBrief"),
                    deliverables: contentText("challengeDeliverables"),
                    score: contentText("challengeScore"),
                    repositoryPlaceholder: contentText("challengeRepositoryPlaceholder"),
                    saved: contentText("challengeSaved"),
                    submit: contentText("challengeSubmit"),
                    submitting: contentText("challengeSubmitting"),
                    retry: contentText("challengeRetry"),
                    result: contentText("challengeResult"),
                    points: (score) => contentText("challengePoints", { score }),
                    scoreValue: (score, maximum) => contentText("challengeScoreValue", { score, maximum }),
                    passing: (score) => contentText("challengePassing", { score }),
                    scoreCaption: contentText("challengeScoreCaption"),
                },
            }}
            on={{
                back: () => router.push(lessonPath),
                openCourseMap: () => setIsCourseMapOpen(true),
                closeCourseMap: () => setIsCourseMapOpen(false),
                searchCourseMap: onSearchCourseMap,
                toggleCourseMapModule: onToggleCourseMapModule,
                openCourseMapItem: (id) => {
                    const path = courseMapRoutes.get(id)
                    if (path !== undefined) router.push(path)
                    setIsCourseMapOpen(false)
                },
                toggleRequirement: (id, isOpen) => setExpandedRequirementIds((current) => (
                    isOpen
                        ? [...new Set([...current, id])]
                        : current.filter((candidate) => candidate !== id)
                )),
                changeUrl: (id, value) => setUrls((current) => ({ ...current, [id]: value })),
                submit: (id) => { void submit(id) },
                retry: (id) => {
                    if (id !== undefined) {
                        void submit(id)
                        return
                    }
                    setSubmitError(undefined)
                    setFailedSubmissionId(undefined)
                    void Promise.all([content.mutate(), course.mutate(), courseOutline.mutate(), progress.mutate()])
                },
                openResult: (id) => router.push(resultPath(id)),
            }}
        />
    )
}

/** Architectural identity for the connected challenge twin. */
export const meta = { world: "connected", domain: "learn" } as const


