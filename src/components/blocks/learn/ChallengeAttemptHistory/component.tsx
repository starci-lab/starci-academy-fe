import { Button } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { challengeAttemptHistoryClassName, challengeAttemptHistoryRowClassName } from "./classNames"

/** One immutable Challenge grading attempt shown newest-first. */
export type ChallengeAttemptHistoryItem = {
    readonly id: string
    readonly attemptGroupId?: string
    readonly attemptNumber: number
    readonly score?: number
    readonly outcome: "evaluating" | "passed" | "needsRevision" | "unavailable"
    readonly servedModel?: string
    readonly processedAt?: string
}

/** Localized history copy resolved outside the pure block. */
export type ChallengeAttemptHistoryLabels = {
    readonly summary: (count: number) => string
    readonly attempt: (number: number, score?: number) => string
    readonly outcome: Readonly<Record<ChallengeAttemptHistoryItem["outcome"], string>>
    readonly pending: string
    readonly empty: string
    readonly failed: string
}

/** Pure attempt-history state and selection data. */
export type ChallengeAttemptHistoryProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly attempts: ReadonlyArray<ChallengeAttemptHistoryItem>
    readonly selectedAttemptId?: string
    readonly labels: ChallengeAttemptHistoryLabels
    readonly onSelect?: (attempt: ChallengeAttemptHistoryItem) => void
}

const resolveNotice = (props: ChallengeAttemptHistoryProps) => {
    if (props.state === "pending") return props.labels.pending
    if (props.state === "failed") return props.labels.failed
    return props.labels.empty
}

/** Draw immutable attempts without changing the selected result until the learner chooses one. */
export const ChallengeAttemptHistoryBase = (props: ChallengeAttemptHistoryProps) => {
    const notice = resolveNotice(props)
    return (
        <section className={challengeAttemptHistoryClassName} aria-label={props.labels.summary(props.attempts.length)}>
            <Text size={"sm"} tone={"muted"} isSkeleton={props.state === "pending"}>{props.labels.summary(props.attempts.length)}</Text>
            {props.state === "ready" ? props.attempts.map((attempt) => (
                <div key={attempt.id} className={challengeAttemptHistoryRowClassName}>
                    <Button variant={attempt.id === props.selectedAttemptId ? "primary" : "outline"} size="sm" onPress={() => props.onSelect?.(attempt)}>{props.labels.attempt(attempt.attemptNumber, attempt.score)}</Button>
                    <Text size={"xs"} tone={"muted"}>{[props.labels.outcome[attempt.outcome], attempt.servedModel, attempt.processedAt]
                        .filter(Boolean).join(" · ")}</Text>
                </div>
            )) : (
                <Text live={props.state === "failed" ? "assertive" : "polite"}>{notice}</Text>
            )}
        </section>
    )
}
