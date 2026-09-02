import { Button } from "@starci/grammar/common"

import { Badge } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import {
    personalProjectHistoryClassName,
    personalProjectHistoryListClassName,
    personalProjectHistoryNavClassName,
    personalProjectHistoryRowClassName,
} from "./classNames"

/** One immutable grading attempt shown by the history drawer. */
export type PersonalProjectHistoryAttempt = {
    readonly id: string
    readonly attemptNumber: number
    readonly score: number
    readonly passed: boolean
    readonly processedAt?: string
    readonly servedModel?: string
    readonly servedProvider?: string
}

/** Copy resolved by the connected history owner. */
export type PersonalProjectHistoryLabels = {
    readonly summary: (count: number) => string
    readonly selectAttempt: (number: number, score: number) => string
    readonly passed: string
    readonly needsWork: string
    readonly selected: string
    readonly previous: string
    readonly next: string
    readonly pending: string
    readonly empty: string
    readonly failed: string
    readonly retry: string
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
        <section className={personalProjectHistoryClassName} aria-label={props.props.labels.summary(props.props.attemptCount)}>
            <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.labels.summary(props.props.attemptCount)}</Text>
            {props.state === "ready" && props.props.attempts.length > 0 ? (
                <ul className={personalProjectHistoryListClassName} aria-label={props.props.labels.summary(props.props.attemptCount)}>
                    {props.props.attempts.map((attempt) => {
                        const selected = attempt.id === props.props.selectedAttemptId
                        return (
                            <li className={personalProjectHistoryRowClassName} key={attempt.id}>
                                {selected ? <Badge tone={"accent"}>{props.props.labels.selected}</Badge> : null}
                                {selected ? <Text weight={"semibold"}>{props.props.labels.selectAttempt(attempt.attemptNumber, attempt.score)}</Text> : <Button variant={"outline"} size={"sm"} isSkeleton={loading} onPress={({ press: () => props.on?.select?.(attempt) })?.press}>{props.props.labels.selectAttempt(attempt.attemptNumber, attempt.score)}</Button>}
                                <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{[attempt.passed ? props.props.labels.passed : props.props.labels.needsWork, attempt.servedProvider, attempt.servedModel, attempt.processedAt]
                                    .filter(Boolean).join(" · ")}</Text>
                            </li>
                        )
                    })}
                </ul>
            ) : props.state === "pending" ? (
                <Text live={"polite"} isSkeleton>{notice}</Text>
            ) : <EmptyNotice message={notice} actionLabel={props.state === "failed" ? props.props.labels.retry : undefined} iconSource={iconSourceFor(props.state === "failed" ? "retry" : "saved", "leading")} onAction={({ act: props.on?.retry })?.act} />}
            {hasPrevious || hasNext ? (
                <nav className={personalProjectHistoryNavClassName} aria-label={props.props.labels.summary(props.props.attemptCount)}>
                    <Button isDisabled={!hasPrevious} onPress={props.on?.previous}>{props.props.labels.previous}</Button>
                    <Button isDisabled={!hasNext} onPress={props.on?.next}>{props.props.labels.next}</Button>
                </nav>
            ) : null}
        </section>
    )
}
