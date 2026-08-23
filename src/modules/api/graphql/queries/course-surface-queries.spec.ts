import { beforeEach, describe, expect, it, vi } from "vitest"
import { type DocumentNode, print } from "graphql"
import { QueryCourse, queryCourse, queryCourseMap } from "./query-course"
import { QueryModule, queryModule, queryModuleMap } from "./query-module"
import { QueryCourseLeaderboard, queryCourseLeaderboard } from "./query-course-leaderboard"
import { QueryCourseMindMap, queryCourseMindMap } from "./query-course-mind-map"
import {
    QueryCoursePricePreview,
    queryCoursePricePreview,
    queryCoursePricePreviewMap,
} from "./query-course-price-preview"
import { QueryCourseQaComments, queryCourseQaComments } from "./query-course-qa-comments"
import { QueryCourseReviews, queryCourseReviews, queryCourseReviewsMap } from "./query-course-reviews"
import {
    QueryCoursesCheckoutPreview,
    queryCoursesCheckoutPreview,
    queryCoursesCheckoutPreviewMap,
} from "./query-courses-checkout-preview"

/**
 * What these tests guard for the course surfaces: which of the three auth stances each executor
 * takes - the auth link ON, the auth link explicitly OFF for the anonymous reviews, and the ones
 * that name no stance at all and take the factory's own default - plus the two signatures that do
 * not look like their neighbours: the price preview lifts `courseId` OUT of the request, and the
 * checkout preview takes its request POSITIONALLY with the options second.
 */

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

/** The document of the first sent operation, printed exactly as it would go onto the wire. */
const sentDocumentText = () => print(mocks.query.mock.calls[0][0].query as DocumentNode)

describe("queryCourse", () => {
    it("defaults the variant and the request, and asks for the optional-auth link", async () => {
        await queryCourse()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryCourseMap[QueryCourse.Query1],
            variables: { request: {} },
        })
    })

    it("sends the route's display id and the caller's transport options", async () => {
        const signal = new AbortController().signal
        await queryCourse({
            query: QueryCourse.Query1,
            request: { displayId: "he-thong-phan-tan" },
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
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { displayId: "he-thong-phan-tan" } })
    })

    it("selects the complete curriculum summary and panel anatomy", async () => {
        await queryCourse()
        for (const field of [
            "minutesRead",
            "numChallenges",
            "description",
            "contentTier",
            "previewContents",
            "pricingPhases",
            "isEnrolled",
        ]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })

    it("preserves transport failures for the detail page error state", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(queryCourse({ request: { id: "course-1" } })).rejects.toThrow("offline")
    })
})

describe("queryModule", () => {
    it("defaults the variant and the request, and asks for the login-only link", async () => {
        await queryModule()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryModuleMap[QueryModule.Query1],
            variables: { request: {} },
        })
    })

    it("addresses one module by id and forwards the abort signal", async () => {
        const signal = new AbortController().signal
        await queryModule({
            query: QueryModule.Query1,
            request: { id: "module-1" },
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
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { id: "module-1" } })
    })

    it("returns the client's answer unchanged", async () => {
        const result = { data: { module: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryModule()).resolves.toBe(result)
    })
})

describe("queryCourseLeaderboard", () => {
    it("defaults the variant and sends the course scope with its window", async () => {
        await queryCourseLeaderboard({ request: { courseId: "course-1", limit: 10 } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { courseId: "course-1", limit: 10 } })
    })

    it("honours an explicitly named variant and forwards the caller's headers", async () => {
        await queryCourseLeaderboard({
            query: QueryCourseLeaderboard.Query1,
            request: { courseId: "course-1" },
            headers: { "x-request-id": "req-1" },
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal: undefined,
            debug: undefined,
        })
    })

    it("selects the viewer's own standing beside the top window", async () => {
        await queryCourseLeaderboard({ request: { courseId: "course-1" } })
        expect(sentDocumentText()).toContain("myRank")
        expect(sentDocumentText()).toContain("entries")
        expect(sentDocumentText()).toContain("computedAt")
        expect(sentDocumentText()).toContain("enrollmentId")
    })
})

describe("queryCourseMindMap", () => {
    it("names no auth stance, so the factory's own default decides the link chain", async () => {
        await queryCourseMindMap({ request: { courseId: "course-1" } })
        const options = mocks.createApolloClient.mock.calls[0][0]
        expect("withAuth" in options).toBe(false)
        expect(options).toEqual({ headers: undefined, signal: undefined, debug: undefined })
    })

    it("sends the course scope and forwards the caller's transport options", async () => {
        const signal = new AbortController().signal
        await queryCourseMindMap({
            query: QueryCourseMindMap.Query1,
            request: { courseId: "course-1" },
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { courseId: "course-1" } })
    })

    it("selects the server-computed positions and the cross-links a node opens", async () => {
        await queryCourseMindMap({ request: { courseId: "course-1" } })
        for (const field of ["position", "animated", "links", "popularity", "displayId"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })
})

describe("queryCoursePricePreview", () => {
    it("lifts the course id out of the request and onto its own variable", async () => {
        await queryCoursePricePreview({ query: QueryCoursePricePreview.Query1, request: { courseId: "course-1" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryCoursePricePreviewMap[QueryCoursePricePreview.Query1],
            variables: { courseId: "course-1" },
        })
    })

    it("sends an undefined course id rather than reading through a missing request", async () => {
        await queryCoursePricePreview()
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: undefined })
    })

    it("selects the phase story the detail modal narrates", async () => {
        await queryCoursePricePreview()
        for (const field of ["discountReason", "seatsRemainingInCurrentPhase", "nextPhasePriceVnd", "enrolledCount"]) {
            expect(sentDocumentText(), field).toContain(field)
        }
    })
})

describe("queryCourseQaComments", () => {
    it("defaults the variant and reuses the proven contentComments resolver", async () => {
        await queryCourseQaComments({ request: { courseId: "course-1", page: 1, limit: 10 } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({
            request: { courseId: "course-1", page: 1, limit: 10 },
        })
        expect(sentDocumentText()).toContain("contentComments(request: $request)")
    })

    it("honours an explicitly named variant when listing one question's replies", async () => {
        await queryCourseQaComments({
            query: QueryCourseQaComments.Query1,
            request: { parentCommentId: "comment-1" },
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request: { parentCommentId: "comment-1" } })
    })

    it("carries no reaction summary, unlike the lesson thread it shares a resolver with", async () => {
        await queryCourseQaComments({ request: { courseId: "course-1" } })
        expect(sentDocumentText()).toContain("isFounderAuthor")
        expect(sentDocumentText()).not.toContain("myReaction")
    })
})

describe("queryCourseReviews", () => {
    it("builds an explicitly anonymous client, because a buyer reads reviews before signing in", async () => {
        await queryCourseReviews()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: false,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryCourseReviewsMap[QueryCourseReviews.Query1],
            variables: { request: undefined },
        })
    })

    it("sends the offset window the page turner asks for", async () => {
        const signal = new AbortController().signal
        await queryCourseReviews({
            query: QueryCourseReviews.Query1,
            request: { courseId: "course-1", offset: 10, limit: 10 },
            headers: { "x-request-id": "req-1" },
            signal,
            debug: false,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: false,
            headers: { "x-request-id": "req-1" },
            signal,
            debug: false,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({
            request: { courseId: "course-1", offset: 10, limit: 10 },
        })
    })

    it("reads the whole-population mean from the server rather than the page on screen", async () => {
        const document = print(queryCourseReviewsMap[QueryCourseReviews.Query1])
        expect(document).toContain("averageScore")
        expect(document).toContain("total")
        expect(document).toContain("nodes")
    })
})

describe("queryCoursesCheckoutPreview", () => {
    it("takes the request positionally and defaults the whole options object", async () => {
        await queryCoursesCheckoutPreview({ courseIds: ["course-1", "course-2"] })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryCoursesCheckoutPreviewMap[QueryCoursesCheckoutPreview.Query1],
            variables: { request: { courseIds: ["course-1", "course-2"] } },
            fetchPolicy: "network-only",
        })
    })

    it("never serves a cached total, because the price is personal and time-sensitive", async () => {
        const signal = new AbortController().signal
        await queryCoursesCheckoutPreview(
            { courseIds: ["course-1"] },
            { query: QueryCoursesCheckoutPreview.Query1, headers: { "x-request-id": "req-1" }, signal, debug: true },
        )
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].fetchPolicy).toBe("network-only")
    })

    it("selects the per-line prices, the order totals and the offered terms", async () => {
        const document = print(queryCoursesCheckoutPreviewMap[QueryCoursesCheckoutPreview.Query1])
        for (const field of ["lines", "totalListVnd", "totalChargedVnd", "savingsVnd", "bundleBonusPercent", "installmentOptions"]) {
            expect(document, field).toContain(field)
        }
    })

    it("preserves transport failures so priced-out rows stay on screen", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(queryCoursesCheckoutPreview({ courseIds: ["course-1"] })).rejects.toThrow("offline")
    })
})
