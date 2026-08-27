import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
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
            <Text
                props={{ content: props.labels.summary(props.attempts.length), size: "sm", tone: "muted" }}
                isLoading={props.state === "pending"}
            />
            {props.state === "ready" ? props.attempts.map((attempt) => (
                <div key={attempt.id} className={challengeAttemptHistoryRowClassName}>
                    <Button
                        props={{
                            label: props.labels.attempt(attempt.attemptNumber, attempt.score),
                            variant: attempt.id === props.selectedAttemptId ? "primary" : "outline",
                            size: "sm",
                        }}
                        on={{ press: () => props.onSelect?.(attempt) }}
                    />
                    <Text
                        props={{
                            content: [props.labels.outcome[attempt.outcome], attempt.servedModel, attempt.processedAt]
                                .filter(Boolean).join(" · "),
                            size: "xs",
                            tone: "muted",
                        }}
                    />
                </div>
            )) : (
                <Text props={{ content: notice, live: props.state === "failed" ? "assertive" : "polite" }} />
            )}
        </section>
    )
}
