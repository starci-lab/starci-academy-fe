import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

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

/** Pure attempt-history states, data and actions. */
export type PersonalProjectHistoryBlockProps = {
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

/** Draw only the independently stateful history workspace inside its drawer. */
export const PersonalProjectHistoryBase = (input: PersonalProjectHistoryBlockProps) => {
    const loading = input.state === "pending"
    const hasPrevious = input.props.page > 0
    const hasNext = (input.props.page + 1) * input.props.pageSize < input.props.attemptCount
    const attempts = input.props.attempts.map((attempt) => defineContractComponent("personal-project-attempt-row", {
        action: defineLeafComponent("button", {}, () => (
            <Button
                props={{
                    label: input.props.labels.selectAttempt(attempt.attemptNumber, attempt.score),
                    variant: attempt.id === input.props.selectedAttemptId ? "primary" : "secondary",
                    size: "sm",
                }}
                on={{ press: () => input.on?.select?.(attempt) }}
                isLoading={loading}
            />
        )),
        meta: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text
                props={{
                    content: [attempt.passed ? input.props.labels.passed : input.props.labels.needsWork, attempt.servedModel, attempt.processedAt]
                        .filter(Boolean).join(" · "),
                    size: "xs",
                    tone: "muted",
                }}
                isLoading={loading}
            />
        )),
    }))
    const notice = input.state === "pending"
        ? input.props.labels.pending
        : input.state === "failed"
            ? input.props.labels.failed
            : input.props.labels.empty

    return (
        <Tree contract="personal-project-attempt-history-drawer" render={defineContractComponent("personal-project-attempt-history-drawer", {
            summary: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: input.props.labels.summary(input.props.attemptCount), size: "sm", tone: "muted" }} isLoading={loading} />
            )),
            ...(input.state === "ready" && attempts.length > 0
                ? { attempt: attempts }
                : { notice: defineLeafComponent("text", {}, () => <Text props={{ content: notice, live: input.state === "failed" ? "assertive" : "polite" }} isLoading={loading} />) }),
            ...(!hasPrevious && !hasNext ? {} : {
                pagination: defineContractComponent("stacked-peer-controls", { control: [
                    defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.previous, disabled: !hasPrevious }} on={{ press: input.on?.previous }} />),
                    defineLeafComponent("button", {}, () => <Button props={{ label: input.props.labels.next, disabled: !hasNext }} on={{ press: input.on?.next }} />),
                ] }),
            }),
        })} />
    )
}

/** Source-level ownership marker for the pure history renderer. */
export const meta = { world: "pure", domain: "learn" } as const
