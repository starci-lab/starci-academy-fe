"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryContentChallengeAttemptsSwr } from "@/hooks/swr/useQueryContentChallengeAttemptsSwr"
import { useQueryContentChallengeFeedbacksSwr } from "@/hooks/swr/useQueryContentChallengeFeedbacksSwr"
import { useQueryContentSwr } from "@/hooks/swr/useQueryContentSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryModuleSwr } from "@/hooks/swr/useQueryModuleSwr"
import { CourseLearnChallengeResultPageBase } from "./component"

/** Route identity required to resolve one deliverable's grading result. */
export type CourseLearnChallengeResultPageProps = {
    readonly displayId: string
    readonly moduleId: string
    readonly contentId: string
    readonly challengeId: string
}

/** Resolves the selected attempt and ordered feedback, polling until grading has settled. */
export const CourseLearnChallengeResultPage = (input: CourseLearnChallengeResultPageProps) => {
    const practice = useTranslations("practice")
    const contentText = useTranslations("learn.content")
    const router = useRouter()
    const searchParams = useSearchParams()
    const submissionId = searchParams.get("submission") ?? undefined
    const attemptId = searchParams.get("attempt") ?? undefined
    const content = useQueryContentSwr({ id: input.contentId })
    const course = useQueryCourseSwr({ displayId: input.displayId })
    const module = useQueryModuleSwr({ id: input.moduleId })
    const attempts = useQueryContentChallengeAttemptsSwr(course.data?.id, submissionId)
    const selectedAttempt = attemptId === undefined
        ? attempts.data?.[0]
        : attempts.data?.find((candidate) => candidate.id === attemptId)
    const feedbacks = useQueryContentChallengeFeedbacksSwr(course.data?.id, selectedAttempt?.id)
    const challenge = content.data?.challenges?.find((candidate) => (
        candidate.id === input.challengeId || candidate.displayId === input.challengeId
    ))
    const deliverable = challenge?.submissions.find((candidate) => candidate.id === submissionId)
    const orderedContents = useMemo(
        () => [...(module.data?.contents ?? [])].sort((first, second) => first.orderIndex - second.orderIndex),
        [module.data?.contents],
    )
    const contentPosition = orderedContents.findIndex((candidate) => candidate.id === input.contentId)
    const nextContent = contentPosition === -1 ? undefined : orderedContents[contentPosition + 1]
    const failed = submissionId === undefined
        || content.error !== undefined
        || course.error !== undefined
        || module.error !== undefined
        || attempts.error !== undefined
        || feedbacks.error !== undefined
        || (content.data !== undefined && (content.data === null || challenge === undefined || deliverable === undefined))
        || (course.data !== undefined && course.data === null)
        || (module.data !== undefined && module.data === null)
        || (attemptId !== undefined && attempts.data !== undefined && selectedAttempt === undefined)
        || attempts.data === null
        || feedbacks.data === null
    const pending = !failed && (
        content.data === undefined
        || course.data === undefined
        || module.data === undefined
        || attempts.data === undefined
        || selectedAttempt === undefined
        || selectedAttempt.processedAt === null
        || feedbacks.data === undefined
    )
    const readerPath = nextContent === undefined
        ? `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`
        : `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${nextContent.id}`
    const challengePath = (
        `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`
        + `/challenges/${input.challengeId}`
    )

    return (
        <CourseLearnChallengeResultPageBase
            state={failed ? "failed" : pending ? "pending" : "ready"}
            props={{
                title: deliverable?.title ?? challenge?.title ?? contentText("failedMessage"),
                description: deliverable?.description ?? challenge?.description ?? "",
                scoreLine: selectedAttempt?.score === null || selectedAttempt?.score === undefined
                    ? undefined
                    : `${selectedAttempt.score}/${deliverable?.score ?? challenge?.score ?? selectedAttempt.score}`,
                shortFeedback: selectedAttempt?.shortFeedback ?? undefined,
                feedbacks: [...(feedbacks.data ?? [])]
                    .sort((first, second) => first.sortIndex - second.sortIndex)
                    .map((feedback) => ({
                        id: feedback.id,
                        message: feedback.message,
                        detail: feedback.detail ?? undefined,
                        severity: feedback.severity,
                        location: feedback.location ?? undefined,
                        suggestion: feedback.suggestion ?? undefined,
                    })),
                notice: contentText("failedMessage"),
                reloadLabel: practice("retry"),
                retryLabel: practice("retry"),
                nextLabel: contentText("nextLabel"),
            }}
            on={{
                reload: () => {
                    void Promise.all([
                        content.mutate(),
                        course.mutate(),
                        module.mutate(),
                        attempts.mutate(),
                        feedbacks.mutate(),
                    ])
                },
                retry: () => router.push(challengePath),
                next: () => router.push(readerPath),
            }}
        />
    )
}

/** Architectural identity for the connected result twin. */
export const meta = { world: "connected", domain: "learn" } as const
