import { type GraphQLResponse } from "../../types"

/**
 * One calendar day of the streak strip.
 *
 * `date` is a plain `YYYY-MM-DD` string, not a timestamp, because a streak is counted in
 * calendar days rather than in instants - handing the client a timestamp would invite it to
 * re-derive the day in the reader's own zone and disagree with the server about which day
 * a lesson landed on.
 */
export interface MyWeeklyStatsDay {
    /** Calendar day, `YYYY-MM-DD`. */
    date: string
    /** Whether the learner earned anything that day. */
    active: boolean
}

/**
 * The weekly standing figures the dashboard reads.
 *
 * The back end's `MyWeeklyStatsData` also carries `xp`, `lessons`, `weeklyGoalLessons` and
 * `streakFreezes`. They are left unselected for the same reason the course counters are: no
 * surface here renders them yet, and the query grows when a surface does.
 */
export interface MyWeeklyStatsData {
    /** Consecutive active days up to today. */
    streak: number
    /** Longest run of consecutive active days ever reached. */
    longestStreak: number
    /** XP earned during the rolling seven-day window. */
    xp: number
    /** Lessons read during the rolling seven-day window. */
    lessons: number
    /** The learner's chosen weekly lesson target, or null when unset. */
    weeklyGoalLessons: number | null
    /** Streak freezes currently owned. */
    streakFreezes: number
    /** The last seven calendar days, oldest first. */
    days: Array<MyWeeklyStatsDay>
}

/** The response shape of the `myWeeklyStats` query, envelope included. */
export interface QueryMyWeeklyStatsResponse {
    /** The top-level field, wrapping the standard envelope. */
    myWeeklyStats: GraphQLResponse<MyWeeklyStatsData>
}
