import { describe, expect, it } from "vitest"
import {
    SortBy,
    SortOrder,
    type GraphQLResponse,
    type PaginationFilters,
    type QueryParams,
    type QueryVariables,
} from "./types"

/**
 * What these tests guard: the enum strings are the wire strings. A GraphQL enum is compared
 * by value on the server, so renaming `ASC` to `asc` here would type-check perfectly and
 * fail only against a running back end - which is exactly the failure a unit test can catch.
 * The type assertions below compile or they do not; they are the test.
 */

describe("SortOrder", () => {
    it("spells the direction the way the server enum spells it", () => {
        expect(SortOrder.Asc).toBe("ASC")
        expect(SortOrder.Desc).toBe("DESC")
    })
})

describe("SortBy", () => {
    it("spells every sort key the way the server enum spells it", () => {
        expect(SortBy.Title).toBe("title")
        expect(SortBy.CreatedAt).toBe("createdAt")
        expect(SortBy.UpdatedAt).toBe("updatedAt")
    })
})

describe("GraphQLResponse", () => {
    it("carries a payload when the operation succeeded", () => {
        const response: GraphQLResponse<{ total: number }> = {
            success: true,
            message: "ok",
            data: { total: 2 },
        }
        expect(response.data?.total).toBe(2)
    })

    it("describes a failure with no payload at all", () => {
        const response: GraphQLResponse<{ total: number }> = {
            success: false,
            message: "nope",
            error: "FORBIDDEN",
        }
        expect(response.data).toBeUndefined()
        expect(response.error).toBe("FORBIDDEN")
    })
})

describe("PaginationFilters", () => {
    it("holds an ordered list of sort clauses", () => {
        const filters: PaginationFilters<SortBy> = {
            pageNumber: 0,
            limit: 10,
            sorts: [{ by: SortBy.Title, order: SortOrder.Asc }],
        }
        expect(filters.sorts[0]).toEqual({ by: "title", order: "ASC" })
    })
})

describe("QueryParams", () => {
    it("is usable with no options at all", () => {
        const params: QueryParams<string> = {}
        expect(params.query).toBeUndefined()
        expect(params.withAuth).toBeUndefined()
    })

    it("wraps variables under the single request argument", () => {
        const variables: QueryVariables<{ id: string }> = { request: { id: "course-1" } }
        expect(variables.request.id).toBe("course-1")
    })
})
