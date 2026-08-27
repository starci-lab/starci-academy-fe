import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"

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

/** Pure attempt-history state and selection contract. */
export type ChallengeAttemptHistoryBaseProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly attempts: ReadonlyArray<ChallengeAttemptHistoryItem>
    readonly selectedAttemptId?: string
    readonly labels: ChallengeAttemptHistoryLabels
    readonly onSelect?: (attempt: ChallengeAttemptHistoryItem) => void
}

const resolveNotice = (input: ChallengeAttemptHistoryBaseProps) => {
    if (input.state === "pending") return input.labels.pending
    if (input.state === "failed") return input.labels.failed
    return input.labels.empty
}

/** Draw immutable attempts without changing the selected result until the learner chooses one. */
export const ChallengeAttemptHistoryBase = (input: ChallengeAttemptHistoryBaseProps) => {
    const notice = resolveNotice(input)
    return (
        <Tree
            contract="challenge-attempt-history-drawer"
            render={defineContractComponent("challenge-attempt-history-drawer", {
                summary: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text
                        props={{ content: input.labels.summary(input.attempts.length), size: "sm", tone: "muted" }}
                        isLoading={input.state === "pending"}
                    />
                )),
                ...(input.state === "ready" ? {
                    attempt: input.attempts.map((attempt) => defineContractComponent("challenge-attempt-history-row", {
                        action: defineLeafComponent("button", {}, () => (
                            <Button
                                props={{
                                    label: input.labels.attempt(attempt.attemptNumber, attempt.score),
                                    variant: attempt.id === input.selectedAttemptId ? "primary" : "outline",
                                    size: "sm",
                                }}
                                on={{ press: () => input.onSelect?.(attempt) }}
                            />
                        )),
                        meta: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text
                                props={{
                                    content: [input.labels.outcome[attempt.outcome], attempt.servedModel, attempt.processedAt]
                                        .filter(Boolean).join(" · "),
                                    size: "xs",
                                    tone: "muted",
                                }}
                            />
                        )),
                    })),
                } : {
                    notice: defineLeafComponent("text", {}, () => (
                        <Text props={{ content: notice, live: input.state === "failed" ? "assertive" : "polite" }} />
                    )),
                }),
            })}
        />
    )
}

/** Pure ownership marker for Challenge history. */
export const meta = { shape: "block", world: "pure", domain: "learn" } as const
