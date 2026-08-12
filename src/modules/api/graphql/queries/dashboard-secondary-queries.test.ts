import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryMyJobReadiness, queryMyJobReadinessMap, QueryMyJobReadiness } from "./query-my-job-readiness"
import { queryWeeklyChallenge, queryWeeklyChallengeMap, QueryWeeklyChallenge } from "./query-weekly-challenge"
import {
    queryMyContributionCalendar,
    queryMyContributionCalendarMap,
    QueryMyContributionCalendar,
} from "./query-my-contribution-calendar"
import { queryChangelogEntries, queryChangelogEntriesMap, QueryChangelogEntries } from "./query-changelog-entries"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("secondary dashboard query documents", () => {
    it("keeps the legacy payload fields needed by all five blocks", () => {
        expect(print(queryMyJobReadinessMap[QueryMyJobReadiness.Query1])).toContain("depthScore")
        expect(print(queryWeeklyChallengeMap[QueryWeeklyChallenge.Query1])).toContain("leaderboard {")
        expect(print(queryMyContributionCalendarMap[QueryMyContributionCalendar.Query1])).toContain("milestones")
        expect(print(queryChangelogEntriesMap[QueryChangelogEntries.Query1])).toContain("changelogEntries(limit: 4)")
    })

    it("uses authenticated clients for the viewer and dashboard operations", async () => {
        await queryMyJobReadiness()
        await queryWeeklyChallenge()
        await queryMyContributionCalendar()
        await queryChangelogEntries()
        expect(mocks.createApolloClient).toHaveBeenCalledTimes(4)
        for (const [options] of mocks.createApolloClient.mock.calls) {
            expect(options).toMatchObject({ withAuth: true })
        }
    })

    it("passes a selected contribution year and uses null for the current year", async () => {
        await queryMyContributionCalendar({ request: { year: 2026 } })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ year: 2026 })
        await queryMyContributionCalendar()
        expect(mocks.query.mock.calls[1][0].variables).toEqual({ year: null })
    })
})
