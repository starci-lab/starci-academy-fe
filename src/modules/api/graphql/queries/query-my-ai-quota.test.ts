import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { QueryMyAiQuota, queryMyAiQuota, queryMyAiQuotaMap } from "./query-my-ai-quota"

/**
 * What these tests guard: the document that goes on the wire and the client it goes through.
 * The interesting assertion is the NESTING - `credit` is an object on the back end, and a
 * document that asked for `remainingWeek` at the top level would be rejected by the server
 * rather than by anything in this repository.
 */

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(queryMyAiQuotaMap[QueryMyAiQuota.Query1])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryMyAiQuotaMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("query MyAiQuota")
    })

    it("selects the whole envelope, not just the payload", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
    })

    it("descends into credit, because the weekly pair lives one level down", () => {
        expect(documentText).toContain("credit {")
        expect(documentText).toContain("limitWeek")
        expect(documentText).toContain("remainingWeek")
    })

    it("asks for the weekly window only, not the five-hour one", () => {
        expect(documentText).not.toContain("limit5h")
        expect(documentText).not.toContain("remaining5h")
        expect(documentText).not.toContain("usedWeek")
    })

    it("selects nothing the payload type does not declare", () => {
        for (const unread of ["tier", "allowedCategories", "windowWeekResetAt", "ceil"]) {
            expect(documentText).not.toContain(unread)
        }
    })

    it("takes no arguments at all", () => {
        expect(documentText).not.toContain("$request")
    })
})

describe("queryMyAiQuota", () => {
    it("sends the document for the default variant", async () => {
        await queryMyAiQuota()
        expect(mocks.query).toHaveBeenCalledTimes(1)
        expect(mocks.query.mock.calls[0][0]).toEqual({
            query: queryMyAiQuotaMap[QueryMyAiQuota.Query1],
        })
    })

    it("sends no variables, because the query declares none", async () => {
        await queryMyAiQuota()
        expect(mocks.query.mock.calls[0][0].variables).toBeUndefined()
    })

    it("builds an AUTHENTICATED client - the server refuses this query without a token", async () => {
        await queryMyAiQuota()
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("passes the abort signal through to the client", async () => {
        const controller = new AbortController()
        await queryMyAiQuota({ signal: controller.signal })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
        })
    })

    it("passes extra headers through to the client", async () => {
        await queryMyAiQuota({ headers: { "X-Locale": "en" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            headers: { "X-Locale": "en" },
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { myAiQuota: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryMyAiQuota()).resolves.toBe(result)
    })
})
