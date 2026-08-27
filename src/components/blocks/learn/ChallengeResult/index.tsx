"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryContentChallengeAttemptsSwr } from "@/hooks/swr/useQueryContentChallengeAttemptsSwr"
import { useQueryContentChallengeSubmissionsSwr } from "@/hooks/swr/useQueryContentChallengeSubmissionsSwr"
import { useMutateSubmitContentChallengeSwr } from "@/hooks/swr/useMutateSubmitContentChallengeSwr"
import { useQueryContentChallengeFeedbacksSwr } from "@/hooks/swr/useQueryContentChallengeFeedbacksSwr"
import { useQueryContentSwr } from "@/hooks/swr/useQueryContentSwr"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryModuleSwr } from "@/hooks/swr/useQueryModuleSwr"
import { useJobVerdictSocketIo } from "@/hooks/socketio/useJobVerdictSocketIo"
import { ChallengeResultBase } from "./component"

/** Route identity required to resolve one deliverable's grading result. */
export type ChallengeResultRouteProps = {
    readonly displayId: string
    readonly moduleId: string
    readonly contentId: string
    readonly challengeId: string
}

/** Minimal lifecycle fields needed to classify an interrupted evaluation. */
type StaleEvaluationCandidate = {
    readonly status: string
    readonly updatedAt: string
}

/** Resolves the selected attempt and ordered feedback, polling until grading has settled. */
export const ChallengeResultBlock = (input: ChallengeResultRouteProps) => {
    const practice = useTranslations("practice")
    const contentText = useTranslations("learn.content")
    const router = useRouter()
    const searchParams = useSearchParams()
    const submissionId = searchParams.get("submission") ?? undefined
    const attemptId = searchParams.get("attempt") ?? undefined
    const attemptGroupId = searchParams.get("attemptGroup") ?? undefined
    const routeJobId = searchParams.get("jobs")?.split(",")[0] || undefined
    const jobNotifications = useJobVerdictSocketIo(routeJobId)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const content = useQueryContentSwr({ id: input.contentId })
    const course = useQueryCourseSwr({ displayId: input.displayId })
    const module = useQueryModuleSwr({ id: input.moduleId })
    const submit = useMutateSubmitContentChallengeSwr()
    const challenge = content.data?.challenges?.find((candidate) => (
        candidate.id === input.challengeId || candidate.displayId === input.challengeId
    ))
    const attempts = useQueryContentChallengeAttemptsSwr(
        course.data?.id,
        submissionId,
        jobNotifications.isConnected,
    )
    const submissions = useQueryContentChallengeSubmissionsSwr(
        course.data?.id,
        challenge?.id,
        jobNotifications.isConnected,
    )
    const selectedAttempt = attemptId === undefined
        ? attempts.data?.[0]
        : attempts.data?.find((candidate) => candidate.id === attemptId)
    const groupedAttempts = attemptGroupId === undefined
        ? selectedAttempt === undefined ? [] : [selectedAttempt]
        : (submissions.data ?? []).flatMap((item) => {
            const candidate = item.userSubmission?.lastAttempt
            return candidate?.attemptGroupId === attemptGroupId ? [candidate] : []
        })
    const feedbacks = useQueryContentChallengeFeedbacksSwr(course.data?.id, selectedAttempt?.id)
    useEffect(() => {
        const verdict = jobNotifications.verdict
        if (verdict === undefined || verdict.jobId !== routeJobId) return
        const revalidateResultOwners = () => Promise.all([
            attempts.mutate(),
            submissions.mutate(),
            feedbacks.mutate(),
        ])
        void revalidateResultOwners()
        const isTerminal = verdict.status === "completed"
            || verdict.status === "failed"
        // The socket event is emitted by the worker transaction. Give that
        // transaction one bounded turn to commit, then reconcile the durable
        // projections once more. This is event-driven recovery, not polling.
        const timer = isTerminal
            ? window.setTimeout(() => void revalidateResultOwners(), 250)
            : undefined
        return () => {
            if (timer !== undefined) window.clearTimeout(timer)
        }
    }, [
        attempts.mutate,
        feedbacks.mutate,
        jobNotifications.verdict,
        routeJobId,
        submissions.mutate,
    ])
    const deliverable = challenge?.submissions?.find((candidate) => candidate.id === submissionId)
        ?? submissions.data?.find((candidate) => candidate.id === submissionId)
    const orderedContents = useMemo(
        () => [...(module.data?.contents ?? [])].sort((first, second) => first.orderIndex - second.orderIndex),
        [module.data?.contents],
    )
    const contentPosition = orderedContents.findIndex((candidate) => candidate.id === input.contentId)
    const nextContent = contentPosition === -1 ? undefined : orderedContents[contentPosition + 1]
    const loadError = [content.error,
        course.error,
        module.error,
        attempts.error,
        submissions.error,
        feedbacks.error]
        .find((error): error is Error => error instanceof Error)
    const failed = submissionId === undefined
        || content.error !== undefined
        || course.error !== undefined
        || module.error !== undefined
        || attempts.error !== undefined
        || submissions.error !== undefined
        || feedbacks.error !== undefined
        || (content.data !== undefined && (content.data === null || challenge === undefined || deliverable === undefined))
        || (course.data !== undefined && course.data === null)
        || (module.data !== undefined && module.data === null)
        || (attemptId !== undefined && attempts.data !== undefined && selectedAttempt === undefined)
        || attempts.data === null
        || feedbacks.data === null
    const isStaleEvaluation = (attempt: StaleEvaluationCandidate) => (
        attempt.status === "evaluating"
        && Date.now() - new Date(attempt.updatedAt).getTime() >= 5 * 60 * 1000
    )
    const staleAttemptIds = new Set(
        (attempts.data ?? []).filter(isStaleEvaluation).map((attempt) => attempt.id),
    )
    // The job gateway is the fastest authoritative source for an async terminal
    // failure. The attempt projection is persisted by a separate completion path
    // and can trail the socket event briefly; waiting for a refetch here leaves
    // the learner stuck on "grading" until a manual reload even though the job
    // has already failed.
    const socketReportedFailure = jobNotifications.verdict?.jobId === routeJobId
        && jobNotifications.verdict?.status === "failed"
    const unavailable = !failed && (
        socketReportedFailure
        || groupedAttempts.some((attempt) => (
            attempt.status === "evaluation_unavailable" || staleAttemptIds.has(attempt.id)
        ))
    )
    const pending = !failed && (
        content.data === undefined
        || course.data === undefined
        || module.data === undefined
        || attempts.data === undefined
        || selectedAttempt === undefined
        || submissions.data === undefined
        || groupedAttempts.length === 0
        || (!socketReportedFailure && groupedAttempts.some((attempt) => (
            attempt.status === "evaluating" && !staleAttemptIds.has(attempt.id)
        )))
        || feedbacks.data === undefined
    )
    const readerPath = nextContent === undefined
        ? `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`
        : `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${nextContent.id}`
    const challengePath = (
        `/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`
        + `/challenges/${input.challengeId}`
    )
    const totalScore = groupedAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0)
    const maxScore = submissions.data?.reduce((sum, item) => sum + item.score, 0) ?? challenge?.score
    const decidedAttempts = groupedAttempts.filter((attempt) => attempt.platformDecision !== null)
    const aggregateDecision = decidedAttempts.length === groupedAttempts.length
        && groupedAttempts.length > 0
        && decidedAttempts.every((attempt) => attempt.platformDecision === "passed")
        ? "passed"
        : decidedAttempts.some((attempt) => attempt.platformDecision === "needs_revision")
            ? "needs_revision"
            : undefined
    const confidences = groupedAttempts.flatMap((attempt) => attempt.confidence === null ? [] : [attempt.confidence])
    const aggregateConfidence = confidences.length === 0
        ? undefined
        : confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length
    const retryEvaluation = async () => {
        const courseId = course.data?.id
        if (courseId === undefined) return
        const retryable = (submissions.data ?? []).filter((item) => {
            const lastAttempt = item.userSubmission?.lastAttempt
            return (lastAttempt?.status === "evaluation_unavailable"
                || (lastAttempt !== undefined && lastAttempt !== null && staleAttemptIds.has(lastAttempt.id)))
                && (attemptGroupId === undefined || lastAttempt.attemptGroupId === attemptGroupId)
                && lastAttempt.evaluationJobId !== null
        })
        const retryTargets = retryable.map((item) => ({
            challengeSubmissionId: item.id,
            submissionUrl: item.userSubmission?.submissionUrl,
            evaluationJobId: item.userSubmission?.lastAttempt?.evaluationJobId ?? undefined,
            targetAttemptGroupId: item.userSubmission?.lastAttempt?.attemptGroupId ?? undefined,
        }))
        const selectedEvaluationJobId = selectedAttempt?.evaluationJobId ?? routeJobId
        const selectedAttemptRetryable = selectedAttempt !== undefined
            && (
                selectedAttempt.status === "evaluation_unavailable"
                || staleAttemptIds.has(selectedAttempt.id)
            )
            && selectedEvaluationJobId !== undefined
        if (retryTargets.length === 0 && deliverable !== undefined && selectedAttemptRetryable) {
            retryTargets.push({
                challengeSubmissionId: deliverable.id,
                submissionUrl: selectedAttempt.submissionUrl,
                evaluationJobId: selectedEvaluationJobId,
                targetAttemptGroupId: selectedAttempt.attemptGroupId ?? undefined,
            })
        }
        await Promise.all(retryTargets.map((target) => submit.trigger({
            courseId,
            request: {
                challengeSubmissionId: target.challengeSubmissionId,
                githubUrl: target.submissionUrl,
                idempotencyKey: target.evaluationJobId,
                attemptGroupId: target.targetAttemptGroupId,
            },
        })))
        await Promise.all([attempts.mutate(), submissions.mutate(), feedbacks.mutate()])
    }

    return (
        <ChallengeResultBase
            blockState={failed ? "failed" : unavailable ? "unavailable" : pending ? "pending" : "ready"}
            props={{
                title: challenge?.title ?? deliverable?.title ?? contentText("failedMessage"),
                description: challenge?.description ?? deliverable?.description ?? "",
                scoreLine: groupedAttempts.some((attempt) => attempt.score === null)
                    ? undefined
                    : `${totalScore}/${maxScore ?? totalScore}`,
                shortFeedback: groupedAttempts.map((attempt) => attempt.shortFeedback).filter(Boolean).join(" ") || undefined,
                evaluationTitle: contentText("challengeEvaluationTitle"),
                evaluationDetail: routeJobId === undefined || jobNotifications.connectionState === "connected"
                    ? contentText("challengeEvaluationDetail")
                    : jobNotifications.connectionState === "connecting"
                        ? contentText("challengeEvaluationConnectingDetail")
                        : contentText("challengeEvaluationDisconnectedDetail"),
                realtimeStatus: routeJobId === undefined
                    ? undefined
                    : jobNotifications.connectionState === "connected"
                        ? contentText("challengeRealtimeConnected")
                        : jobNotifications.connectionState === "connecting"
                            ? contentText("challengeRealtimeConnecting")
                            : contentText("challengeRealtimeFallback"),
                unavailableTitle: contentText("challengeEvaluationUnavailableTitle"),
                unavailableDetail: contentText("challengeEvaluationUnavailableDetail"),
                outcomeLabel: aggregateDecision === "passed"
                    ? contentText("challengePassed")
                    : aggregateDecision === "needs_revision"
                        ? contentText("challengeNeedsRevision")
                        : undefined,
                confidenceLine: aggregateConfidence === undefined
                    ? undefined
                    : contentText("challengeConfidence", { confidence: Math.round(aggregateConfidence * 100) }),
                uncertainty: groupedAttempts.find((attempt) => attempt.uncertainty)?.uncertainty ?? undefined,
                nextAction: groupedAttempts.find((attempt) => attempt.nextAction)?.nextAction ?? undefined,
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
                notice: loadError?.message ?? contentText("failedMessage"),
                reloadLabel: practice("retry"),
                retryLabel: practice("retry"),
                nextLabel: contentText("nextLabel"),
                historyLabel: contentText("challengeHistoryTitle"),
                courseId: course.data?.id,
                submissionId,
                selectedAttemptId: selectedAttempt?.id,
                isHistoryOpen,
                breadcrumbLabel: contentText("challengeBreadcrumb"),
                courseTitle: course.data?.title ?? input.displayId,
                moduleTitle: module.data?.title ?? input.moduleId,
                contentTitle: content.data?.title ?? input.contentId,
            }}
            on={{
                reload: () => {
                    if (unavailable) {
                        void retryEvaluation()
                        return
                    }
                    void Promise.all([
                        content.mutate(),
                        course.mutate(),
                        module.mutate(),
                        attempts.mutate(),
                        submissions.mutate(),
                        feedbacks.mutate(),
                    ])
                },
                retry: () => router.push(challengePath),
                next: () => router.push(readerPath),
                openCourse: () => router.push(`/courses/${input.displayId}/learn`),
                openModule: () => router.push(`/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`),
                openContent: () => router.push(`/courses/${input.displayId}/learn/content/modules/${input.moduleId}/contents/${input.contentId}`),
                openHistory: () => setIsHistoryOpen(true),
                closeHistory: () => setIsHistoryOpen(false),
                selectHistoryAttempt: (selectedId, selectedGroupId) => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("attempt", selectedId)
                    if (selectedGroupId === undefined) params.delete("attemptGroup")
                    else params.set("attemptGroup", selectedGroupId)
                    setIsHistoryOpen(false)
                    router.push(`${challengePath}/result?${params.toString()}`)
                },
            }}
        />
    )
}

/** Architectural identity for the connected result twin. */
export const meta = { world: "connected", domain: "learn" } as const
