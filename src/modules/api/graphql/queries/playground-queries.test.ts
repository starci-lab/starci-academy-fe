import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryPlayground, QueryPlayground } from "./query-playground"
import { queryPlaygrounds, QueryPlaygrounds } from "./query-playgrounds"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("queryPlayground", () => {
    it("resolves one playground by slug on a client that never asks for auth", async () => {
        const result = { data: { playground: { success: true, message: "ok", data: null } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryPlayground({ slug: "docker-basics" })).resolves.toBe(result)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).not.toHaveProperty("withAuth")
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ slug: "docker-basics" })
    })

    it("selects the ordered guided steps and their learner-facing hints", async () => {
        await queryPlayground({ slug: "docker-basics" })
        const document = print(mocks.query.mock.calls[0][0].query)
        for (const field of ["sortIndex", "commandHint", "actionHint", "steps {"]) {
            expect(document).toContain(field)
        }
    })

    it("forwards the transport options for a server-rendered read", async () => {
        const signal = new AbortController().signal
        await queryPlayground({ slug: "k8s-intro", headers: { "x-trace-id": "trace-vi" }, signal, debug: true })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ headers: { "x-trace-id": "trace-vi" }, signal, debug: true })
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("playground offline"))
        await expect(queryPlayground({ slug: "docker-basics" })).rejects.toThrow("playground offline")
    })

    it("names exactly one document variant", () => {
        expect(QueryPlayground.Query1).toBe("query1")
    })
})

describe("queryPlaygrounds", () => {
    it("lists a course's playgrounds on a client that never asks for auth", async () => {
        const result = { data: { playgrounds: { success: true, message: "ok", data: [] } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryPlaygrounds({ courseId: "course-1" })).resolves.toBe(result)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).not.toHaveProperty("withAuth")
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: "course-1" })
    })

    it("selects the compact catalog row the course page renders", async () => {
        await queryPlaygrounds({ courseId: "course-1" })
        expect(print(mocks.query.mock.calls[0][0].query)).toContain("stepCount")
    })

    it("forwards the transport options for a server-rendered read", async () => {
        const signal = new AbortController().signal
        await queryPlaygrounds({ courseId: "course-2", headers: { "x-trace-id": "trace-en" }, signal, debug: false })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ headers: { "x-trace-id": "trace-en" }, signal, debug: false })
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("catalog offline"))
        await expect(queryPlaygrounds({ courseId: "course-1" })).rejects.toThrow("catalog offline")
    })

    it("names exactly one document variant", () => {
        expect(QueryPlaygrounds.Query1).toBe("query1")
    })
})
