import { describe, expect, it } from "vitest"
import {
    type MyWeeklyStatsData,
    type MyWeeklyStatsDay,
    type QueryMyWeeklyStatsResponse,
} from "./my-weekly-stats"

/**
 * What these tests guard: `date` stays a plain calendar string. The streak strip parses it
 * as `${date}T00:00:00Z` and formats it in UTC, so a type that widened to a timestamp would
 * silently shift a day across the date line for readers west of Greenwich.
 */

/** One day, spelled exactly as the back end spells it. */
const day: MyWeeklyStatsDay = { date: "2026-08-03", active: true }

/** A healthy payload: a live streak and a full week behind it. */
const stats: MyWeeklyStatsData = {
    streak: 3,
    longestStreak: 11,
    xp: 240,
    lessons: 4,
    weeklyGoalLessons: 5,
    streakFreezes: 1,
    days: [day],
}

describe("QueryMyWeeklyStatsResponse", () => {
    it("nests the week under the standard envelope", () => {
        const response: QueryMyWeeklyStatsResponse = {
            myWeeklyStats: { success: true, message: "ok", data: stats },
        }
        expect(response.myWeeklyStats.data?.streak).toBe(3)
        expect(response.myWeeklyStats.data?.days[0].date).toBe("2026-08-03")
    })

    it("describes a failure with no week at all", () => {
        const response: QueryMyWeeklyStatsResponse = {
            myWeeklyStats: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" },
        }
        expect(response.myWeeklyStats.data).toBeUndefined()
    })
})

describe("MyWeeklyStatsData", () => {
    it("carries the shared streak, goal and freeze figures selected by the document", () => {
        expect(Object.keys(stats)).toEqual([
            "streak",
            "longestStreak",
            "xp",
            "lessons",
            "weeklyGoalLessons",
            "streakFreezes",
            "days",
        ])
    })

    it("keeps a day as a calendar string the strip can parse as UTC midnight", () => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(Number.isNaN(new Date(`${day.date}T00:00:00Z`).getTime())).toBe(false)
    })

    it("describes a learner with no activity as a week of inactive days", () => {
        const empty: MyWeeklyStatsData = {
            streak: 0,
            longestStreak: 0,
            xp: 0,
            lessons: 0,
            weeklyGoalLessons: null,
            streakFreezes: 0,
            days: [{ date: "2026-08-03", active: false }],
        }
        expect(empty.days.some((entry) => entry.active)).toBe(false)
    })
})
