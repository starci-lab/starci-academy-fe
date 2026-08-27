import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"

/** One immutable grading attempt shown by the history drawer. */
export type PersonalProjectHistoryAttempt = {
    readonly id: string
    readonly attemptNumber: number
    readonly score: number
    readonly passed: boolean
    readonly processedAt?: string
    readonly servedModel?: string
}

/** Copy resolved by the connected history owner. */
export type PersonalProjectHistoryLabels = {
    readonly summary: (count: number) => string
    readonly selectAttempt: (number: number, score: number) => string
    readonly passed: string
    readonly needsWork: string
    readonly previous: string
    readonly next: string
    readonly pending: string
    readonly empty: string
    readonly failed: string
}

/** Data and actions for the pure attempt-history renderer. */
export type PersonalProjectHistoryProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly attempts: ReadonlyArray<PersonalProjectHistoryAttempt>
        readonly attemptCount: number
        readonly selectedAttemptId?: string
        readonly page: number
        readonly pageSize: number
        readonly labels: PersonalProjectHistoryLabels
    }
    readonly on?: {
        readonly select?: (attempt: PersonalProjectHistoryAttempt) => void
        readonly previous?: () => void
        readonly next?: () => void
        readonly retry?: () => void
    }
}

/** Draw the independently stateful attempt history with ordinary semantic React markup. */
export const PersonalProjectHistoryBase = (props: PersonalProjectHistoryProps) => {
    const loading = props.state === "pending"
    const hasPrevious = props.props.page > 0
    const hasNext = (props.props.page + 1) * props.props.pageSize < props.props.attemptCount
    const notice = props.state === "pending"
        ? props.props.labels.pending
        : props.state === "failed"
            ? props.props.labels.failed
            : props.props.labels.empty

    return (
        <section aria-label={props.props.labels.summary(props.props.attemptCount)}>
            <Text props={{ content: props.props.labels.summary(props.props.attemptCount), size: "sm", tone: "muted" }} isLoading={loading} />
            {props.state === "ready" && props.props.attempts.length > 0 ? (
                <ul aria-label={props.props.labels.summary(props.props.attemptCount)}>
                    {props.props.attempts.map((attempt) => (
                        <li key={attempt.id}>
                            <Button
                                props={{
                                    label: props.props.labels.selectAttempt(attempt.attemptNumber, attempt.score),
                                    variant: attempt.id === props.props.selectedAttemptId ? "primary" : "secondary",
                                    size: "sm",
                                }}
                                on={{ press: () => props.on?.select?.(attempt) }}
                                isLoading={loading}
                            />
                            <Text
                                props={{
                                    content: [attempt.passed ? props.props.labels.passed : props.props.labels.needsWork, attempt.servedModel, attempt.processedAt]
                                        .filter(Boolean).join(" · "),
                                    size: "xs",
                                    tone: "muted",
                                }}
                                isLoading={loading}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <Text props={{ content: notice, live: props.state === "failed" ? "assertive" : "polite" }} isLoading={loading} />
            )}
            {hasPrevious || hasNext ? (
                <nav aria-label={props.props.labels.summary(props.props.attemptCount)}>
                    <Button props={{ label: props.props.labels.previous, disabled: !hasPrevious }} on={{ press: props.on?.previous }} />
                    <Button props={{ label: props.props.labels.next, disabled: !hasNext }} on={{ press: props.on?.next }} />
                </nav>
            ) : null}
        </section>
    )
}
