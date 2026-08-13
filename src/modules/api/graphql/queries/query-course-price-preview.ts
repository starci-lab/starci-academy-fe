import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import {
    type QueryCoursePricePreviewRequest,
    type QueryCoursePricePreviewResponse,
} from "./types/course-price-preview"

/**
 * What one course costs the ASKING learner.
 *
 * Required-auth, like `myCourses` and for the same kind of reason: the loyalty reduction is
 * computed from how many courses this learner already joined, so the server resolves the viewer
 * from the token and has no anonymous answer to give. A guest is not an error here - it simply has
 * no preview, and the catalog prices from the phase instead.
 *
 * ONE COURSE PER CALL, deliberately. The list query is cached by page and shared across surfaces;
 * folding a per-viewer price into it would make every catalog page a private answer and lose that.
 */
const query1 = gql`
    query CoursePricePreview($courseId: ID!) {
        coursePricePreview(courseId: $courseId) {
            success
            message
            error
            data {
                originalPriceVnd
                phasePriceVnd
                discountedPriceVnd
                discountPercent
                discountReason
                enrolledCount
                currentPhase
                nextPhase
                seatsRemainingInCurrentPhase
                nextPhasePriceVnd
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCoursePricePreview {
    /** The full price story the detail modal reads. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryCoursePricePreviewMap: Record<QueryCoursePricePreview, DocumentNode> = {
    [QueryCoursePricePreview.Query1]: query1,
}

/** Fetches one course's per-viewer price. */
export const queryCoursePricePreview = async ({
    query = QueryCoursePricePreview.Query1,
    request,
    headers,
    signal,
    debug,
}: QueryParams<QueryCoursePricePreview, QueryCoursePricePreviewRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryCoursePricePreviewResponse>({
        query: queryCoursePricePreviewMap[query],
        variables: { courseId: request?.courseId },
    })
}
