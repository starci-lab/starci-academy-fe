import { beforeEach, describe, expect, it, vi } from "vitest"
import { type DocumentNode, print } from "graphql"
import { queryCodingDomainSummary } from "./query-coding-domain-summary"
import { queryCodingProblem } from "./query-coding-problem"
import { queryCodingProblems } from "./query-coding-problems"
import { queryMyCodingProgress } from "./query-my-coding-progress"

/**
 * What these tests guard for the coding hub: which client each executor asks for, the exact
 * variables envelope it sends - `codingProblems` UNWRAPS `request.filters`, which is the one place
 * a caller could pass the right object and get the wrong query - and the selections the solver and
 * the hub read. The transport is mocked; a real socket here would prove nothing.
 */

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

/** The document of the first sent operation, printed exactly as it would go onto the wire. */
const sentDocumentText = () => print(mocks.query.mock.calls[0][0].query as DocumentNode)

describe("queryCodingDomainSummary", () => {
    it("asks an authenticated client for the grouped counts and sends no variables", async () => {
        await queryCodingDomainSummary()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(Object.keys(mocks.query.mock.calls[0][0])).toEqual(["query"])
        expect(sentDocumentText()).toContain("codingDomainSummary")
        expect(sentDocumentText()).toContain("domains")
        expect(sentDocumentText()).toContain("total")
    })

    it("forwards the caller's headers, signal and debug flag to the client", async () => {
        const signal = new AbortController().signal
        await queryCodingDomainSummary({ headers: { "x-request-id": "req-1" }, signal, debug: true })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
    })
})

describe("queryCodingProblem", () => {
    it("sends the slug under request and selects the solver's full detail", async () => {
        await queryCodingProblem({ request: { slug: "two-sum" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { slug: "two-sum" } })
        for (const field of ["statement", "sampleTestcases", "starterCodes", "timeLimitMs", "memoryLimitKb"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })

    it("never asks for the hidden cases or a reference solution", async () => {
        await queryCodingProblem({ request: { slug: "two-sum" } })
        expect(sentDocumentText()).not.toContain("hiddenTestcases")
        expect(sentDocumentText()).not.toContain("solution")
    })

    it("returns the client's answer unchanged", async () => {
        const result = { data: { codingProblem: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryCodingProblem({ request: { slug: "two-sum" } })).resolves.toBe(result)
    })
})

describe("queryCodingProblems", () => {
    it("unwraps the caller's filters into the request variable", async () => {
        await queryCodingProblems({ request: { filters: { domain: "arrays", difficulty: "easy", page: 2, limit: 20 } } })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({
            request: { domain: "arrays", difficulty: "easy", page: 2, limit: 20 },
        })
    })

    it("sends an empty filter set when the caller passes nothing at all", async () => {
        await queryCodingProblems()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: {} })
    })

    it("selects the catalog row fields and not the statement", async () => {
        await queryCodingProblems()
        for (const field of ["slug", "difficulty", "domain", "points", "tags"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
        expect(sentDocumentText()).not.toContain("statement")
    })

    it("preserves transport failures for the catalog error state", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(queryCodingProblems()).rejects.toThrow("offline")
    })
})

describe("queryMyCodingProgress", () => {
    it("asks an authenticated client for the ids, the points and the per-domain rollup", async () => {
        await queryMyCodingProgress()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(Object.keys(mocks.query.mock.calls[0][0])).toEqual(["query"])
        for (const field of ["solvedProblemIds", "attemptedProblemIds", "revealedProblemIds", "totalPoints", "byDomain"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })

    it("forwards the abort signal so an unmounting hub releases the socket", async () => {
        const signal = new AbortController().signal
        await queryMyCodingProgress({ signal, headers: undefined, debug: false })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal,
            debug: false,
        })
    })
})
