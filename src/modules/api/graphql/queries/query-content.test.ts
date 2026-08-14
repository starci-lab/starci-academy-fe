import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { QueryContent, queryContent, queryContentMap } from "./query-content"

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

const documentText = print(queryContentMap[QueryContent.Query1])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryContentMap", () => {
    it("selects the synchronized source identity without asking GitHub for source", () => {
        for (const field of ["isSandbox", "githubBaseUrl", "githubDir", "backendUrl"]) {
            expect(documentText).toContain(field)
        }
        expect(documentText).not.toContain("repoFiles")
        expect(documentText).not.toContain("githubToken")
    })
})

describe("queryContent", () => {
    it("sends the requested content id through the authenticated client", async () => {
        await queryContent({ request: { id: "content-1" } })

        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentMap[QueryContent.Query1],
            variables: { request: { id: "content-1" } },
        })
    })

    it("passes abort and headers to the transport owner", async () => {
        const controller = new AbortController()
        await queryContent({
            request: { displayId: "async-patterns" },
            headers: { "X-Locale": "vi" },
            signal: controller.signal,
        })

        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({
            headers: { "X-Locale": "vi" },
            signal: controller.signal,
        }))
    })
})
