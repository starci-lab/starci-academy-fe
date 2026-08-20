import { beforeEach, describe, expect, it, vi } from "vitest"
import { type DocumentNode, print } from "graphql"
import { SortOrder } from "../types"
import { QueryFoundation, queryFoundation } from "./query-foundation"
import { QueryFoundations, queryFoundations } from "./query-foundations"
import { QueryFoundationCategories, queryFoundationCategories } from "./query-foundation-categories"

/**
 * What these tests guard for the foundations catalog: all three executors are PUBLIC doors and name
 * no auth stance at all, so the factory's own default decides the link chain. Asserting the absence
 * of the key rather than a false value is the point - `withAuth: false` and no `withAuth` read the
 * same at the call site and would diverge the day the factory's default changes.
 */

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

/** The document of the first sent operation, printed exactly as it would go onto the wire. */
const sentDocumentText = () => print(mocks.query.mock.calls[0][0].query as DocumentNode)

describe("queryFoundation", () => {
    it("names no auth stance and resolves one resource by its primary id", async () => {
        await queryFoundation({ request: { id: "foundation-1" } })
        const options = mocks.createApolloClient.mock.calls[0][0]
        expect("withAuth" in options).toBe(false)
        expect(options).toEqual({ headers: undefined, signal: undefined, debug: undefined })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { id: "foundation-1" } })
    })

    it("resolves by display id and forwards the caller's transport options", async () => {
        const signal = new AbortController().signal
        await queryFoundation({
            query: QueryFoundation.Query1,
            request: { displayId: "clean-architecture" },
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { displayId: "clean-architecture" } })
    })

    it("selects the envelope, the resource kind and its tags", async () => {
        await queryFoundation({ request: { id: "foundation-1" } })
        for (const field of ["success", "kind", "isRecommended", "thumbnailUrl", "categoryId", "tags"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })

    it("preserves transport failures for the resource error state", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(queryFoundation({ request: { id: "foundation-1" } })).rejects.toThrow("offline")
    })
})

describe("queryFoundations", () => {
    it("names no auth stance and sends the category scope with its page window", async () => {
        const request = {
            categoryId: "category-1",
            filters: { pageNumber: 0, limit: 12, search: "kafka", sorts: [{ by: "sortIndex" as const, order: SortOrder.Asc }] },
        }
        await queryFoundations({ request })
        const options = mocks.createApolloClient.mock.calls[0][0]
        expect("withAuth" in options).toBe(false)
        expect(options).toEqual({ headers: undefined, signal: undefined, debug: undefined })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request })
    })

    it("forwards the abort signal so a category switch releases the socket", async () => {
        const signal = new AbortController().signal
        await queryFoundations({
            query: QueryFoundations.Query1,
            request: { categoryId: "category-1" },
            headers: { "x-request-id": "req-1" },
            signal,
            debug: false,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            headers: { "x-request-id": "req-1" },
            signal,
            debug: false,
        })
    })

    it("reads the page count and rows from inside data, without the shared envelope", async () => {
        await queryFoundations({ request: { categoryId: "category-1" } })
        expect(sentDocumentText()).toContain("count")
        expect(sentDocumentText()).toContain("tags")
        expect(sentDocumentText()).not.toContain("success")
    })

    it("returns the client's answer unchanged", async () => {
        const result = { data: { foundations: { data: { count: 0, data: [] } } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryFoundations({ request: { categoryId: "category-1" } })).resolves.toBe(result)
    })
})

describe("queryFoundationCategories", () => {
    it("defaults the whole options object and sends an undefined request", async () => {
        await queryFoundationCategories()
        const options = mocks.createApolloClient.mock.calls[0][0]
        expect("withAuth" in options).toBe(false)
        expect(options).toEqual({ headers: undefined, signal: undefined, debug: undefined })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: undefined })
    })

    it("sends the caller's search and page window with the transport options", async () => {
        const signal = new AbortController().signal
        await queryFoundationCategories({
            query: QueryFoundationCategories.Query1,
            request: { pageNumber: 1, limit: 8, search: "he thong" },
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({
            request: { pageNumber: 1, limit: 8, search: "he thong" },
        })
    })

    it("declares the request argument as nullable, because the catalog opens unfiltered", async () => {
        await queryFoundationCategories()
        expect(sentDocumentText()).toContain("query FoundationCategories($request: FoundationCategoriesRequest)")
        for (const field of ["totalCount", "slug", "orderIndex", "sortIndex"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })
})
