import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    QueryMyRewardWallet,
    queryMyRewardWallet,
    queryMyRewardWalletMap,
} from "./query-my-reward-wallet"

/**
 * What these tests guard: the document that goes on the wire and the client it goes through.
 * `redemptions` sits beside `balance` and is a whole history; the test that it stays UNASKED
 * is the one that keeps a one-number row from quietly becoming an expensive request.
 */

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(queryMyRewardWalletMap[QueryMyRewardWallet.Query1])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryMyRewardWalletMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("query MyRewardWallet")
    })

    it("selects the whole envelope, not just the payload", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
    })

    it("selects the balance", () => {
        expect(documentText).toContain("balance")
    })

    it("leaves the redemption history unasked", () => {
        expect(documentText).not.toContain("redemptions")
        expect(documentText).not.toContain("spent")
    })

    it("takes no arguments at all", () => {
        expect(documentText).not.toContain("$request")
    })
})

describe("queryMyRewardWallet", () => {
    it("sends the document for the default variant", async () => {
        await queryMyRewardWallet()
        expect(mocks.query).toHaveBeenCalledTimes(1)
        expect(mocks.query.mock.calls[0][0]).toEqual({
            query: queryMyRewardWalletMap[QueryMyRewardWallet.Query1],
        })
    })

    it("sends no variables, because the query declares none", async () => {
        await queryMyRewardWallet()
        expect(mocks.query.mock.calls[0][0].variables).toBeUndefined()
    })

    it("builds an AUTHENTICATED client - the server refuses this query without a token", async () => {
        await queryMyRewardWallet()
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("passes the abort signal through to the client", async () => {
        const controller = new AbortController()
        await queryMyRewardWallet({ signal: controller.signal })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
        })
    })

    it("passes extra headers through to the client", async () => {
        await queryMyRewardWallet({ headers: { "X-Locale": "en" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            headers: { "X-Locale": "en" },
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { myRewardWallet: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryMyRewardWallet()).resolves.toBe(result)
    })
})
