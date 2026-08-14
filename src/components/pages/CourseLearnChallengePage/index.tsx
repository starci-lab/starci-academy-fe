"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSubmitContentChallengeSwr } from "@/hooks/swr/useMutateSubmitContentChallengeSwr"
import { useQueryContentChallengeProgressSwr } from "@/hooks/swr/useQueryContentChallengeProgressSwr"
import { useQueryContentSwr } from "@/hooks/swr/useQueryContentSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import {
    _CourseLearnChallengePage,
    type CourseLearnChallengePageState,
} from "./component"

/** Route identity required to resolve one challenge inside a lesson. */
export type CourseLearnChallengePageProps = {
    readonly displayId: string
    readonly moduleId: string
    readonly contentId: string
    readonly challengeId: string
}

/** Resolves a challenge, submits one authored deliverable and opens its polling result route. */
export const CourseLearnChallengePage = (input: CourseLearnChallengePageProps) => {
    const practice = useTranslations("practice")
    const contentText = useTranslations("learn.content")
    const router = useRouter()
    const content = useQueryContentSwr({ id: input.contentId })
    const course = useQueryCourseSwr({ displayId: input.displayId })
    const progress = useQueryContentChallengeProgressSwr(course.data?.id)
    const submission = useMutateSubmitContentChallengeSwr()
    const [urls, setUrls] = useState<Readonly<Record<string, string>>>({})
    const [submitError, setSubmitError] = useState<string>()
    const challenges = useMemo(
        () => [...(content.data?.challenges ?? [])].sort((first, second) => first.orderIndex - second.orderIndex),
        [content.data?.challenges],
    )
    const challenge = challenges.find((candidate) => (
        candidate.id === input.challengeId || candidate.displayId === input.challengeId
    ))
    const challengeProgress = progress.data?.find((candidate) => candidate.id === challenge?.id)
    const pending = content.data === undefined
        || course.data === undefined
        || (course.data !== null && progress.data === undefined)
    const failed = content.error !== undefined
        || course.error !== undefined
        || progress.error !== undefined
        || submitError !== undefined
        || (content.data !== undefined && (content.data === null || challenge === undefined))
        || (course.data !== undefined && course.data === null)
        || (challenge !== undefined && challenge.submissions.length === 0)
    const state: CourseLearnChallengePageState = pending
        ? "pending"
        : submission.isMutating
            ? "submitting"
            : failed
                ? "failed"
                : challengeProgress?.completed === true
                    ? "passed"
                    : "ready"
    const resultPath = (submissionId: string) => (
        `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`
        + `/challenges/${input.challengeId}/result?submission=${encodeURIComponent(submissionId)}`
    )

    const submit = async (submissionId: string) => {
        const courseId = course.data?.id
        const githubUrl = urls[submissionId]?.trim()
        if (courseId === undefined || githubUrl === undefined || githubUrl.length === 0) return
        setSubmitError(undefined)
        try {
            await submission.trigger({
                courseId,
                request: { challengeSubmissionId: submissionId, githubUrl },
            })
            router.push(resultPath(submissionId))
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : contentText("failedMessage"))
        }
    }

    return (
        <_CourseLearnChallengePage
            state={state}
            props={{
                title: challenge?.title ?? contentText("failedMessage"),
                description: challenge?.description ?? "",
                metaLine: challenge === undefined
                    ? undefined
                    : `${challenge.difficulty} · ${challengeProgress?.lastScore ?? 0}/${challengeProgress?.maxScore ?? challenge.score}`,
                hint: challenge?.hint ?? undefined,
                deliverables: [...(challenge?.submissions ?? [])]
                    .sort((first, second) => first.sortIndex - second.sortIndex)
                    .map((deliverable) => ({
                        id: deliverable.id,
                        title: deliverable.title,
                        description: deliverable.description ?? undefined,
                        scoreLine: `${deliverable.score}`,
                        url: urls[deliverable.id] ?? "",
                    })),
                notice: submitError ?? contentText("failedMessage"),
                submitLabel: practice("submit"),
                submittingLabel: practice("submitting"),
                retryLabel: practice("retry"),
                resultLabel: practice("reread"),
            }}
            on={{
                changeUrl: (id, value) => setUrls((current) => ({ ...current, [id]: value })),
                submit: (id) => { void submit(id) },
                retry: () => {
                    setSubmitError(undefined)
                    void Promise.all([content.mutate(), course.mutate(), progress.mutate()])
                },
                openResult: (id) => router.push(resultPath(id)),
            }}
        />
    )
}

/** Architectural identity for the connected challenge twin. */
export const meta = { world: "connected", domain: "learn" } as const
