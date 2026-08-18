import { beforeEach, describe, expect, it, vi } from "vitest"
import { type DocumentNode, print } from "graphql"
import { QueryConsultants, queryConsultants } from "./query-consultants"
import { QueryHeadhuntingCompanies, queryHeadhuntingCompanies } from "./query-headhunting-companies"
import { QueryHeadhuntingCompany, queryHeadhuntingCompany } from "./query-headhunting-company"
import {
    QueryHeadhuntingCompanySuggestions,
    queryHeadhuntingCompanySuggestions,
} from "./query-headhunting-company-suggestions"

/**
 * What these tests guard for the headhunting directory: every executor builds the AUTHENTICATED
 * client, because contact truth is viewer-gated - an anonymous client would return a roster whose
 * `contactUnlocked` is somebody else's answer - and the directory listing sends NO variables at all,
 * which is what makes its ordering the backend's business rather than a caller's.
 */

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

/** The document of the first sent operation, printed exactly as it would go onto the wire. */
const sentDocumentText = () => print(mocks.query.mock.calls[0][0].query as DocumentNode)

describe("queryConsultants", () => {
    it("defaults the variant and sends the company scope with its server-side ordering", async () => {
        const request = {
            companyId: "company-1",
            filters: { pageNumber: 0, limit: 12, sorts: [{ by: "sortIndex" as const, order: "ASC" as const }] },
        }
        await queryConsultants({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request })
    })

    it("honours an explicitly named variant and forwards the caller's transport options", async () => {
        const signal = new AbortController().signal
        await queryConsultants({
            query: QueryConsultants.Query1,
            request: { companyId: "company-1" },
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { companyId: "company-1" } })
    })

    it("selects the gate flag beside the contact fields it gates", async () => {
        await queryConsultants({ request: { companyId: "company-1" } })
        for (const field of ["contactUnlocked", "cvScoreUnlockThreshold", "zaloNumber", "phoneNumber", "linkedinUrl"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })

    it("preserves transport failures for the roster error state", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(queryConsultants({ request: { companyId: "company-1" } })).rejects.toThrow("offline")
    })
})

describe("queryHeadhuntingCompanies", () => {
    it("defaults the variant and the whole options object, and sends no variables", async () => {
        await queryHeadhuntingCompanies()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(Object.keys(mocks.query.mock.calls[0][0])).toEqual(["query"])
        expect(sentDocumentText()).toContain("query HeadhuntingCompanies")
    })

    it("honours an explicitly named variant and forwards the abort signal", async () => {
        const signal = new AbortController().signal
        await queryHeadhuntingCompanies({
            query: QueryHeadhuntingCompanies.Query1,
            headers: { "x-request-id": "req-1" },
            signal,
            debug: false,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal,
            debug: false,
        })
    })

    it("selects the directory card fields and the backend's own ordering key", async () => {
        await queryHeadhuntingCompanies()
        for (const field of ["displayId", "logoUrl", "websiteUrl", "facebookUrl", "sortIndex"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })

    it("returns the client's answer unchanged", async () => {
        const result = { data: { headhuntingCompanies: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryHeadhuntingCompanies()).resolves.toBe(result)
    })
})

describe("queryHeadhuntingCompany", () => {
    it("defaults the variant and resolves one company by its route id", async () => {
        await queryHeadhuntingCompany({ request: { id: "company-1" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { id: "company-1" } })
        expect(sentDocumentText()).toContain("headhuntingCompany(request: $request)")
    })

    it("honours an explicitly named variant and resolves by display id instead", async () => {
        await queryHeadhuntingCompany({
            query: QueryHeadhuntingCompany.Query1,
            request: { displayId: "starci" },
            headers: { "x-request-id": "req-1" },
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { displayId: "starci" } })
    })
})

describe("queryHeadhuntingCompanySuggestions", () => {
    it("defaults the variant and sends the typed term with its limit", async () => {
        await queryHeadhuntingCompanySuggestions({ request: { query: "star", limit: 5 } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { query: "star", limit: 5 } })
    })

    it("honours an explicitly named variant and forwards the abort signal a typeahead cancels with", async () => {
        const signal = new AbortController().signal
        await queryHeadhuntingCompanySuggestions({
            query: QueryHeadhuntingCompanySuggestions.Query1,
            request: { query: "star" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal,
            debug: true,
        })
    })

    it("selects only the id and label a suggestion row renders", async () => {
        await queryHeadhuntingCompanySuggestions({ request: { query: "star" } })
        expect(sentDocumentText()).toContain("label")
        expect(sentDocumentText()).not.toContain("description")
        expect(sentDocumentText()).not.toContain("logoUrl")
    })
})
