import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One named scoring attribute in a completed attempt. */
export type MockInterviewScore = { readonly key: string; readonly score: number }
/** One phase or question score in a completed attempt. */
export type MockInterviewPhaseScore = { readonly phase: string; readonly score: number; readonly max: number }
/** Backend-authored review of one candidate answer. */
export type MockInterviewQuestionReview = {
    readonly questionIndex: number
    readonly kind: string
    readonly question: string
    readonly candidateAnswer: string
    readonly modelAnswer: string | null
    readonly feedback: string
    readonly score: number
    readonly max: number
    readonly matchedContentId: string | null
}

/** Persisted graded result for one interview session. */
export type MockInterviewAttempt = {
    readonly id: string
    readonly sessionId: string
    readonly promptId: string
    readonly promptTitle: string
    readonly name?: string | null
    readonly level?: string | null
    readonly mode?: string | null
    readonly overallScore: number
    readonly verdict: string
    readonly phaseScores: ReadonlyArray<MockInterviewPhaseScore>
    readonly attributeScores: ReadonlyArray<MockInterviewScore>
    readonly strengths: ReadonlyArray<string>
    readonly gaps: ReadonlyArray<string>
    readonly followUpQuestion?: string | null
    readonly matchedContentIds: ReadonlyArray<string>
    readonly questionReviews: ReadonlyArray<MockInterviewQuestionReview>
    readonly createdAt: string
}

/** GraphQL envelope returned by the attempt lookup. */
export type QueryMockInterviewAttemptBySessionResponse = {
    readonly myMockInterviewAttemptBySessionId: GraphQLResponse<MockInterviewAttempt | null>
}

/** Course and session identity required by the attempt lookup. */
export type MockInterviewAttemptBySessionRequest = {
    readonly courseId: string
    readonly sessionId: string
}

const query1 = gql`
    query MyMockInterviewAttemptBySessionId($courseId: ID!, $sessionId: ID!) {
        myMockInterviewAttemptBySessionId(courseId: $courseId, sessionId: $sessionId) {
            success
            message
            error
            data {
                id sessionId promptId promptTitle name level mode overallScore verdict
                phaseScores { phase score max }
                attributeScores { key score }
                strengths gaps followUpQuestion matchedContentIds
                questionReviews {
                    questionIndex kind question candidateAnswer modelAnswer feedback score max matchedContentId
                }
                createdAt
            }
        }
    }
`

/** Supported documents for the attempt lookup family. */
export enum QueryMockInterviewAttemptBySession {
    Query1 = "query1",
}

/** Document registry for the attempt lookup family. */
export const queryMockInterviewAttemptBySessionMap: Record<QueryMockInterviewAttemptBySession, DocumentNode> = {
    [QueryMockInterviewAttemptBySession.Query1]: query1,
}

/** Execute the authenticated attempt lookup. */
export const queryMockInterviewAttemptBySession = async ({
    query = QueryMockInterviewAttemptBySession.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryMockInterviewAttemptBySession, MockInterviewAttemptBySessionRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMockInterviewAttemptBySessionResponse>({
        query: queryMockInterviewAttemptBySessionMap[query],
        variables: { courseId: request.courseId, sessionId: request.sessionId },
    })
}
