import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    QueryMyWeeklyStats,
    queryMyWeeklyStats,
    queryMyWeeklyStatsMap,
} from "./query-my-weekly-stats"

/**
 * What these tests guard: the document that goes on the wire and the client it goes through.
 * The nested `days` selection is the one worth asserting - a payload that arrived without it
 * would leave the strip drawing an empty week that looks exactly like a genuine one.
 */

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(queryMyWeeklyStatsMap[QueryMyWeeklyStats.Query1])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryMyWeeklyStatsMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("query MyWeeklyStats")
    })

    it("selects the whole envelope, not just the payload", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
    })

    it("selects both streak figures", () => {
        expect(documentText).toContain("streak")
        expect(documentText).toContain("longestStreak")
    })

    it("descends into the days, rather than asking for the bare list", () => {
        expect(documentText).toContain("days {")
        expect(documentText).toContain("date")
        expect(documentText).toContain("active")
    })

    it("selects nothing the payload type does not declare", () => {
        for (const unread of ["weeklyGoalLessons", "streakFreezes"]) {
            expect(documentText).not.toContain(unread)
        }
    })

    it("takes no arguments at all", () => {
        expect(documentText).not.toContain("$request")
    })
})

describe("queryMyWeeklyStats", () => {
    it("sends the document for the default variant", async () => {
        await queryMyWeeklyStats()
        expect(mocks.query).toHaveBeenCalledTimes(1)
        expect(mocks.query.mock.calls[0][0]).toEqual({
            query: queryMyWeeklyStatsMap[QueryMyWeeklyStats.Query1],
        })
    })

    it("sends no variables, because the query declares none", async () => {
        await queryMyWeeklyStats()
        expect(mocks.query.mock.calls[0][0].variables).toBeUndefined()
    })

    it("builds an AUTHENTICATED client - the server refuses this query without a token", async () => {
        await queryMyWeeklyStats()
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("passes the abort signal through to the client", async () => {
        const controller = new AbortController()
        await queryMyWeeklyStats({ signal: controller.signal })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
        })
    })

    it("passes extra headers through to the client", async () => {
        await queryMyWeeklyStats({ headers: { "X-Locale": "en" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            headers: { "X-Locale": "en" },
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { myWeeklyStats: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryMyWeeklyStats()).resolves.toBe(result)
    })
})
