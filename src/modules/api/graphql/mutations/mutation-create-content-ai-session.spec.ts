import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MutationCreateContentAiSession,
    mutationCreateContentAiSession,
    mutationCreateContentAiSessionMap,
} from "./mutation-create-content-ai-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationCreateContentAiSession", () => {
    it("selects the nullable id from the backend operation", () => {
        const document = print(mutationCreateContentAiSessionMap[MutationCreateContentAiSession.Mutation1])
        expect(document).toContain("mutation CreateContentAiSession")
        expect(document).toContain("createContentAiSession(request: $request)")
        expect(document).toContain("id")
    })

    it("sends every supported anchor and born-archived flag with auth", async () => {
        const request = { scope: "content" as const, contentId: "content-1", archived: true }
        await mutationCreateContentAiSession({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: mutationCreateContentAiSessionMap[MutationCreateContentAiSession.Mutation1],
            variables: { request },
        })
    })
})
