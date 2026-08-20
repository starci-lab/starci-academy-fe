import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One aggregate phase or question-kind score. */
export type MockInterviewStatsBreakdown = { readonly key: string; readonly avgScore: number; readonly avgMax: number }
/** Aggregate evidence for the setup statistics panel. */
export type MockInterviewStats = { readonly insufficientData: boolean; readonly byPhase: ReadonlyArray<MockInterviewStatsBreakdown> }
/** Course requested by the statistics panel. */
export type MyMockInterviewStatsRequest = { readonly courseId: string }
type Response = { readonly myMockInterviewStats: GraphQLResponse<MockInterviewStats> }

const document = gql`
    query MyMockInterviewStats($courseId: ID!) {
        myMockInterviewStats(courseId: $courseId) {
            success message error
            data { insufficientData byPhase { key avgScore avgMax } }
        }
    }
`

/** Supported aggregate-stat query documents. */
export enum QueryMyMockInterviewStats { Query1 = "query1" }

/** Read the authenticated viewer's aggregate interview evidence. */
export const queryMyMockInterviewStats = async ({ request, headers, signal, debug }: LookupQueryParams<QueryMyMockInterviewStats, MyMockInterviewStatsRequest>) =>
    createApolloClient({ withAuth: true, headers, signal, debug }).query<Response>({
        query: document,
        variables: { courseId: request.courseId },
    })
