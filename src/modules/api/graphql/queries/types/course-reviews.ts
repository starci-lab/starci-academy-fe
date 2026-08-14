import { type GraphQLResponse } from "../../types"

/** One learner's review, as the server returns it. */
export interface CourseReviewRow {
    /** Stable row id. */
    id: string
    /** Whole stars, one to five. */
    score: number
    /** What they wrote, absent when they only scored the course. */
    body?: string | null
    /** Who wrote it. */
    userId: string
    /** When they wrote it, so the list can read newest first. */
    createdAt: string
}

/**
 * One page of a course's reviews, with the aggregate that summarises all of them.
 *
 * The mean and the total describe the WHOLE population and come from a projection; the nodes are
 * one page. They travel together because the two are read together on every screen that shows
 * either, and splitting them would let a rating and the reviews under it disagree on screen while
 * both were individually correct.
 */
export interface CourseReviewsPage {
    /** The reviews on this page, newest first. */
    nodes: ReadonlyArray<CourseReviewRow>
    /** Total reviews on the course, across every page. */
    total: number
    /** Mean score across every review; zero when the course has none. */
    averageScore: number
}

/** The single `request` argument the `courseReviews` query declares. */
export interface QueryCourseReviewsRequest {
    /** Which course's reviews to list. */
    courseId: string
    /** How many rows to skip. An offset rather than a page number: an offset has no base to disagree about. */
    offset?: number
    /** How many rows to return. The server clamps it. */
    limit?: number
}

/** What the `courseReviews` query answers with. */
export interface QueryCourseReviewsResponse {
    /** The wrapped page. */
    courseReviews: GraphQLResponse<CourseReviewsPage>
}
