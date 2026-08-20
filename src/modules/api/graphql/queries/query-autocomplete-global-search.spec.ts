import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    AUTOCOMPLETE_GLOBAL_SEARCH_DOCUMENT,
    queryAutocompleteGlobalSearch,
} from "./query-autocomplete-global-search"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("queryAutocompleteGlobalSearch", () => {
    it("selects all eight result buckets and canonical route fields", () => {
        const document = print(AUTOCOMPLETE_GLOBAL_SEARCH_DOCUMENT)
        for (const bucket of ["courses", "modules", "contents", "challenges", "flashcardDecks", "milestones", "milestoneTasks", "foundations"]) {
            expect(document).toContain(bucket)
        }
        expect(document).toContain("path")
        expect(document).toContain("parentPath")
        expect(document).toContain("isEnrolled")
        expect(document).toContain("isFree")
        expect(document).toContain("isPremium")
    })

    it("uses optional auth and sends request variables unchanged", async () => {
        const request = { query: "system", entities: ["CourseEntity" as const], size: 6 }
        await queryAutocompleteGlobalSearch(request)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.query).toHaveBeenCalledWith({
            query: AUTOCOMPLETE_GLOBAL_SEARCH_DOCUMENT,
            variables: { request },
            fetchPolicy: "no-cache",
        })
    })

    it("preserves transport failures for the SWR error state", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(queryAutocompleteGlobalSearch({ query: "system", size: 6 })).rejects.toThrow("offline")
    })
})
