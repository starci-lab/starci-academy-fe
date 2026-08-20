import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QueryContentAiHistory,
    queryContentAiHistory,
    queryContentAiHistoryMap,
} from "./query-content-ai-history"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryContentAiHistory", () => {
    it("uses the backend field name and selects saved role/content pairs", () => {
        const document = print(queryContentAiHistoryMap[QueryContentAiHistory.Query1])
        expect(document).toContain("query ContentAiHistory")
        expect(document).toContain("contentAiSessionMessages(request: $request)")
        expect(document).toContain("role")
        expect(document).toContain("content")
    })

    it("sends the owned session through an authenticated client", async () => {
        await queryContentAiHistory({ request: { sessionId: "session-1" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentAiHistoryMap[QueryContentAiHistory.Query1],
            variables: { request: { sessionId: "session-1" } },
        })
    })
})
