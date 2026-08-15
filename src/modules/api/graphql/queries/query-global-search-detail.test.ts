import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryGlobalSearchDetail } from "./query-global-search-detail"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: { detail: { data: { id: "one", title: "One", description: "Detail" } } } })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("queryGlobalSearchDetail", () => {
    it.each([
        ["courses", "course", { request: { displayId: "display-one" } }],
        ["modules", "module", { request: { id: "one" } }],
        ["contents", "content", { request: { id: "one" } }],
        ["challenges", "challenge", { request: { id: "one" } }],
        ["flashcardDecks", "flashcardDeck", { id: "one" }],
        ["milestones", "milestone", { request: { id: "one" } }],
        ["milestoneTasks", "task", { request: { id: "one" } }],
        ["foundations", "foundation", { request: { id: "one" } }],
    ] as const)("dispatches %s through its canonical %s detail root", async (bucket, root, variables) => {
        await expect(queryGlobalSearchDetail({ bucket, id: "one", displayId: "display-one" })).resolves.toEqual({ id: "one", title: "One", description: "Detail" })
        const call = mocks.query.mock.calls.at(-1)?.[0] as { query: Parameters<typeof print>[0]; variables: unknown; fetchPolicy: string }
        expect(print(call.query)).toContain(`detail: ${root}`)
        expect(call.variables).toEqual(variables)
        expect(call.fetchPolicy).toBe("no-cache")
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
    })
})

