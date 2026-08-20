import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { QueryMyCourses, queryMyCourses, queryMyCoursesMap } from "./query-my-courses"

/**
 * What these tests guard: the document that goes on the wire and the client it goes through.
 * The transport is replaced wholesale - no request is ever made - because the two failures
 * that matter here are decided before the network is involved: a field renamed away from the
 * back end's spelling, and a missing token on a query the server guards.
 */

const mocks = vi.hoisted(() => ({
    query: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

/** The document text of the only variant, as it would be printed onto the wire. */
const documentText = print(queryMyCoursesMap[QueryMyCourses.Query1])
const dashboardDocumentText = print(queryMyCoursesMap[QueryMyCourses.Query2])

beforeEach(() => {
    mocks.query.mockReset()
    mocks.query.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryMyCoursesMap", () => {
    it("names the operation so it is identifiable in a server log", () => {
        expect(documentText).toContain("query MyCourses")
    })

    it("selects the whole envelope, not just the payload", () => {
        expect(documentText).toContain("success")
        expect(documentText).toContain("message")
        expect(documentText).toContain("error")
    })

    it("selects every field the row type declares, spelled as the back end spells it", () => {
        expect(documentText).toContain("globalId")
        expect(documentText).toContain("label")
        expect(documentText).toContain("completionPercent")
    })

    it("selects nothing the row type does not declare", () => {
        for (const unread of ["thumbnailUrl", "contentTotal", "challengeTotal", "isEnrolled"]) {
            expect(documentText).not.toContain(unread)
        }
    })

    it("takes no arguments at all", () => {
        expect(documentText).not.toContain("$request")
    })

    it("keeps the full dashboard selection in a separate additive variant", () => {
        expect(dashboardDocumentText).toContain("query MyCoursesDashboard")
        for (const field of ["thumbnailUrl", "contentCompleted", "contentTotal", "challengeCompleted", "challengeTotal", "completed", "total", "isEnrolled"]) {
            expect(dashboardDocumentText).toContain(field)
        }
    })
})

describe("queryMyCourses", () => {
    it("sends the document for the default variant", async () => {
        await queryMyCourses()
        expect(mocks.query).toHaveBeenCalledTimes(1)
        expect(mocks.query.mock.calls[0][0]).toEqual({
            query: queryMyCoursesMap[QueryMyCourses.Query1],
        })
    })

    it("sends no variables, because the query declares none", async () => {
        await queryMyCourses()
        expect(mocks.query.mock.calls[0][0].variables).toBeUndefined()
    })

    it("builds an AUTHENTICATED client - the server refuses this query without a token", async () => {
        await queryMyCourses()
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("passes the abort signal through to the client", async () => {
        const controller = new AbortController()
        await queryMyCourses({ signal: controller.signal })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            signal: controller.signal,
        })
    })

    it("passes extra headers through to the client", async () => {
        await queryMyCourses({ headers: { "X-Locale": "en" } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({
            headers: { "X-Locale": "en" },
        })
    })

    it("returns whatever the client returned, unchanged", async () => {
        const result = { data: { myCourses: { success: true, message: "ok", data: [] } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryMyCourses()).resolves.toBe(result)
    })
})
