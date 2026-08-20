import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MutationSetContentAiSessionArchived,
    mutationSetContentAiSessionArchived,
    mutationSetContentAiSessionArchivedMap,
} from "./mutation-set-content-ai-session-archived"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationSetContentAiSessionArchived", () => {
    it("matches the reversible backend mutation", () => {
        const document = print(mutationSetContentAiSessionArchivedMap[MutationSetContentAiSessionArchived.Mutation1])
        expect(document).toContain("setContentAiSessionArchived(request: $request)")
        expect(document).toContain("archived")
    })

    it("forwards the requested archive state with auth", async () => {
        const request = { sessionId: "session-1", archived: false }
        await mutationSetContentAiSessionArchived({ request })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
    })
})
