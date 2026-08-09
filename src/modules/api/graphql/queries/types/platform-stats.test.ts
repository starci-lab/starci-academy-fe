import { describe, expect, it } from "vitest"
import { type PlatformStatsData, type QueryPlatformStatsResponse } from "./platform-stats"

/**
 * What these tests guard: the payload sits UNDER the envelope, not beside it. Every caller
 * unwraps `platformStats.data`, so a type that flattened the envelope away would compile at
 * the query and break at every reader instead.
 */

describe("QueryPlatformStatsResponse", () => {
    it("nests the counters under the standard envelope", () => {
        const response: QueryPlatformStatsResponse = {
            platformStats: {
                success: true,
                message: "ok",
                data: {
                    totalLearners: 10,
                    totalLessons: 20,
                    totalCourses: 3,
                    totalBadgesEarned: 40,
                },
            },
        }
        expect(response.platformStats.data?.totalLearners).toBe(10)
        expect(response.platformStats.data?.totalBadgesEarned).toBe(40)
    })

    it("describes a failure with no counters at all", () => {
        const response: QueryPlatformStatsResponse = {
            platformStats: { success: false, message: "unavailable", error: "UPSTREAM" },
        }
        expect(response.platformStats.data).toBeUndefined()
    })
})

describe("PlatformStatsData", () => {
    it("holds four numeric counters and nothing else", () => {
        const data: PlatformStatsData = {
            totalLearners: 1,
            totalLessons: 2,
            totalCourses: 3,
            totalBadgesEarned: 4,
        }
        expect(Object.keys(data)).toEqual([
            "totalLearners",
            "totalLessons",
            "totalCourses",
            "totalBadgesEarned",
        ])
        expect(Object.values(data).every((value) => typeof value === "number")).toBe(true)
    })
})
