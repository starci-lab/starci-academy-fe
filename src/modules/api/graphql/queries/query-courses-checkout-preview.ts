import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import {
    type QueryCoursesCheckoutPreviewRequest,
    type QueryCoursesCheckoutPreviewResponse,
} from "./types/courses-checkout-preview"

/**
 * What a set of courses costs when bought together.
 *
 * IT IS A SEPARATE REQUEST FROM THE CART, deliberately. The rows and their price arrive
 * independently, so a cart whose lines have loaded and whose totals have not is a real state the
 * surface renders rather than a bug it hides - and a failure to price does not blank rows that are
 * already true.
 *
 * THE PRICE IS PERSONAL, so this is required-auth: loyalty depends on what the viewer already owns.
 */
const query1 = gql`
    query CoursesCheckoutPreview($request: CoursesCheckoutPreviewRequest!) {
        coursesCheckoutPreview(request: $request) {
            success
            message
            error
            data {
                lines { courseId listVnd chargedVnd discountPercent }
                totalListVnd
                totalChargedVnd
                savingsVnd
                bundleBonusPercent
                itemCount
                installmentOptions { months markupPercent totalAmountVnd monthlyAmountVnd }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCoursesCheckoutPreview {
    /** The cart selection: per-line prices, order totals, and the offered terms. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryCoursesCheckoutPreviewMap: Record<QueryCoursesCheckoutPreview, DocumentNode> = {
    [QueryCoursesCheckoutPreview.Query1]: query1,
}

/** Prices a set of courses as one order. Always sends the bearer token. */
export const queryCoursesCheckoutPreview = async (
    request: QueryCoursesCheckoutPreviewRequest,
    {
        query = QueryCoursesCheckoutPreview.Query1,
        headers,
        signal,
        debug,
    }: QueryParams<QueryCoursesCheckoutPreview> = {},
) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryCoursesCheckoutPreviewResponse>({
        query: queryCoursesCheckoutPreviewMap[query],
        variables: { request },
        fetchPolicy: "network-only",
    })
}
