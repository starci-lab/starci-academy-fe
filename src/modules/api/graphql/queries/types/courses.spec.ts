import { describe, expect, it } from "vitest"
import { SortBy, SortOrder } from "../../types"
import {
    type CourseRow,
    type QueryCoursesRequest,
    type QueryCoursesResponse,
} from "./courses"

/**
 * What these tests guard: the three-word distinction the whole enrolment UI rests on -
 * `isEnrolled` is true, false, or unanswerable. Collapsing null into false would make every
 * guest look like a signed-in learner who has not enrolled, and the card would offer the
 * wrong action to everyone who is not logged in.
 */

/** A row with only the fields the document always returns. */
const minimalRow: CourseRow = {
    id: "course-1",
    displayId: "C-001",
    title: "Systems Design",
    slug: "systems-design",
    description: "How large systems are actually put together.",
    originalPrice: 1990000,
    enrollmentCount: 42,
}

describe("CourseRow", () => {
    it("is complete without the optional artwork", () => {
        expect(minimalRow.coverImageUrl).toBeUndefined()
    })

    it("distinguishes a guest from a signed-in learner who has not enrolled", () => {
        const guest: CourseRow = { ...minimalRow, isEnrolled: null }
        const signedOut: CourseRow = { ...minimalRow, isEnrolled: false }
        expect(guest.isEnrolled).toBeNull()
        expect(signedOut.isEnrolled).toBe(false)
        expect(guest.isEnrolled).not.toBe(signedOut.isEnrolled)
    })
})

describe("QueryCoursesRequest", () => {
    it("wraps the page window and sort clauses under filters", () => {
        const request: QueryCoursesRequest = {
            filters: {
                pageNumber: 0,
                limit: 12,
                sorts: [{ by: SortBy.Title, order: SortOrder.Asc }],
            },
        }
        expect(request.filters.limit).toBe(12)
        expect(request.filters.sorts).toHaveLength(1)
    })
})

describe("QueryCoursesResponse", () => {
    it("carries the total beside the page so a pager can be drawn", () => {
        const response: QueryCoursesResponse = {
            courses: {
                success: true,
                message: "ok",
                data: { count: 57, data: [minimalRow] },
            },
        }
        expect(response.courses.data?.count).toBe(57)
        expect(response.courses.data?.data).toHaveLength(1)
    })

    it("describes a failure with no page at all", () => {
        const response: QueryCoursesResponse = {
            courses: { success: false, message: "nope", error: "FORBIDDEN" },
        }
        expect(response.courses.data).toBeUndefined()
    })
})
