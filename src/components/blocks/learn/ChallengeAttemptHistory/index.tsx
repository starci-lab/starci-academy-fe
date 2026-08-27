"use client"

import { useLocale, useTranslations } from "next-intl"
import { useQueryContentChallengeAttemptsSwr } from "@/hooks/swr/useQueryContentChallengeAttemptsSwr"
import type { ContentChallengeAttempt } from "@/modules/api/graphql/queries/query-content-challenge-attempts"
import {
    ChallengeAttemptHistoryBase,
    type ChallengeAttemptHistoryItem,
} from "./component"

/** Stable route and selection identity for one Challenge history. */
export type ChallengeAttemptHistoryProps = {
    readonly courseId?: string
    readonly submissionId?: string
    readonly selectedAttemptId?: string
    readonly onSelect?: (attempt: ChallengeAttemptHistoryItem) => void
}

const resolveOutcome = (attempt: ContentChallengeAttempt): ChallengeAttemptHistoryItem["outcome"] => {
    if (attempt.status === "evaluating") return "evaluating"
    if (attempt.status === "evaluation_unavailable") return "unavailable"
    return attempt.platformDecision === "passed" ? "passed" : "needsRevision"
}

const resolveState = (
    data: ReadonlyArray<ContentChallengeAttempt> | null | undefined,
    error: unknown,
    attempts: ReadonlyArray<ChallengeAttemptHistoryItem>,
): "pending" | "ready" | "empty" | "failed" => {
    if (error !== undefined) return "failed"
    if (data === undefined) return "pending"
    return attempts.length === 0 ? "empty" : "ready"
}

/** Own the bounded Challenge-attempt query without borrowing Personal Project ownership. */
export const ChallengeAttemptHistory = (props: ChallengeAttemptHistoryProps) => {
    const locale = useLocale()
    const t = useTranslations("learn.content")
    const query = useQueryContentChallengeAttemptsSwr(props.courseId, props.submissionId)
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" })
    const attempts: ReadonlyArray<ChallengeAttemptHistoryItem> = (query.data ?? []).map((attempt) => ({
        id: attempt.id,
        attemptGroupId: attempt.attemptGroupId ?? undefined,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score ?? undefined,
        outcome: resolveOutcome(attempt),
        servedModel: attempt.servedModel ?? undefined,
        processedAt: attempt.processedAt === null ? undefined : date.format(new Date(attempt.processedAt)),
    }))
    const state = resolveState(query.data, query.error, attempts)

    return (
        <ChallengeAttemptHistoryBase
            state={state}
            attempts={attempts}
            selectedAttemptId={props.selectedAttemptId}
            labels={{
                summary: (count) => t("challengeHistorySummary", { count }),
                attempt: (number, score) => score === undefined
                    ? t("challengeHistoryAttemptPending", { number })
                    : t("challengeHistoryAttempt", { number, score }),
                outcome: {
                    evaluating: t("challengeHistoryEvaluating"),
                    passed: t("challengePassed"),
                    needsRevision: t("challengeNeedsRevision"),
                    unavailable: t("challengeEvaluationUnavailableTitle"),
                },
                pending: t("challengeHistoryPending"),
                empty: t("challengeHistoryEmpty"),
                failed: t("challengeHistoryFailed"),
            }}
            onSelect={props.onSelect}
        />
    )
}

export * from "./component"
/** Connected ownership marker for Challenge attempt history. */
