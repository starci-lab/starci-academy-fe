import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QueryContentAiSessions,
    queryContentAiSessions,
    queryContentAiSessionsMap,
} from "./query-content-ai-sessions"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryContentAiSessions", () => {
    it("matches the backend operation and complete session summary", () => {
        const document = print(queryContentAiSessionsMap[QueryContentAiSessions.Query1])
        expect(document).toContain("query ContentAiSessions")
        expect(document).toContain("contentAiSessions(request: $request)")
        for (const field of [
            "id", "title", "updatedAt", "messageCount", "scope",
            "originContentId", "originContentTitle", "snippet",
        ]) expect(document).toContain(field)
    })

    it("uses auth and forwards the exact scope/search request", async () => {
        const request = { scope: "content" as const, contentId: "content-1", search: "abort" }
        await queryContentAiSessions({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentAiSessionsMap[QueryContentAiSessions.Query1],
            variables: { request },
        })
    })

    it("sends an empty request for the global default list", async () => {
        await queryContentAiSessions()
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: {} })
    })
})
