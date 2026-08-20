import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MutationDeleteContentAiSession,
    mutationDeleteContentAiSession,
    mutationDeleteContentAiSessionMap,
} from "./mutation-delete-content-ai-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationDeleteContentAiSession", () => {
    it("matches the backend mutation and cleared result", () => {
        const document = print(mutationDeleteContentAiSessionMap[MutationDeleteContentAiSession.Mutation1])
        expect(document).toContain("deleteContentAiSession(request: $request)")
        expect(document).toContain("cleared")
    })

    it("forwards the owned session id with auth", async () => {
        const request = { sessionId: "session-1" }
        await mutationDeleteContentAiSession({ request })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
    })
})
