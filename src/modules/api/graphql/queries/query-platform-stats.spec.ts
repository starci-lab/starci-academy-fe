import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    QueryPlatformStats,
    queryPlatformStats,
    queryPlatformStatsMap,
} from "./query-platform-stats"

/**
 * What these tests guard: the document that goes on the wire and the client it goes through.
 * The transport is replaced wholesale - no request is ever made - because the interesting
 * failures here are a renamed field or a stray auth header, both of which are decided long
 * before the network is involved.
 */

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(queryPlatformStatsMap[QueryPlatformStats.Query1])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryPlatformStatsMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("query PlatformStats")
    })

    it("selects the whole envelope, not just the payload", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
    })

    it("selects every counter the payload type declares", () => {
        expect(documentText).toContain("totalLearners")
        expect(documentText).toContain("totalLessons")
        expect(documentText).toContain("totalCourses")
        expect(documentText).toContain("totalBadgesEarned")
    })

    it("takes no arguments at all", () => {
        expect(documentText).not.toContain("$request")
        expect(documentText).not.toContain("(")
    })
})

describe("queryPlatformStats", () => {
    it("sends the document for the default variant", async () => {
        await queryPlatformStats()
        expect(mocks.query).toHaveBeenCalledTimes(1)
        expect(mocks.query.mock.calls[0][0]).toEqual({
            query: queryPlatformStatsMap[QueryPlatformStats.Query1],
        })
    })

    it("sends no variables, because the query declares none", async () => {
        await queryPlatformStats()
        expect(mocks.query.mock.calls[0][0].variables).toBeUndefined()
    })

    it("builds an anonymous client - no token is attached to a public query", async () => {
        await queryPlatformStats()
        expect(mocks.createApolloClient.mock.calls[0][0]).not.toHaveProperty("withAuth", true)
    })

    it("passes the abort signal through to the client", async () => {
        const controller = new AbortController()
        await queryPlatformStats({ signal: controller.signal })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
        })
    })

    it("passes extra headers through to the client", async () => {
        await queryPlatformStats({ headers: { "X-Locale": "en" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            headers: { "X-Locale": "en" },
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { platformStats: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryPlatformStats()).resolves.toBe(result)
    })
})
