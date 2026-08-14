import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MutationRenameContentAiSession,
    mutationRenameContentAiSession,
    mutationRenameContentAiSessionMap,
} from "./mutation-rename-content-ai-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationRenameContentAiSession", () => {
    it("matches the backend operation and result field", () => {
        const document = print(mutationRenameContentAiSessionMap[MutationRenameContentAiSession.Mutation1])
        expect(document).toContain("renameContentAiSession(request: $request)")
        expect(document).toContain("renamed")
    })

    it("forwards a blank reset title unchanged", async () => {
        const request = { sessionId: "session-1", title: "" }
        await mutationRenameContentAiSession({ request })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
    })
})
