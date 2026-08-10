import { type GraphQLResponse } from "../../types"

/**
 * Which weekly metric a row is.
 *
 * A CLOSED UNION, NOT `string`, so a key the server stops sending is a compile error at the one
 * place that turns a key into words - rather than a row that silently renders its own enum name at
 * a reader.
 */
export type KpiKey =
    | "lessons"
    | "studyDays"
    | "challenges"
    | "coding"
    | "flashcards"
    | "milestones"

/**
 * One weekly metric.
 *
 * `target` IS NULLABLE, AND THAT NULL IS THE WHOLE FEATURE. A metric with no target is not a
 * target of zero - it is a target the learner has not set, which is a different screen: the one
 * that invites them to set one. Collapsing the two would show somebody a goal they never chose,
 * already met.
 */
export interface MyKpiItem {
    /** Which metric this is. */
    key: KpiKey
    /** How far the learner has got this week. */
    current: number
    /** What they aimed for, or `null` when they have not set one. */
    target: number | null
    /** What meeting it is worth, in coins, or `null` when there is no target to meet. */
    coinReward: number | null
    /** Whether the coins for this metric have already been collected. */
    claimed: boolean
    /** Whether the metric is met AND uncollected - the only state in which a claim is offered. */
    canClaim: boolean
}

/** The week as one figure, across every metric that has a target. */
export interface MyKpiComposite {
    /** How much of the week is done, 0-100. */
    percent: number
    /** How many metrics have been met. */
    completed: number
    /** How many metrics have a target at all. */
    total: number
}

/** The learner's week. */
export interface MyKpisData {
    /** The metrics, in the server's own order. */
    items: Array<MyKpiItem>
    /** The week as one figure. */
    composite: MyKpiComposite | null
    /** When the week rolls over, as an instant. */
    resetAt: string | null
}

/** The response shape of the `myKpis` query, envelope included. */
export interface QueryMyKpisResponse {
    /** The top-level field, wrapping the standard envelope. */
    myKpis: GraphQLResponse<MyKpisData>
}
