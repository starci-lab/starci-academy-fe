import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MutationTouchContentAiSession,
    mutationTouchContentAiSession,
    mutationTouchContentAiSessionMap,
} from "./mutation-touch-content-ai-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationTouchContentAiSession", () => {
    it("matches the backend mutation and touched result", () => {
        const document = print(mutationTouchContentAiSessionMap[MutationTouchContentAiSession.Mutation1])
        expect(document).toContain("touchContentAiSession(request: $request)")
        expect(document).toContain("touched")
    })

    it("forwards the just-opened session id with auth", async () => {
        const request = { sessionId: "session-1" }
        await mutationTouchContentAiSession({ request })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
    })
})
