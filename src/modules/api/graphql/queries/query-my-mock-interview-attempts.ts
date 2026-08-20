import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One completed mock-interview attempt used by the setup history panel. */
export type MockInterviewAttemptSummary = {
    readonly id: string
    readonly sessionId: string
    readonly promptTitle: string
    readonly name: string | null
    readonly overallScore: number
    readonly verdict: string
    readonly createdAt: string
}

/** Paginated completed attempts for one viewer and course. */
export type MockInterviewAttemptsPage = { readonly totalCount: number; readonly items: ReadonlyArray<MockInterviewAttemptSummary> }
/** Course window requested by the history panel. */
export type MyMockInterviewAttemptsRequest = { readonly courseId: string; readonly limit?: number; readonly offset?: number }
type Response = { readonly myMockInterviewAttempts: GraphQLResponse<MockInterviewAttemptsPage> }

const document = gql`
    query MyMockInterviewAttempts($courseId: ID!, $limit: Int, $offset: Int) {
        myMockInterviewAttempts(courseId: $courseId, limit: $limit, offset: $offset) {
            success message error
            data { totalCount items { id sessionId promptTitle name overallScore verdict createdAt } }
        }
    }
`

/** Supported completed-attempt query documents. */
export enum QueryMyMockInterviewAttempts { Query1 = "query1" }

/** Read the authenticated viewer's recent completed interviews. */
export const queryMyMockInterviewAttempts = async ({ request, headers, signal, debug }: LookupQueryParams<QueryMyMockInterviewAttempts, MyMockInterviewAttemptsRequest>) =>
    createApolloClient({ withAuth: true, headers, signal, debug }).query<Response>({
        query: document,
        variables: { courseId: request.courseId, limit: request.limit, offset: request.offset },
    })
