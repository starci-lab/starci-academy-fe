import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    QuerySandboxRepoUrl,
    querySandboxRepoUrl,
    querySandboxRepoUrlMap,
} from "./query-sandbox-repo-url"

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

const documentText = print(querySandboxRepoUrlMap[QuerySandboxRepoUrl.Query1])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("querySandboxRepoUrlMap", () => {
    it("selects the direct scalar returned by the backend resolver", () => {
        expect(documentText).toContain("query SandboxRepoUrl")
        expect(documentText).toContain("sandboxRepoUrl(request: $request)")
        expect(documentText).not.toContain("success")
        expect(documentText).not.toContain("data {")
    })
})

describe("querySandboxRepoUrl", () => {
    it("uses auth and forwards the content id", async () => {
        await querySandboxRepoUrl({ request: { contentId: "content-1" } })

        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
        expect(mocks.query).toHaveBeenCalledWith({
            query: querySandboxRepoUrlMap[QuerySandboxRepoUrl.Query1],
            variables: { request: { contentId: "content-1" } },
        })
    })
})
