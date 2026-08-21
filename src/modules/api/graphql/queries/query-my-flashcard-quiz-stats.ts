import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** Aggregate cloze quiz coverage for one course. */
export type FlashcardQuizStats = {
    readonly insufficientData: boolean
    readonly byTag: ReadonlyArray<{ readonly tag: string, readonly coverage: number }>
    readonly conceptCoverage: { readonly covered: number, readonly total: number } | null
}

const query = gql`
    query MyFlashcardQuizStats($courseId: ID!) {
        myFlashcardQuizStats(courseId: $courseId) {
            success message error
            data { insufficientData byTag { tag coverage } conceptCoverage { covered total } }
        }
    }
`

/** Reads aggregate cloze quiz coverage for one course. */
export const queryMyFlashcardQuizStats = async (courseId: string): Promise<FlashcardQuizStats | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<{ readonly myFlashcardQuizStats: GraphQLResponse<FlashcardQuizStats> }>({ query, variables: { courseId } })
    return response.data?.myFlashcardQuizStats.data ?? null
}
