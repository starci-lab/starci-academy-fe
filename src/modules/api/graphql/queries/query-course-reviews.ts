import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import {
    type QueryCourseReviewsRequest,
    type QueryCourseReviewsResponse,
} from "./types/course-reviews"

/**
 * One page of a course's reviews, and the rating behind them.
 *
 * ANONYMOUS ON PURPOSE. Reviews are what somebody consults BEFORE buying, so requiring a session
 * would hide them from exactly the reader they exist for. The server's resolver carries no guard
 * for the same reason.
 *
 * THE MEAN IS NOT COMPUTED FROM `nodes`. It is served by a CDC-fed projection over every review the
 * course has, so a page of ten cannot answer it and must not try - averaging what is on screen
 * would give a different number on every page.
 *
 * `offset` rather than a page number: a page number carries a base, and two callers can disagree
 * about whether the first page is 0 or 1 while both look correct. This repository already carries
 * that disagreement elsewhere; it is not worth reproducing in a new door.
 */
const query1 = gql`
    query CourseReviews($request: CourseReviewsRequest!) {
        courseReviews(request: $request) {
            success
            message
            error
            data {
                total
                averageScore
                nodes {
                    id
                    score
                    body
                    userId
                    createdAt
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCourseReviews {
    /** One page plus the whole-population rating. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryCourseReviewsMap: Record<QueryCourseReviews, DocumentNode> = {
    [QueryCourseReviews.Query1]: query1,
}

/** Fetches one page of a course's reviews with its rating. */
export const queryCourseReviews = async ({
    query = QueryCourseReviews.Query1,
    request,
    headers,
    signal,
    debug,
}: QueryParams<QueryCourseReviews, QueryCourseReviewsRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: false, headers, signal, debug })
    return apollo.query<QueryCourseReviewsResponse>({
        query: queryCourseReviewsMap[query],
        variables: { request },
    })
}
