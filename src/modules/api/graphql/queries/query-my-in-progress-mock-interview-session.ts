import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One persisted interviewer or candidate transcript turn. */
export type MockInterviewTurn = {
    readonly role: string
    readonly phase: string
    readonly content: string
    readonly questionIndex?: number
    readonly artifactHint?: string | null
}

/** One backend-drawn question and its optional authored code variants. */
export type MockInterviewSeedQuestion = {
    readonly cardId: string
    readonly kind: string
    readonly title: string
    readonly givenCodes: ReadonlyArray<{ readonly lang: string; readonly code: string }>
}

/** Durable interview state returned for resume and deadline enforcement. */
export type InProgressMockInterviewSession = {
    readonly sessionId: string
    readonly promptId: string
    readonly promptTitle: string
    readonly name?: string | null
    readonly level?: string | null
    readonly difficulty: string
    readonly source: string
    readonly mode?: string | null
    readonly seedQuestions: ReadonlyArray<MockInterviewSeedQuestion>
    readonly turns?: ReadonlyArray<MockInterviewTurn> | null
    readonly questionIndex: number
    readonly phaseIndex: number
    readonly updatedAt: string
    readonly deadlineAt: string
}

/** GraphQL envelope returned by the in-progress lookup. */
export type QueryMyInProgressMockInterviewSessionResponse = {
    readonly myInProgressMockInterviewSession: GraphQLResponse<InProgressMockInterviewSession | null>
}

/** Course scope required by the in-progress lookup. */
export type MyInProgressMockInterviewSessionRequest = { readonly courseId: string }

const query1 = gql`
    query MyInProgressMockInterviewSession($courseId: ID!) {
        myInProgressMockInterviewSession(courseId: $courseId) {
            success
            message
            error
            data {
                sessionId
                promptId
                promptTitle
                name
                level
                difficulty
                source
                mode
                seedQuestions { cardId kind title givenCodes { lang code } }
                turns { role phase content questionIndex artifactHint }
                questionIndex
                phaseIndex
                updatedAt
                deadlineAt
            }
        }
    }
`

/** Supported documents for the in-progress lookup family. */
export enum QueryMyInProgressMockInterviewSession {
    Query1 = "query1",
}

/** Document registry for the in-progress lookup family. */
export const queryMyInProgressMockInterviewSessionMap: Record<QueryMyInProgressMockInterviewSession, DocumentNode> = {
    [QueryMyInProgressMockInterviewSession.Query1]: query1,
}

/** Execute the authenticated in-progress interview lookup. */
export const queryMyInProgressMockInterviewSession = async ({
    query = QueryMyInProgressMockInterviewSession.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryMyInProgressMockInterviewSession, MyInProgressMockInterviewSessionRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyInProgressMockInterviewSessionResponse>({
        query: queryMyInProgressMockInterviewSessionMap[query],
        variables: { courseId: request.courseId },
    })
}
