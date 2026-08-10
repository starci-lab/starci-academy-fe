import { type GraphQLResponse } from "../../types"

/**
 * Which of the day's tasks a row is.
 *
 * A CLOSED UNION, NOT `string`, so a key the server stops sending is a compile error at the one
 * place that turns a key into words - rather than a row that silently renders its own enum name at
 * a reader.
 */
export type DailyQuestKey =
    | "readContent"
    | "passChallenge"
    | "reviewFlashcards"
    | "mockInterview"
    | "quizSession"

/** One task of the day, and how far along it is. */
export interface MyDailyQuestTask {
    /** Which task this is. */
    key: DailyQuestKey
    /** How much of it the learner has done today. */
    current: number
    /** How much of it counts as done. */
    target: number
}

/**
 * The day's quest.
 *
 * `allDone` AND `claimed` ARE BOTH SENT, and neither is derivable from the other: finishing every
 * task is not the same as having collected for it, and a screen that inferred one from the other
 * would either offer a reward twice or never offer it at all.
 */
export interface MyDailyQuestData {
    /** Calendar day the quest belongs to, `YYYY-MM-DD`. */
    date: string
    /** The tasks, in the server's own order. */
    tasks: Array<MyDailyQuestTask>
    /** Whether every task has reached its target. */
    allDone: boolean
    /** Whether the reward for the day has already been collected. */
    claimed: boolean
    /** What finishing the day is worth, in coins. */
    reward: number
}

/** The response shape of the `myDailyQuest` query, envelope included. */
export interface QueryMyDailyQuestResponse {
    /** The top-level field, wrapping the standard envelope. */
    myDailyQuest: GraphQLResponse<MyDailyQuestData>
}
