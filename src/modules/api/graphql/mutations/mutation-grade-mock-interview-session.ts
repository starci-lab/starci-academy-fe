import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { MockInterviewMutationOptions } from "./mutation-start-mock-interview-session"
import type { MockInterviewAttempt, MockInterviewQuestionReview, MockInterviewScore, MockInterviewPhaseScore } from "../queries/query-mock-interview-attempt-by-session"
import type { MockInterviewTurn } from "../queries/query-my-in-progress-mock-interview-session"

/** Completed transcript and model selection accepted by final grading. */
export type GradeMockInterviewSessionRequest = {
    readonly courseId: string
    readonly promptId: string
    readonly promptTitle: string
    readonly level?: string
    readonly turns: ReadonlyArray<Omit<MockInterviewTurn, "artifactHint">>
    readonly sessionId: string
    readonly selectedModel?: string
    readonly selectedModelProvider?: string
}

/** Grade payload returned immediately after successful final grading. */
export type MockInterviewGrade = Pick<MockInterviewAttempt,
    "overallScore" | "verdict" | "strengths" | "gaps" | "followUpQuestion" | "matchedContentIds"
> & {
    readonly phaseScores: ReadonlyArray<MockInterviewPhaseScore>
    readonly attributeScores: ReadonlyArray<MockInterviewScore>
    readonly questionReviews: ReadonlyArray<MockInterviewQuestionReview>
}

/** GraphQL envelope returned by final grading. */
export type MutationGradeMockInterviewSessionResponse = {
    readonly gradeMockInterviewSession: GraphQLResponse<MockInterviewGrade>
}

/** GraphQL document for final interview grading. */
export const gradeMockInterviewSessionDocument: DocumentNode = gql`
    mutation GradeMockInterviewSession($request: GradeMockInterviewSessionRequest!) {
        gradeMockInterviewSession(request: $request) {
            success message error
            data {
                overallScore verdict
                phaseScores { phase score max }
                attributeScores { key score }
                strengths gaps followUpQuestion matchedContentIds
                questionReviews {
                    questionIndex kind question candidateAnswer modelAnswer feedback score max matchedContentId
                }
            }
        }
    }
`

/** Execute final grading for one enrolled viewer-owned session. */
export const mutationGradeMockInterviewSession = async (
    request: GradeMockInterviewSessionRequest,
    options: MockInterviewMutationOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationGradeMockInterviewSessionResponse>({
        mutation: gradeMockInterviewSessionDocument,
        variables: { request },
    })
}
