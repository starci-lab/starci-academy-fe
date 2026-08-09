import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { SortBy, SortOrder } from "../types"
import {
    QueryCourses,
    defaultCoursesSorts,
    queryCourses,
    queryCoursesMap,
} from "./query-courses"

/**
 * What these tests guard: the document, the variables envelope, and the fact that this query
 * asks for the auth link while the public one does not. The transport is mocked out entirely;
 * a network call here would prove nothing and would make the suite depend on a running API.
 */

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(queryCoursesMap[QueryCourses.Query1])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryCoursesMap", () => {
    it("declares the request variable the server expects", () => {
        expect(documentText).toContain("query Courses($request: CoursesRequest!)")
        expect(documentText).toContain("courses(request: $request)")
    })

    it("selects the envelope, the total and the rows", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("count")
    })

    it("selects exactly the fields the row type declares", () => {
        for (const field of [
            "id",
            "displayId",
            "title",
            "slug",
            "description",
            "coverImageUrl",
            "originalPrice",
            "enrollmentCount",
            "isEnrolled",
        ]) {
            expect(documentText, field).toContain(field)
        }
    })

    it("does not reach into the related graphs a list card never renders", () => {
        expect(documentText).not.toContain("pricingPhases")
        expect(documentText).not.toContain("valuePropositions")
        expect(documentText).not.toContain("lessons")
    })
})

describe("defaultCoursesSorts", () => {
    it("always sorts, so paging cannot shuffle rows between pages", () => {
        expect(defaultCoursesSorts).toEqual([{ by: SortBy.Title, order: SortOrder.Asc }])
    })
})

describe("queryCourses", () => {
    it("sends the document and wraps variables under request", async () => {
        const request = {
            filters: { pageNumber: 1, limit: 5, sorts: defaultCoursesSorts },
        }
        await queryCourses({ request })
        expect(mocks.query.mock.calls[0][0]).toEqual({
            query: queryCoursesMap[QueryCourses.Query1],
            variables: { request },
        })
    })

    it("falls back to the default sort when the caller sends no filters", async () => {
        await queryCourses()
        expect(mocks.query.mock.calls[0][0].variables).toEqual({
            request: { filters: { sorts: defaultCoursesSorts } },
        })
    })

    it("asks for the auth link, because the server answers optional-auth", async () => {
        await queryCourses()
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("passes the abort signal through to the client", async () => {
        const controller = new AbortController()
        await queryCourses({ signal: controller.signal })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { courses: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryCourses()).resolves.toBe(result)
    })
})
